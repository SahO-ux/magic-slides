export class HttpError extends Error {
  constructor(status = 500, body = { error: "internal_error" }) {
    super(body?.message || body?.error || "HttpError");
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}
