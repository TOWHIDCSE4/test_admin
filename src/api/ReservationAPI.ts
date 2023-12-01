import ApiSender from './config'

export default class ReservationAPI {
    public static getReservations(query: any) {
        const route = `/core/admin/student/reservation-requests`
        return ApiSender.get(route, query)
    }

    public static updateReservation(query: any) {
        const route = `/core/admin/student/reservation-requests/${query.id}`
        return ApiSender.put(route, query)
    }

    public static deleteReservation(id: number) {
        const route = `/core/admin/student/reservation-requests/${id}`
        return ApiSender.delete(route)
    }

    public static async getFee(query?: {
        ordered_package_id?: number
        student_id?: number
    }) {
        const route = '/core/admin/reservation-requests/cost-preview'
        return ApiSender.get(route, query)
    }

    public static newReservation(payload?: {
        start_time: string
        end_time: string
        ordered_package_id: number
        student_note: string
        student_id: number
    }) {
        const route = `/core/admin/reservation-requests`
        return ApiSender.post(route, payload)
    }
}
