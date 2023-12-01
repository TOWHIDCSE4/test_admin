import ApiSender from './config'

export default class AuthAPI {
    public static login(payload: object) {
        const route = `/core/admin/login`
        return ApiSender.post(route, payload)
    }
}
