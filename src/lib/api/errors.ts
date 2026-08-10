/** Normalized API error carrying an HTTP status code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") =>
    new ApiError(401, msg, "unauthorized"),
  forbidden: (msg = "You do not have permission to do this") =>
    new ApiError(403, msg, "forbidden"),
  notFound: (msg = "Resource not found") => new ApiError(404, msg, "not_found"),
  badRequest: (msg = "Invalid request") => new ApiError(400, msg, "bad_request"),
};
