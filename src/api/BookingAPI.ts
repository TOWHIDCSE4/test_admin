import { ENUM_BOOKING_STATUS } from 'const'
import { CreateBookingDto, CreateTrialBookingDto } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
    sort?: any
    search?: string
    type?: number | number[]
    status?: number | string | ENUM_BOOKING_STATUS[]
    start_time?: number
    min_start_time?: number
    max_end_time?: number
    recorded?: boolean
    memo_status?: number
    ordered_package_id?: number
    memo_type?: string
    booking_ids?: any
}
export default class BookingAPI {
    public static getAllBookings(query: QueryParams) {
        return ApiSender.get('/core/admin/bookings', query)
    }

    public static getAllTrialBookingsWithTestResults(query: QueryParams) {
        return ApiSender.get('/core/admin/bookings/trial/test-results', query)
    }

    public static getDetailTrialBooking(id: number) {
        const route = `/core/lessons/${id}`
        return ApiSender.get(route)
    }

    public static getAllCompleteBookings(query: QueryParams) {
        return ApiSender.get('/core/admin/complete-bookings', query)
    }

    public static getAllBookingByIds(query: QueryParams) {
        return ApiSender.get('/core/admin/all-booking-by-ids', query)
    }

    public static getMemoSuggestion(query?: {}) {
        const route = '/core/admin/bookings/memo-suggestions'
        return ApiSender.get(route, query)
    }

    public static teacherMemo(id: number, payload: object) {
        const route = `/core/admin/bookings/${id}/memo`
        return ApiSender.put(route, payload)
    }

    public static createBooking(payload: CreateBookingDto) {
        const route = `/core/admin/students/${payload.student_id}/bookings`
        return ApiSender.post(route, payload)
    }

    public static updateRegularBookingInfo(payload: any) {
        const route = `/core/admin/students/bookings/update-status-regular-calendar`
        return ApiSender.post(route, payload)
    }

    public static editBooking(id: number, payload: object) {
        const route = `/core/admin/bookings/${id}`
        return ApiSender.put(route, payload)
    }

    public static editBookingTime(id: number, payload: object) {
        const route = `/core/admin/bookings/${id}/change-time`
        return ApiSender.put(route, payload)
    }

    public static createTrialBooking(payload: CreateTrialBookingDto) {
        const route = `/core/admin/bookings/trial`
        return ApiSender.post(route, payload)
    }

    public static getTrialMemoSuggestion() {
        const route = '/core/admin/trial-bookings/comment-suggestion-list'
        return ApiSender.get(route)
    }

    public static editTrialBooking(booking_id: number, payload: any) {
        const route = `/core/admin/bookings/trial/${booking_id}`
        return ApiSender.put(route, payload)
    }

    public static getBookingDetail(booking_id: number) {
        const route = `/core/admin/bookings/${booking_id}`
        return ApiSender.get(route)
    }

    // This will create a pdf file for recommendation letter and send the necessary information to CRM.
    // Note that after this, the trial booking can't be edited anymore.
    public static confirmTrialBooking(booking_id: number) {
        const route = `/core/admin/trial-bookings/${booking_id}/confirm`
        return ApiSender.put(route, {})
    }

    public static requestMeetClassUrl(booking_id: number) {
        const route = `/core/admin/bookings/${booking_id}/class`
        return ApiSender.get(route)
    }

    public static getStatisticBookings(query: QueryParams) {
        const route = `/core/admin/bookings/statistic`
        return ApiSender.get(route, query)
    }

    public static getTrialBookings(query: QueryParams) {
        return ApiSender.get('/core/admin/trial-bookings', query)
    }

    public static createIeltsBooking(payload: any) {
        const route = `/core/admin/bookings/ielts`
        return ApiSender.post(route, payload)
    }

    public static addLinkHMP(user_id) {
        const route = `/core/admin/bookings/add-link-hmp-for-booking/${user_id}`
        return ApiSender.get(route)
    }
}
