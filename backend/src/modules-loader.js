import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Global Containers
export const controllers = {};
export const services = {};

/**
 * This loader supports multiple model systems (Sequelize, mongoose, or plain objects)
 * It no longer strictly requires mongoose; instead it checks for the existence
 * of expected name keys: controllerName / serviceName.
 */
const loadRelevantFile = async (file, folderPath, globalContainers) => {
  const fileUrl = pathToFileURL(path.join(folderPath, file)).href;
  const { default: relevantFile } = await import(fileUrl);

  const baseFileName = path.parse(file).name;
  const type = baseFileName.substring(baseFileName.lastIndexOf("-") + 1);

  const nameKey = `${type}Name`;

  if (!relevantFile || !relevantFile[nameKey]) {
    throw new Error(`Invalid or missing export ${nameKey} in ${file}`);
  }

  const containerKey = type + "s"; // controllers/services
  globalContainers[containerKey][relevantFile[nameKey]] = relevantFile;
};

export const loadModules = async (app) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const modulesDir = path.join(__dirname, "..", "modules");
  if (!fs.existsSync(modulesDir)) {
    console.warn("No modules directory found at", modulesDir);
    return;
  }

  const folders = fs.readdirSync(modulesDir);
  const acceptedFileTypes = ["-controller.js", "-service.js"];
  const globalContainers = { controllers, services };
  const registeredRoutes = [];

  const folderImportPromises = folders.map(async (folder) => {
    const folderPath = path.join(modulesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    const files = fs.readdirSync(folderPath);

    const relevantFiles = files.filter((file) =>
      acceptedFileTypes.some((val) => file.endsWith(val))
    );

    await Promise.all(
      relevantFiles.map((file) =>
        loadRelevantFile(file, folderPath, globalContainers).catch((err) => {
          console.error(`❌ Failed to load ${file}:`, err.message);
          process.exit(1);
        })
      )
    );

    // ----- Load routes if index.js exists -----
    const indexFile = path.join(folderPath, "index.js");
    if (fs.existsSync(indexFile)) {
      try {
        const moduleUrl = pathToFileURL(indexFile).href;
        const { default: routeIndexFile } = await import(moduleUrl);

        if (app && "indexRoute" in routeIndexFile && routeIndexFile.router) {
          app.use(routeIndexFile.indexRoute, routeIndexFile.router);
          registeredRoutes.push(routeIndexFile.indexRoute);
        }
      } catch (err) {
        console.error(
          `❌ Failed to load routes from module ${folder}:`,
          err.message
        );
        process.exit(1);
      }
    }
  });

  await Promise.all(folderImportPromises);

  Object.entries(globalContainers).forEach(([containerName, container]) => {
    const keys = Object.keys(container);
    if (keys.length > 0) {
      console.log(`✅ Loaded ${containerName}: ${keys.join(", ")}`);
    }
  });

  if (registeredRoutes.length > 0) {
    console.log(`✅ Loaded Routes: ${registeredRoutes.join(", ")}`);
  }
};
