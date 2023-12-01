import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    package_ids?: number[]
    subject_ids?: number[]
    course_type?: string
    status?: any
}
export default class CourseAPI {
    public static getCourses(query: QueryParams) {
        return ApiSender.get('/core/admin/courses', query)
    }

    public static createCourse(payload: object) {
        const route = `/core/admin/courses`
        return ApiSender.post(route, payload)
    }

    public static editCourse(id: number, payload: object) {
        const route = `/core/admin/courses/${id}`
        return ApiSender.put(route, payload)
    }

    public static assignCourseToPackage(payload: object) {
        const route = `/core/admin/courses/assign-course-to-package`
        return ApiSender.put(route, payload)
    }

    public static removeCourse(id: number) {
        const route = `/core/admin/courses/${id}`
        return ApiSender.delete(route)
    }

    public static getCourseByPackageId(package_id, query: QueryParams) {
        return ApiSender.get(`/core/courses`, {
            ...query,
            package_ids: [package_id]
        })
    }
}
