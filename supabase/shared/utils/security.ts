import { SupabaseClient } from 'supabase'
import { UnauthorizedError } from "./app-error.ts";

export async function requireUser(req: Request, supabase: SupabaseClient) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        throw new UnauthorizedError('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
        throw new UnauthorizedError('Invalid user token');
    }

    return user
}