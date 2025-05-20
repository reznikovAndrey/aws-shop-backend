export enum ApiErrors {
  BAD_REQUEST = "BadRequestError",
  SERVER_ERROR = "ServerError",
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ApiErrors.BAD_REQUEST;
  }
}

export class ServerError extends Error {
  constructor(message: string = "Server error") {
    super(message);
    this.name = ApiErrors.SERVER_ERROR;
  }
}
