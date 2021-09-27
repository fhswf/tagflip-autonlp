export class RunNotStoppableException extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, RunNotStoppableException.prototype);
  }

  getMessage() {
    return this.message;
  }
}
