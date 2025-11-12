// Auth utility functions for Replit Auth
// Reference: Replit Auth blueprint
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}
