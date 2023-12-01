import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
    unit_name?: string
    min_start_time?: number
    max_end_time?: number
    booking_id?: number
}

export default class HomeworkAPI {
    public static getHomeworkList(query: QueryParams) {
        const route = `/core/admin/homework/list`
        return ApiSender.get(route, query)
    }

    public static getHomeworkHistory(query: QueryParams) {
        const route = `/core/admin/homework/history`
        return ApiSender.get(route, query)
    }
}
