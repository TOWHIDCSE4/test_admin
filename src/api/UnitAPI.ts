import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    course_ids?: number[]
    is_active?: boolean
}
export default class UnitAPI {
    public static getUnits(query: QueryParams) {
        const route = `/core/admin/units`
        return ApiSender.get(route, query)
    }

    public static createUnit(payload: object) {
        const route = `/core/admin/units`
        return ApiSender.post(route, payload)
    }

    public static editUnit(id: number, payload: object) {
        const route = `/core/admin/units/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeUnit(id: number) {
        const route = `/core/admin/units/${id}`
        return ApiSender.delete(route)
    }

    public static getUnitsByCourseId(course_id: number, query: QueryParams) {
        const route = `/core/courses/${course_id}/units`
        return ApiSender.get(route, query)
    }

    public static updateUnitCourse(payload: object) {
        const route = `/core/admin/course/update-unit-course`
        return ApiSender.put(route, payload)
    }
}
