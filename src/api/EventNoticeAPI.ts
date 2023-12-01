import { EnumEventNoticeType } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    type?: EnumEventNoticeType | EnumEventNoticeType[]
    search?: string
}
export default class EventNoticeAPI {
    public static getEventNotices(query?: QueryParams) {
        const route = `/core/admin/event-notices`
        return ApiSender.get(route, query)
    }

    public static createEventNotice(payload: object) {
        const route = `/core/admin/event-notices`
        return ApiSender.post(route, payload)
    }

    public static editEventNotice(id: string, payload: object) {
        const route = `/core/admin/event-notices/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeEventNotice(id: string) {
        const route = `/core/admin/event-notices/${id}`
        return ApiSender.delete(route)
    }
}
