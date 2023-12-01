import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
}
export default class TeamAPI {
    public static getTeams(query: QueryParams) {
        const route = `/core/admin/team`
        return ApiSender.get(route, query)
    }

    public static getTeam(code: number) {
        const route = `/core/admin/team/${code}`
        return ApiSender.get(route)
    }

    public static createTeam(payload: object) {
        const route = `/core/admin/team`
        return ApiSender.post(route, payload)
    }

    public static editTeam(id: number, payload: object) {
        const route = `/core/admin/team/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeTeam(id: number) {
        const route = `/core/admin/team/${id}`
        return ApiSender.delete(route)
    }
}
