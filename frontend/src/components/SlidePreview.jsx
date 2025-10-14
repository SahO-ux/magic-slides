import React from "react";
import pptxgen from "pptxgenjs";

export default function SlidePreview({ slidesJson }) {
  if (!slidesJson) {
    return (
      <div className="mt-8">
        <div className="rounded-lg border p-6 bg-white">
          <h3 className="text-lg font-medium">No presentation yet</h3>
          <p className="text-sm text-gray-600 mt-2">
            Send a prompt from the left to generate slides.
          </p>
        </div>
      </div>
    );
  }

  const downloadPpt = async () => {
    const pres = new pptxgen();
    pres.author = "MagicSlides AI";
    pres.title = slidesJson.title || "Presentation";

    (slidesJson.slides || []).forEach((s) => {
      const slide = pres.addSlide();
      // layout: big title + bullets
      slide.addText(s.title || "", {
        x: 0.5,
        y: 0.4,
        fontSize: 28,
        bold: true,
        color: "363636",
      });

      if (s.bullets && s.bullets.length) {
        slide.addText(s.bullets.map((b) => "• " + b).join("\n"), {
          x: 0.6,
          y: 1.2,
          fontSize: 16,
          color: "666666",
          bullet: false,
        });
      }

      if (s.image) {
        try {
          slide.addImage({ data: s.image, x: 6.0, y: 0.6, w: 3.0, h: 2.5 });
        } catch (err) {
          // ignore image if invalid
        }
      }
    });

    await pres.writeFile({
      fileName: (slidesJson.title || "presentation") + ".pptx",
    });
  };

  const generatePptxFromSlides = async () => {
    const pres = new pptxgen();
    pres.author = "MagicSlides AI";
    pres.title = slidesJson.title || "Presentation";

    // IMP Guard Clause: Prevent generating excessively large PPTs
    const MAX_TOTAL_SLIDES = 50;
    if ((slidesJson.slides || []).length > MAX_TOTAL_SLIDES) {
      console.warn(
        `Trimming slides to first ${MAX_TOTAL_SLIDES} to prevent overflow.`
      );
      slidesJson.slides = slidesJson.slides.slice(0, MAX_TOTAL_SLIDES);
    }

    // Constants for potential fine-tuning (currently unused)
    const MIN_BULLET_FONT = 10;
    const SLIDE_W = pres.layout?.width || 10; // pptxgenjs default inches
    const SLIDE_H = pres.layout?.height || 5.63;

    const TITLE_FONT = 28;
    const BULLET_FONT = 16;
    const MAX_BULLETS_PER_BOX = 6; // tune to prevent overflow

    (slidesJson.slides || []).forEach((s) => {
      // If a slide has many bullets, split them across multiple slides
      const bullets = s.bullets || [];
      const chunks = [];
      for (let i = 0; i < bullets.length; i += MAX_BULLETS_PER_BOX) {
        chunks.push(bullets.slice(i, i + MAX_BULLETS_PER_BOX));
      }
      // If no bullets, still ensure at least one iteration to render title and image
      if (chunks.length === 0) chunks.push([]);

      chunks.forEach((chunk) => {
        const slide = pres.addSlide();

        // Title: top-left large
        slide.addText(s.title || "", {
          x: 0.5,
          y: 0.4,
          w: 6.5, // width in inches - allow line wrap
          h: 1.0,
          fontSize: TITLE_FONT,
          bold: true,
          color: "363636",
        });

        // Right side image (if any) — put image on right column
        if (s.image) {
          try {
            slide.addImage({ data: s.image, x: 7.2, y: 0.6, w: 2.0, h: 2.0 });
          } catch (e) {
            // ignore if image invalid
            console.warn("Invalid slide image", e);
          }
        }

        // Body box left column
        let fontSize = BULLET_FONT;

        // Heuristic: reduce font size if many bullets or long text
        const estimatedChars = chunk.join(" ").length;
        if (estimatedChars > 600) fontSize = 12;
        if (estimatedChars > 1200) fontSize = 10;

        let textForBox = chunk.map((b) => "• " + b).join("\n\n");

        // If text still very long, split across additional slides (we already chunked)
        slide.addText(textForBox, {
          x: 0.5,
          y: 1.3,
          w: 6.5,
          h: 3.5,
          fontSize,
          color: "333333",
          valign: "top",
          margin: 0.1,
        });

        // For the last chunk, you might also add slide number or footer
      });
    });

    // Write file
    await pres.writeFile({
      fileName: `${slidesJson.title || "presentation"}.pptx`,
    });
  };

  return (
    <div>
      <div className="rounded-lg bg-white border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {slidesJson.title || "Untitled Presentation"}
            </h2>
            <p className="text-xs text-gray-500">
              {(slidesJson.slides || []).length} slides
            </p>
          </div>
          <div>
            <button
              onClick={generatePptxFromSlides}
              className="px-3 py-1 border rounded"
            >
              Download PPTX
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {(slidesJson.slides || []).map((s, idx) => (
          <div key={idx} className="bg-white rounded-lg border p-4">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center font-semibold text-gray-500">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-medium">{s.title}</h3>
                <ul className="list-disc list-inside text-sm mt-2 text-gray-700">
                  {(s.bullets || []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
