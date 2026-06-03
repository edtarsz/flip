export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly details?: unknown

    constructor(
        message: string,
        statusCode = 500,
        code = 'INTERNAL_SERVER_ERROR',
        details?: unknown
    ) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.details = details
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 404, 'NOT_FOUND', details)
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'BAD_REQUEST', details)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details?: unknown) {
        super(message, 401, 'UNAUTHORIZED', details)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details?: unknown) {
        super(message, 403, 'FORBIDDEN', details)
    }
}

export class MethodNotAllowedError extends AppError {
    constructor(message = 'Method Not Allowed', details?: unknown) {
        super(message, 405, 'METHOD_NOT_ALLOWED', details)
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 409, 'CONFLICT', details)
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 500, 'DATABASE_ERROR', details)
    }
}

