import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
}
export default class StudentLeaveRequestAPI {
    public static getAllStudentLeaveRequests(query: QueryParams) {
        const route = `/core/admin/student/leave-requests`
        return ApiSender.get(route, query)
    }

    public static createStudentLeaveRequest(data: any) {
        const route = `/core/admin/student/leave-requests/create`
        return ApiSender.post(route, data)
    }

    public static removeStudentLeaveRequest(_id: any) {
        const route = `/core/admin/student/leave-requests/${_id}`
        return ApiSender.delete(route)
    }
}
