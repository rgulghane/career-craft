import "server-only";

export class EnrollmentError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "EnrollmentError";
  }
}
