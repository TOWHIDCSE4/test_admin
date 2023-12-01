import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class StudentLevelAPI {
    public static getStudentLevels(query?: QueryParams) {
        const route = `/core/admin/student-levels`
        return ApiSender.get(route, query)
    }

    public static deleteStudentLevel(id: number) {
        const route = `/core/admin/student-levels/${id}`
        return ApiSender.delete(route)
    }

    public static editStudentLevel(id: number, data: any) {
        const route = `/core/admin/student-levels/${id}`
        return ApiSender.put(route, data)
    }

    public static createStudentLevel(data: any) {
        const route = `/core/admin/student-levels`
        return ApiSender.post(route, data)
    }
}
