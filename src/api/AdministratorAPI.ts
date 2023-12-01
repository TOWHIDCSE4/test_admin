import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    idDepartment?: number
    limit?: number
    offset?: number
    search?: string
}
export default class AdministratorAPI {
    public static getAdministrators(query?: QueryParams) {
        return ApiSender.get('/core/admin/administrators', query)
    }

    public static getAllAdministrators(query?: any) {
        return ApiSender.get('/core/admin/administrators/all', query)
    }

    public static createAdministrator(payload: object) {
        const route = `/core/admin/administrators`
        return ApiSender.post(route, payload)
    }

    public static editAdministrator(admin_id: number, payload: object) {
        const route = `/core/admin/administrators/${admin_id}`
        return ApiSender.put(route, payload)
    }

    public static removeAdministrator(admin_id: number) {
        const route = `/core/admin/administrators/${admin_id}`
        return ApiSender.delete(route)
    }

    public static getAdminInformation(admin_id: number) {
        const route = `/core/admin/administrators/information/${admin_id}`
        return ApiSender.get(route)
    }

    public static updatePermissionsForUser(adminId: number, payload: any) {
        const route = `/core/admin/administrators/${adminId}/update-permissions`
        return ApiSender.put(route, payload)
    }
}
