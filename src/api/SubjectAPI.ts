import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class SubjectAPI {
    public static getSubjects(query?: QueryParams) {
        const route = `/core/admin/subjects`
        return ApiSender.get(route, query)
    }

    public static createSubject(payload: object) {
        const route = `/core/admin/subjects`
        return ApiSender.post(route, payload)
    }

    public static editSubject(id: number, payload: object) {
        const route = `/core/admin/subjects/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeSubject(id: number) {
        const route = `/core/admin/subjects/${id}`
        return ApiSender.delete(route)
    }
}
