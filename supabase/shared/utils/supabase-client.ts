import { createClient, SupabaseClient } from 'supabase'

const createSupabaseClient = (req: Request) => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! }
            }
        }
    )
}

let serviceClient: SupabaseClient | null = null
const createServiceClient = (): SupabaseClient => {
    if (serviceClient) {
        return serviceClient
    }

    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!url || !key) {
        console.error('Missing Service Role Credentials', {
            url: !!url,
            key: !!key
        })
    }

    serviceClient = createClient(url, key)
    return serviceClient
}

export { createServiceClient, createSupabaseClient }

