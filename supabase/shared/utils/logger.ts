export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>

const EMOJIS: Record<LogLevel, string> = {
    debug: '🔍',
    info: '📘',
    warn: '⚠️',
    error: '❌'
}

const PRIORITIES: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
}

const MIN_LEVEL = (Deno.env.get('LOG_LEVEL') as LogLevel) || 'debug'

const shouldLog = (level: LogLevel) => PRIORITIES[level] >= PRIORITIES[MIN_LEVEL]

export class Logger {
    private startTime?: number

    constructor(
        private readonly service: string,
        private correlationId?: string
    ) { }

    child(service: string) {
        return new Logger(service, this.correlationId)
    }

    setCorrelationId(id: string) {
        this.correlationId = id
    }

    debug(action: string, msg: string, ctx?: LogContext) {
        this.log('debug', action, msg, ctx)
    }

    info(action: string, msg: string, ctx?: LogContext) {
        this.log('info', action, msg, ctx)
    }

    warn(action: string, msg: string, ctx?: LogContext) {
        this.log('warn', action, msg, ctx)
    }

    error(action: string, msg: string, err?: Error, ctx?: LogContext) { this.log('error', action, msg, ctx, err) }

    start(action: string, msg: string, ctx?: LogContext) {
        this.startTime = performance.now()
        this.info(action, `▶ Starting: ${msg}`, ctx)
    }

    success(action: string, msg: string, ctx?: LogContext) {
        this.info(action, `✔ Completed: ${msg}`, ctx)
    }

    failure(action: string, msg: string, err?: Error, ctx?: LogContext) {
        this.error(action, `✘ Failed: ${msg}`, err, ctx)
    }

    private log(level: LogLevel, action: string, message: string, context?: LogContext, error?: Error) {
        if (!shouldLog(level)) return

        let out = `${EMOJIS[level]} [${new Date().toISOString()}] [${this.service}] ${action}: ${message}`
        if (this.correlationId) out += ` | correlationId=${this.correlationId}`

        const elapsed = this.startTime ? Math.round(performance.now() - this.startTime) : undefined
        if (elapsed !== undefined) out += ` | duration=${elapsed}ms`
        if (context && Object.keys(context).length > 0) out += ` | context=${JSON.stringify(context)}`

        if (error) {
            out += `\n  └─ Error: ${error.name}: ${error.message}`
            if (error.stack) out += `\n  └─ Stack: ${error.stack}`
        }

        const logFn = level === 'info' ? console.log : console[level]
        logFn(out)
    }
}

export const createLogger = (service: string, correlationId?: string) => new Logger(service, correlationId)
export const createRequestLogger = (service: string) => new Logger(service, `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
