import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    idDepartment?: number | string
}
export default class DepartmentAPI {
    public static getDepartments(query?: QueryParams) {
        return ApiSender.get('/core/admin/department', query)
    }

    public static getDepartment(code: number) {
        const route = `/core/admin/department/${code}`
        return ApiSender.get(route)
    }

    public static createDepartment(payload: object) {
        const route = `/core/admin/department`
        return ApiSender.post(route, payload)
    }

    public static editDepartment(id: number, payload: object) {
        const route = `/core/admin/department/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeDepartment(id: number) {
        const route = `/core/admin/department/${id}`
        return ApiSender.delete(route)
    }

    public static getAllFeatures() {
        return ApiSender.get(`/core/admin/feature`)
    }

    public static updatePermissionOfDepartment(
        departmentCode: number,
        payload: any
    ) {
        const route = `/core/admin/department/${departmentCode}/update-permission`
        return ApiSender.put(route, payload)
    }
}
