import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    is_active?: boolean
}
export default class PackageAPI {
    public static getAllPackages(query?: QueryParams) {
        const route = `/core/admin/all-packages`
        return ApiSender.get(route, query)
    }

    public static getPackages(query?: any) {
        const route = `/core/admin/packages`
        return ApiSender.get(route, query)
    }

    public static createPackage(payload: object) {
        const route = `/core/admin/packages`
        return ApiSender.post(route, payload)
    }

    public static getPackageInfo(id: number) {
        const route = `/core/admin/packages/${id}`
        return ApiSender.get(route)
    }

    public static getOrderedPackagesByPackageId(id: number) {
        const route = `/core/admin/packages/${id}/ordered-packages`
        return ApiSender.get(route)
    }

    public static editPackage(id: number, payload: object) {
        const route = `/core/admin/packages/${id}`
        return ApiSender.put(route, payload)
    }

    public static removePackage(id: number) {
        const route = `/core/admin/packages/${id}`
        return ApiSender.delete(route)
    }

    public static getPackagesByStudentId(
        student_id: number,
        query: QueryParams
    ) {
        const route = `/core/admin/students/${student_id}/packages`
        return ApiSender.get(route, query)
    }

    public static getAllOrderedPackages(query: QueryParams) {
        const route = `/core/admin/ordered-packages`
        return ApiSender.get(route, query)
    }

    public static getOrderedPackageById(id: number, payload: object) {
        const route = `/core/admin/ordered-packages/${id}`
        return ApiSender.get(route, payload)
    }

    public static editOrderedPackages(id: number, payload: object) {
        const route = `/core/admin/ordered-packages/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeOrderedPackages(data: any) {
        const route = `/core/admin/ordered-packages/delete`
        return ApiSender.delete(route, { data })
    }

    public static stopOrderedPackages(data: any) {
        const route = `/core/admin/ordered-packages/stop`
        return ApiSender.post(route, { data })
    }
}
