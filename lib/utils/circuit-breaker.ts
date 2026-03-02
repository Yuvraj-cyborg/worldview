type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeMs: number;
  halfOpenMaxAttempts: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeMs: 60_000,
  halfOpenMaxAttempts: 1,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailure = 0;
  private halfOpenAttempts = 0;
  private options: CircuitBreakerOptions;

  constructor(private name: string, options?: Partial<CircuitBreakerOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailure >= this.options.resetTimeMs) {
        this.state = "half-open";
        this.halfOpenAttempts = 0;
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN`);
      }
    }

    if (this.state === "half-open" && this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      this.trip();
      throw new Error(`Circuit breaker [${this.name}] half-open limit reached`);
    }

    try {
      if (this.state === "half-open") this.halfOpenAttempts++;
      const result = await fn();
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.options.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state = "open";
    console.warn(`[CircuitBreaker:${this.name}] TRIPPED — failures: ${this.failures}`);
  }

  private reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.halfOpenAttempts = 0;
  }

  getState(): CircuitState {
    return this.state;
  }
}

const breakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  let cb = breakers.get(name);
  if (!cb) {
    cb = new CircuitBreaker(name, options);
    breakers.set(name, cb);
  }
  return cb;
}
