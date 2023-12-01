import ApiSender from './config'

export default class EmailAPI {
    public static sendOneSpecificEmail(payload: {
        body: string
        email: string
        subject: string
    }) {
        const route = `/core/admin/emails/unicast`
        return ApiSender.post(route, payload)
    }

    public static sendMulticastWithTemplate(payload: {
        subject: string
        emails: string[]
        body: string
    }) {
        const route = `/core/admin/emails/multicast-template`
        return ApiSender.post(route, payload)
    }
}
