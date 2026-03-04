export type RouteType = {
    route: string,
    title?: string,
    template?: string,
    useLayout?: string | boolean,
    load(): void
}