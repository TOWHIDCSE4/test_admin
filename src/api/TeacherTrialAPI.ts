import { EnumTeacherStatus } from 'const/status'
import { EnumAgeGroup } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    start_time?: number
    location_id?: string
    age_groups?: EnumAgeGroup[]
    status?: EnumTeacherStatus
    search?: string
}

export default class TeacherTrialPoolAPI {
    public static getTrialTeacherProfiles(query: QueryParams) {
        const route = `/core/admin/teachers/trial-pool`
        return ApiSender.get(route, query)
    }

    public static createTrialTeacherProfile(payload: object) {
        const route = `/core/admin/teachers/trial-pool`
        return ApiSender.post(route, payload)
    }

    public static editTrialTeacherProfile(teacher_id: number, payload: object) {
        const route = `/core/admin/teachers/trial-pool/${teacher_id}`
        return ApiSender.put(route, payload)
    }

    public static removeTrialTeacherProfile(teacher_id: number) {
        const route = `/core/admin/teachers/trial-pool/${teacher_id}`
        return ApiSender.delete(route)
    }

    public static getTeachersNotInTrial(query: {
        page_size?: number
        page_number?: number
        search?: string
        teacher_id?: number | number[]
    }) {
        const route = `/core/admin/teachers/trial-pool/teachers`
        return ApiSender.get(route, query)
    }
}
