import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class AuthenticateAPI {
    public static getPermission(query: QueryParams) {
        return ApiSender.get('/core/admin/permission', query)
    }

    public static getRoles(query: QueryParams) {
        return ApiSender.get('/core/admin/role', query)
    }

    public static createRole(payload: object) {
        const route = `/core/admin/role`
        return ApiSender.get(route)
    }

    public static editRole(id: number, payload: object) {
        const route = `/core/admin/role/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeAdministrator(id: number) {
        const route = `/core/admin/role/${id}`
        return ApiSender.delete(route)
    }
}
