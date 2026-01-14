export type TimeUnit = 'second' | 'minute' | 'hour'

export interface FrequencyRule {
    unit: TimeUnit
    maxCallTimes: number
    delaySecond: number
}

export interface FrequencyControllerOptions {
    minWaitingUnitMs?: number
    maxTimePointSize?: number
    maxWaitingSize?: number
}

/**
 * 频率控制器，支持基于时间点的调用频率限制
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
  const {
    minWaitingUnitMs = 4,
    maxTimePointSize = 100,
    maxWaitingSize = 1000,
  } = options;

  const timePointCounter = new Map<number, number>();
  let nextCallTime = -1;
  let waitingCount = 0;

  function flushTimePointCounter(): void {
    const timePoint = timePointFn();
    const current = timePointCounter.get(timePoint) ?? 0;
    timePointCounter.set(timePoint, current + 1);

    if (timePointCounter.size > maxTimePointSize) {
      const minKey = Math.min(...timePointCounter.keys());
      timePointCounter.delete(minKey);
    }
  }

  async function waitForNextSlot(): Promise<void> {
    if (waitingCount >= maxWaitingSize) {
      throw new Error(
        `Too many functions waiting: ${waitingCount}/${maxWaitingSize}`,
      );
    }

    waitingCount++;
    try {
      while (Date.now() < nextCallTime) {
        await new Promise((resolve) => setTimeout(resolve, minWaitingUnitMs));
      }
    } finally {
      waitingCount--;
    }
    nextCallTime = Number.MAX_SAFE_INTEGER;
  }

  async function run<T>(fn: () => Promise<T> | T): Promise<T> {
    await waitForNextSlot();

    const currentTimePoint = timePointFn();

    // 计算当前是否需要延迟（基于当前时间点的调用次数）
    const initialDelay = delayMillisecondFn(
      timePointCounter.get(currentTimePoint) ?? 0,
      currentTimePoint,
      Array.from(timePointCounter.entries()),
    );
    if (initialDelay > 0) {
      while (timePointFn() === currentTimePoint) {
        await new Promise((resolve) => setTimeout(resolve, minWaitingUnitMs));
      }
    }
    flushTimePointCounter();

    const nextDelayMs = delayMillisecondFn(
      timePointCounter.get(currentTimePoint) ?? 0,
      currentTimePoint,
      Array.from(timePointCounter.entries()),
    );
    nextCallTime = Date.now() + nextDelayMs;
    return fn();
  }

  return { run };
}

const TIME_UNIT_SECONDS: Record<TimeUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
} as const;

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
export function createSimpleFrequencyController(
  rules: readonly FrequencyRule[],
) {
    type ControllerKey = string
    const delayFnCache = new Map<ControllerKey, () => Promise<boolean>>();

    function createDelayFn(key: ControllerKey) {
      const controllers = rules.map(({ unit, maxCallTimes, delaySecond }) => {
        const unitInSeconds = TIME_UNIT_SECONDS[unit];
        return createFrequencyController(
          () => Math.floor(Date.now() / 1000 / unitInSeconds),
          (calledTimes) => (calledTimes >= maxCallTimes ? delaySecond * 1000 : 0),
          { minWaitingUnitMs: 100 },
        );
      });
      let delayFn = () => Promise.resolve(true);
      for (const controller of controllers) {
        const currentFn = delayFn;
        delayFn = () => controller.run(currentFn);
      }
      delayFnCache.set(key, delayFn);
      return delayFn;
    }

    /**
     * 执行函数并应用频率控制
     * @param fn - 要执行的函数
     * @param key - 用于分组控制的键，相同 key 的函数共享频率限制
     */
    async function run<T>(fn: () => Promise<T> | T, key: ControllerKey = ''): Promise<T> {
      const delayFn = delayFnCache.get(key) ?? createDelayFn(key);
      await delayFn();
      return fn();
    }

    return { run };
}
