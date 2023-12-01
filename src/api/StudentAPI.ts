import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    status?: string
    q?: string
    search?: string
    role?: string
    type?: string
}
export default class StudentAPI {
    public static getRegularStudents(query: QueryParams) {
        const route = `/core/admin/users/students`
        return ApiSender.get(route, query)
    }

    public static getStudentsOfSupported(query: QueryParams) {
        const route = `/core/admin/users/all-students-of-supported`
        return ApiSender.get(route, query)
    }

    public static getInactiveStudents(query: QueryParams) {
        query.status = 'inactive'
        const route = `/core/admin/users/students`
        return ApiSender.get(route, query)
    }

    public static getActiveStudents(query: QueryParams) {
        query.status = 'active'
        const route = `/core/admin/users/students`
        return ApiSender.get(route, query)
    }

    public static getAllStudents(query: QueryParams) {
        const route = `/core/admin/users/students`
        return ApiSender.get(route, query)
    }

    public static createNewStudent(payload: object) {
        const route = `/core/admin/users/students`
        return ApiSender.post(route, payload)
    }

    public static editStudent(id: number, payload: object) {
        const route = `/core/admin/users/students/${id}`
        return ApiSender.put(route, payload)
    }

    public static searchStudentByString(query: QueryParams) {
        query.role = 'STUDENT'
        const route = `/core/admin/users/search`
        return ApiSender.get(route, query)
    }

    // public static getAllStudents(query: QueryParams) {
    //     const route = '/core/admin/students'
    //     return ApiSender.get(route, query)
    // }

    public static getTrialStudents(query: QueryParams) {
        const route = `/core/admin/users/students`
        return ApiSender.get(route, query)
    }
}
