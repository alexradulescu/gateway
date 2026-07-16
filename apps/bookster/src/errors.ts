export function booksterErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error && typeof error.data === "string") {
    return error.data;
  }
  if (error instanceof Error && error.message) {
    const domainMessage = error.message.match(/Uncaught (?:Error|ConvexError): ([^\n]+)/u)?.[1];
    if (domainMessage) return domainMessage;
    if (!error.message.startsWith("[CONVEX")) return error.message;
  }
  return fallback;
}
