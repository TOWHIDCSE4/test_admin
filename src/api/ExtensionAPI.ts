import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
    min_days?: number
    max_days?: number
    ordered_package_id?: number
    status?: number
    days?: number
    price?: number
    proof_files?: any
}

export default class ExtensionAPI {
    public static getExtensions(query: QueryParams) {
        const route = `/core/admin/student/extension-requests`
        return ApiSender.get(route, query)
    }

    public static updateExtension(query: any) {
        const route = `/core/admin/student/extension-requests/${query.id}`
        return ApiSender.put(route, query)
    }

    public static async getFee(query?: {
        ordered_package_id?: number
        student_id?: number
    }) {
        const route = '/core/admin/extension-requests/cost-preview'
        return ApiSender.get(route, query)
    }

    public static newExtension(payload?: {
        ordered_package_id: number
        student_note: string
        student_id: number
        days?: number
        price?: number
        proof_files?: any
    }) {
        const route = `/core/admin/extension-requests`
        return ApiSender.post(route, payload)
    }
}
