import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search_user?: string
    filter_type?: any
    min_start_time?: any
    max_end_time?: any
    staff_id?: number
}
export default class ZaloInteractiveHistoryAPI {
    public static getInteractiveHistory(query?: QueryParams) {
        return ApiSender.get('/core/admin/zalo-interactive-history', query)
    }
}
