import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class AbsentRequestAPI {
    public static getAbsentRequests(query: QueryParams) {
        const route = `/core/admin/teacher/absent-requests`
        return ApiSender.get(route, query)
    }

    public static editAbsentRequest(id: number, payload: object) {
        const route = `/core/admin/teacher/absent-requests/${id}`
        return ApiSender.put(route, payload)
    }
}
