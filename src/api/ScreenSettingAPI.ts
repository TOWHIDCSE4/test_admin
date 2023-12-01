import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    is_show?: boolean
    server?: string
    screen?: number
}
export default class PromptCategoryAiAPI {
    public static getOneScreenConfig(query: QueryParams) {
        return ApiSender.get('/core/admin/screen-config/get-one', query)
    }

    public static editScreenConfig(_id: string, payload: object) {
        const route = `/core/admin/screen-config/${_id}`
        return ApiSender.put(route, payload)
    }
}
