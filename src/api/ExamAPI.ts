import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    min_start_time?: number
    max_end_time?: number
    q?: string
    course_id?: string
    exam_id?: number
    user_id?: number
}

export default class ExamAPI {
    public static getExamList(query: QueryParams) {
        const route = `/core/admin/exam/list`
        return ApiSender.get(route, query)
    }

    public static createExam(payload) {
        const route = `/core/admin/exam/create`
        return ApiSender.post(route, payload)
    }

    public static getExamHistory(query: QueryParams) {
        const route = `/core/admin/exam/history`
        return ApiSender.get(route, query)
    }
}
