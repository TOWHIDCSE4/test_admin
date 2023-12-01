import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
}
export default class PromptCategoryAiAPI {
    public static getAllPromptCategory(query: QueryParams) {
        return ApiSender.get('/core/admin/prompt-category-AI/all', query)
    }

    public static createPromptCategory(payload: object) {
        const route = `/core/admin/prompt-category-AI`
        return ApiSender.post(route, payload)
    }

    public static editPromptCategory(_id: string, payload: object) {
        const route = `/core/admin/prompt-category-AI/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removePromptCategory(_id: string) {
        const route = `/core/admin/prompt-category-AI/${_id}`
        return ApiSender.delete(route)
    }
}
