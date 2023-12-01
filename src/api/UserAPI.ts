import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    q?: string
    role?: string
}
export default class UserAPI {
    public static getUsers(query: QueryParams) {
        const route = `/core/admin/users`
        return ApiSender.get(route, query)
    }

    public static createUser(payload: object) {
        const route = `/core/admin/users`
        return ApiSender.post(route, payload)
    }

    public static editUser(id: number, payload: object) {
        const route = `/core/admin/users/${id}`
        return ApiSender.put(route, payload)
    }

    public static getLogLoginIp(query: QueryParams) {
        const route = `/core/admin/log-login-ip`
        return ApiSender.get(route, query)
    }

    public static getUserById(id: number) {
        const route = `/core/admin/users/${id}`
        return ApiSender.get(route)
    }

    public static searchUserByString(query: QueryParams) {
        const route = `/core/admin/users/search`
        return ApiSender.get(route, query)
    }

    public static getUsersWithTrialBooking() {
        const route = '/core/admin/users/users-booking'
        return ApiSender.get(route)
    }

    public static adminView(user_id) {
        const route = `/core/admin/users/admin-view/${user_id}`
        return ApiSender.get(route)
    }

    public static addLinkSkype(user_id) {
        const route = `/core/admin/users/add-link-skype-for-student/${user_id}`
        return ApiSender.get(route)
    }

    public static sendMessageInteractiveToAllStudent() {
        const route = `/core/admin/zalo-interaction/send-message-interactive-to-all-student`
        return ApiSender.get(route)
    }
}
