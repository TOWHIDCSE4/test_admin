import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    is_alert?: boolean
    type?: string
    template_obj_id?: any
    filter_type?: string
    fromDate?: any
    toDate?: any
}
export default class NotificationAPI {
    public static getNotifications(query: QueryParams) {
        return ApiSender.get('/noti/admin/notifications', query)
    }

    public static markSeen(payload: QueryParams = {}) {
        const route = `/noti/admin/notifications/mark-seen`
        return ApiSender.put(route, payload)
    }

    public static markSeenById(payload) {
        const route = `/noti/admin/notifications/mark-seen-by-id`
        return ApiSender.put(route, payload)
    }

    public static getNotificationsForView(query: QueryParams) {
        return ApiSender.get('/noti/admin/notifications-for-view', query)
    }
}
