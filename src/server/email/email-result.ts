import "server-only";

/** Result of a transactional email send (verification, new-message alert). */
export interface EmailResult {
  message: string;
  success: boolean;
}
