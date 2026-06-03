type RouteHandler = (req: Request, params: Record<string, string>) => Promise<Response>

interface Route {
    method: string
    pattern: RegExp
    paramNames: string[]
    handler: RouteHandler
}

export class Router {
    private routes: Route[] = []

    post(path: string, handler: RouteHandler) { this.addRoute('POST', path, handler) }
    get(path: string, handler: RouteHandler) { this.addRoute('GET', path, handler) }
    put(path: string, handler: RouteHandler) { this.addRoute('PUT', path, handler) }
    patch(path: string, handler: RouteHandler) { this.addRoute('PATCH', path, handler) }
    delete(path: string, handler: RouteHandler) { this.addRoute('DELETE', path, handler) }

    private addRoute(method: string, path: string, handler: RouteHandler) {
        const paramNames: string[] = []
        const regexPath = path.replace(/:(\w+)/g, (_, name) => (paramNames.push(name), '([^/]+)'))
        const pattern = new RegExp(`^${regexPath}/?$`)
        this.routes.push({ method, pattern, paramNames, handler })
    }

    async handle(req: Request): Promise<Response | null> {
        const url = new URL(req.url)
        const method = req.method
        const pathname = url.pathname.replace(/^\/(functions\/v1\/)?[^\/]+/, '') || '/'
        console.log(`[Router] Incoming: ${method} ${url.pathname} -> Normalized: ${pathname}`)

        for (const route of this.routes) {
            console.log(`[Router] Checking route: ${route.method} ${route.pattern}`)
            if (route.method !== method) continue

            const match = pathname.match(route.pattern)
            if (match) {
                console.log(`[Router] Matched route: ${route.method} ${route.pattern}`)
                const params = Object.fromEntries(
                    route.paramNames.map((name, i) => [name, match[i + 1]])
                )
                return await route.handler(req, params)
            }
        }
        return null
    }
}
