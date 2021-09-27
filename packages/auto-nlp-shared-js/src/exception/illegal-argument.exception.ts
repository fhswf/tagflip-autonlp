export class IllegalArgumentException extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, IllegalArgumentException.prototype);
  }

  getMessage() {
    return this.message;
  }
}
