import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
    category?: any
}
export default class PromptTemplateAiAPI {
    public static getAllPromptTemplate(query: QueryParams) {
        return ApiSender.get('/core/admin/prompt-template-AI/all', query)
    }

    public static createPromptTemplate(payload: object) {
        const route = `/core/admin/prompt-template-AI`
        return ApiSender.post(route, payload)
    }

    public static editPromptTemplate(_id: string, payload: object) {
        const route = `/core/admin/prompt-template-AI/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removePromptTemplate(_id: string) {
        const route = `/core/admin/prompt-template-AI/${_id}`
        return ApiSender.delete(route)
    }
}
