import { REGULAR_REQUEST_STATUS } from 'const'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    status?: REGULAR_REQUEST_STATUS
    search?: string
}
export default class RegularRequestAPI {
    public static getRegularRequests(query: QueryParams) {
        const route = `/core/admin/teacher/regular-requests`
        return ApiSender.get(route, query)
    }

    public static editRegularRequest(id: number, payload: object) {
        const route = `/core/admin/teacher/regular-requests/${id}`
        return ApiSender.put(route, payload)
    }
}
