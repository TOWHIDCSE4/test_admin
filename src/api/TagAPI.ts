import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
}
export default class TagAPI {
    public static getTags(query?: QueryParams) {
        return ApiSender.get('/cms/admin/tags', query)
    }

    public static createTag(payload: object) {
        const route = `/cms/admin/tags`
        return ApiSender.post(route, payload)
    }

    public static editTag(_id: string, payload: object) {
        const route = `/cms/admin/tags/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removeTag(_id: string) {
        const route = `/cms/admin/tags/${_id}`
        return ApiSender.delete(route)
    }
}
