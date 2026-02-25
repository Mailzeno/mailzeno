function isTransientError(error: any) {
  const responseCode = error?.responseCode

  // SMTP temporary errors (4xx)
  if (responseCode && responseCode >= 400 && responseCode < 500) {
    return true
  }

  // Network / timeout errors
  if (
    error?.code === "ETIMEDOUT" ||
    error?.code === "ECONNECTION"
  ) {
    return true
  }

  return false
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err

      if (!isTransientError(err) || i === attempts - 1) {
        throw err
      }

      const delay = Math.pow(2, i) * 1000 + Math.random() * 300;
      await new Promise((res) => setTimeout(res, delay))
    }
  }

  throw lastError
}
