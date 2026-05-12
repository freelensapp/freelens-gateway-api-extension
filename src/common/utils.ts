export function maybe<T>(wrapped: () => T): T | null {
  try {
    return wrapped();
  } catch (error) {
    return null;
  }
}
