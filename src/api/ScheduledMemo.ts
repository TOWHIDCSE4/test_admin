import { EditScheduledMemoDTO, EnumScheduledMemoType } from 'types'
import ApiSender from './config'

export default class ScheduledMemoAPI {
    public static getScheduledMemo(query: {
        page_number: number
        page_size: number
        month?: number
        year?: number
        type?: EnumScheduledMemoType
        course_id?: number
        sort?: string
        student_id?: number
        teacher_id?: number
    }) {
        const route = `/core/admin/scheduled-memos`
        return ApiSender.get(route, query)
    }

    public static editScheduledMemo(id: number, diff: EditScheduledMemoDTO) {
        const route = `/core/admin/scheduled-memos/${id}`
        return ApiSender.put(route, diff)
    }

    public static getAutoRateMemo(data: any) {
        const route = `/core/admin/memo/auto-rate`
        return ApiSender.post(route, data)
    }
}
