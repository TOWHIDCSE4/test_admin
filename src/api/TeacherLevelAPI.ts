import _ from 'lodash'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class TeacherLevelAPI {
    public static getTeacherLevels(query?: QueryParams) {
        return ApiSender.get('/core/admin/teacher-levels', query)
    }

    public static createTeacherLevel(payload: object) {
        const route = `/core/admin/teacher-levels`
        return ApiSender.post(route, payload)
    }

    public static editTeacherLevel(id: number, payload: object) {
        const route = `/core/admin/teacher-levels/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeTeacherLevel(id: number) {
        const route = `/core/admin/teacher-levels/${id}`
        return ApiSender.delete(route)
    }
}
