export class BaseError extends Error {
  statusCode: string;
  constructor(name, statusCode) {
    super();
    this.name = name;
    this.statusCode = statusCode;
  }
}
