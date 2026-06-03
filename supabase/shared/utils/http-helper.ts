import { z, ZodError } from 'zod'
import { corsHeaders } from './cors.ts'
import { AppError } from './app-error.ts'

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

interface ResponseOptions {
    status?: number
    headers?: Record<string, string>
}

export async function parseBody(req: Request) {
    if (req.headers.get('Content-Type')?.includes('application/json')) {
        return req.json()
    }

    if (
        req.headers
            .get('Content-Type')
            ?.includes('application/x-www-form-urlencoded')
    ) {
        const formData = await req.clone().formData()
        // deno-lint-ignore no-explicit-any
        const rawParams: Record<string, any> = {}
        formData.forEach((value, key) => {
            const stringValue = value.toString()

            if (key.includes('.')) {
                const [parent, child] = key.split('.')

                if (!rawParams[parent]) {
                    rawParams[parent] = {}
                }

                if (child === 'attributes') {
                    try {
                        rawParams[parent][child] = stringValue
                            ? JSON.parse(stringValue)
                            : {}
                    } catch {
                        rawParams[parent][child] = {}
                    }
                } else {
                    rawParams[parent][child] = stringValue
                }
            } else {
                rawParams[key] = stringValue
            }
        })
        return rawParams
    }

    return req.text()
}

export function successResponse(
    data: unknown,
    message = 'Success',
    options: ResponseOptions = {}
) {
    const { status = 200, headers = {} } = options

    if (status === 204) {
        return new Response(null, {
            status,
            headers: {
                ...corsHeaders,
                ...headers
            }
        });
    }

    return new Response(
        JSON.stringify({
            success: true,
            message,
            data
        }),
        {
            status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                ...headers
            }
        }
    )
}

export function responseTwiml() {
    return new Response('<Response></Response>', {
        headers: { 'Content-Type': 'text/xml' }
    })
}

export function errorResponse(error: unknown) {
    let statusCode = 500
    let code = 'INTERNAL_SERVER_ERROR'
    let message = 'An unexpected error occurred'
    let details: unknown = null

    if (error instanceof AppError) {
        statusCode = error.statusCode
        code = error.code
        message = error.message
        details = error.details
    } else if (error instanceof ZodError) {
        statusCode = 400
        code = 'VALIDATION_ERROR'
        message = 'Validation failed'
        details = error.errors
    } else if (error instanceof Error) {
        message = error.message
    }

    return new Response(
        JSON.stringify({
            success: false,
            code,
            message,
            details
        }),
        {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    )
}

export function validatePayload<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): z.output<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw result.error;
    }
    return result.data;
}
