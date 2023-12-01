import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    regular_time?: any
    start_time?: number
    teacher_id?: number
    year?: number
    month?: number
    circle?: number
    search?: string
    location_id?: string
    level_id?: string
    end_time?: number
    sort?: string
    status?: string
    staff_id?: string
    filter_type?: string
    weekDay?: any
}
export default class TeacherAPI {
    public static getAllTeachers(query: QueryParams) {
        const route = `/core/admin/teachers`
        return ApiSender.get(route, query)
    }

    public static getAllTeachersSchedule(query: QueryParams) {
        const route = `/core/admin/teacher/schedules`
        return ApiSender.get(route, query)
    }

    public static getInactiveTeachers(query: QueryParams) {
        query.status = 'inactive'
        const route = `/core/admin/teachers`
        return ApiSender.get(route, query)
    }

    public static getTeachers(query: QueryParams) {
        const route = `/core/admin/users/teachers`
        return ApiSender.get(route, query)
    }

    public static createTeacher(payload: object) {
        const route = `/core/admin/users/teachers`
        return ApiSender.post(route, payload)
    }

    public static editTeacher(id: number, payload: object) {
        const route = `/core/admin/teachers/${id}`
        return ApiSender.put(route, payload)
    }

    public static getTeachersWithRegularTime(query: QueryParams) {
        const route = `/core/admin/teachers-with-regular-time`
        return ApiSender.get(route, query)
    }

    public static getPendingTeachers(query: QueryParams) {
        const route = `/core/admin/teachers/pending`
        return ApiSender.get(route, query)
    }

    public static getTeacherSalary(query: QueryParams) {
        const route = `/core/admin/teacher/salary`
        return ApiSender.get(route, query)
    }

    public static caculateSalary(data: any) {
        const route = `/core/admin/teacher/salary/caculate`
        return ApiSender.post(route, data)
    }

    public static getTrialTeachers(query: QueryParams) {
        const route = `/core/admin/teachers/trial-pool`
        return ApiSender.get(route, query)
    }

    public static getTeachersByTime(query: QueryParams) {
        const route = `/core/admin/teachers/available-in-specific-time`
        return ApiSender.get(route, query)
    }

    public static getReferredTeachers(query: any) {
        const route = `/core/admin/teacher/referred-teachers`
        return ApiSender.get(route, query)
    }
}
