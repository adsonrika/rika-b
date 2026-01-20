export type TimeUnit = 'second' | 'minute' | 'hour'

export interface FrequencyRule {
  unit: TimeUnit
  maxCallTimes: number
  delaySecond: number
}

export interface FrequencyControllerOptions {
  minWaitingUnitMs?: number
  maxTimePointSize?: number
}

/**
 * 频率控制器，支持基于时间点的调用频率限制
 * 使用"凭证"机制：获取凭证时原子性地记录调用次数
 * @param timePointFn 时间点生成
 * @param delayMillisecondFn 判断时间点是否需要等待；进入等待后，时间点变更也不打断等待
 */
export function createFrequencyController(
  timePointFn: () => number,
  delayMillisecondFn: (
    timePointCalledTimes: number,
    timePoint: number,
    allTimePointCalledTimes: readonly [number, number][],
  ) => number,
  options: FrequencyControllerOptions = {},
) {
  const { minWaitingUnitMs = 40, maxTimePointSize = 100 } = options

  const timePointCounter = new Map<number, number>()
  // 用以保障串行获取凭证
  let tokenPromise = Promise.resolve(true)

  /**
   * 清理过期的计数器
   */
  function cleanupOldEntries(currentTimePoint: number): void {
    if (timePointCounter.size <= maxTimePointSize) return

    let minKey = currentTimePoint
    for (const key of timePointCounter.keys()) {
      if (key < minKey) minKey = key
    }
    timePointCounter.delete(minKey)
  }

  /**
   * 等待指定毫秒数
   */
  const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

  /**
   * 获取执行凭证
   * 原子性地检查频率、记录调用次数、等待
   */
  function acquireToken(): Promise<boolean> {
    // 等待当前 tokenPromise 执行完成，再判断是否可执行，实现穿行化
    const oldTokenPromise = tokenPromise
    tokenPromise = (async () => {
      void (await oldTokenPromise)
      const timePoint = timePointFn()
      const currentCount = timePointCounter.get(timePoint) ?? 0
      const snapshot = Array.from(timePointCounter.entries())

      // 计算是否需要延迟
      const delay = delayMillisecondFn(currentCount, timePoint, snapshot)

      if (delay < 1) {
        // 无需等待，立即获取凭证并记录调用
        timePointCounter.set(timePoint, currentCount + 1)
        cleanupOldEntries(timePoint)
        return true
      }
      // 需要延迟时，必须等待
      await wait(delay)
      // 等待时间点变更
      while (timePointFn() === timePoint) {
        await wait(minWaitingUnitMs)
      }
      return false
    })()
    return tokenPromise
  }

  async function run<T>(fn: () => Promise<T> | T): Promise<T> {
    // 获取凭证（内部会原子性地记录调用次数）
    while (!(await acquireToken())) {
      // waitting
    }
    // 执行函数
    return fn()
  }

  return { run }
}

const TIME_UNIT_SECONDS: Record<TimeUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
} as const

/**
 * 创建基于规则的简单频率控制器
 *
 * @example
 * ```typescript
 * const controller = createSimpleFrequencyController([
 *   { unit: 'second', maxCallTimes: 5, delaySecond: 1 },
 *   { unit: 'minute', maxCallTimes: 100, delaySecond: 10 }
 * ])
 *
 * await controller.run(myFunction, 'api-key')
 * ```
 */
export function createSimpleFrequencyController(rules: readonly FrequencyRule[]) {
  type ControllerKey = string

  const controlledFnCache = new Map<ControllerKey, () => Promise<boolean>>()

  const controllers = rules.map(({ unit, maxCallTimes, delaySecond }) => {
    const unitInSeconds = TIME_UNIT_SECONDS[unit]
    return createFrequencyController(
      () => Math.floor(Date.now() / 1000 / unitInSeconds),
      calledTimes => (calledTimes >= maxCallTimes ? delaySecond * 1000 : 0),
      { minWaitingUnitMs: 100 },
    )
  })

  function createControlledFn(key: ControllerKey) {
    let controlledFn = () => Promise.resolve(true)
    for (const controller of controllers) {
      const currentFn = controlledFn
      controlledFn = () => controller.run(currentFn)
    }
    controlledFnCache.set(key, controlledFn)
    return controlledFn
  }

  /**
   * 执行函数并应用频率控制
   * @param fn - 要执行的函数
   * @param key - 用于分组控制的键，相同 key 的函数共享频率限制
   */
  async function run<T>(fn: () => Promise<T> | T, key: ControllerKey = ''): Promise<T> {
    const controlledFn = controlledFnCache.get(key) ?? createControlledFn(key)
    await controlledFn()
    return fn()
  }

  return { run }
}
