import { serializeError } from './error.js'

/**
 * 失败重试，超最大次数后抛出异常
 * @param fn
 * @param maxRetry 默认重试最多3次
 * @param retryDelay 重试前默认延迟500ms
 */
export async function retry<T>(
  fn: () => Promise<T> | T,
  maxRetry = 3,
  retryDelay: number | ((calledTimes: number, e: unknown) => Promise<unknown>) = 500,
) {
  let calledTimes = 0
  let lastError: unknown = null
  while (calledTimes < maxRetry) {
    try {
      calledTimes++
      return await fn()
    } catch (e: unknown) {
      lastError = e
      if (typeof retryDelay === 'number') {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      } else {
        await retryDelay(calledTimes, e)
      }
    }
  }
  const errorMsg = serializeError(lastError as Error)
  throw new Error(`retry failed:${errorMsg}`)
}
