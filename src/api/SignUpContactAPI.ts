import ApiSender from './config'

export default class SignUpContactAPI {
    public static getContacts(query?: any) {
        const route = '/core/signup-contacts'
        return ApiSender.get(route, query)
    }

    public static updateContact(_id?: string, payload?: any) {
        const route = `/core/signup-contacts/${_id}`
        return ApiSender.put(route, payload)
    }
}
