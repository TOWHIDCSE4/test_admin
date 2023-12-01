import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
    teacher_name?: string
    status?: number
}
export default class RegularCalendarAPI {
    public static getAutomaticScheduling(query: QueryParams) {
        return ApiSender.get('/core/admin/regular-calendars', query)
    }

    public static getAutomaticSchedulingById(regular_calendar_id: number) {
        const route = `/core/admin/regular-calendars/${regular_calendar_id}`
        return ApiSender.get(route)
    }

    public static getLatestAutomaticScheduling(query: QueryParams) {
        const route = '/core/admin/regular-calendars/latest'
        return ApiSender.get(route, query)
    }

    public static createRegularCalendar(payload: object) {
        const route = `/core/admin/regular-calendars`
        return ApiSender.post(route, payload)
    }

    public static editRegularCalendar(
        regular_calendar_id: number,
        payload: object
    ) {
        const route = `/core/admin/regular-calendars/${regular_calendar_id}`
        return ApiSender.put(route, payload)
    }

    public static removeRegularCalendar(
        regular_calendar_id: number,
        data: any
    ) {
        const route = `/core/admin/regular-calendars/${regular_calendar_id}`
        return ApiSender.delete(route, { data })
    }
}
