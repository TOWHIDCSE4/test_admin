import _ from 'lodash'
import { EnumCurriculumAgeList } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    age_list?: EnumCurriculumAgeList
    search?: string
}
export default class CurriculumAPI {
    public static getCurriculums(query?: QueryParams) {
        return ApiSender.get('/core/admin/curriculums', query)
    }

    public static getCoursesByCurriculum(query?: any) {
        return ApiSender.get('/core/admin/curriculums/course', query)
    }

    public static updateCourseCurriculum(data?: any) {
        return ApiSender.post('/core/admin/curriculums/update-course', data)
    }

    public static getCoursesDontMatchCurriculum(query?: any) {
        return ApiSender.get('/core/admin/curriculums/dont-match-course', query)
    }

    public static createCurriculum(payload: object) {
        const route = `/core/admin/curriculums`
        return ApiSender.post(route, payload)
    }

    public static editCurriculum(id: number, payload: object) {
        const route = `/core/admin/curriculums/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeCurriculums(id: number) {
        const route = `/core/admin/curriculums/${id}`
        return ApiSender.delete(route)
    }
}
