// Errors the API sends to clients. Each has a stable `code` the frontend
// translates, plus optional `params` for the message.
export class AppError extends Error {
  constructor(code, params = {}) {
    super(code);
    this.code = code;
    this.params = params;
  }
}

export const unauthenticated = () => new AppError('UNAUTHENTICATED');
export const forbidden = () => new AppError('FORBIDDEN');
export const notFound = () => new AppError('NOT_FOUND');
