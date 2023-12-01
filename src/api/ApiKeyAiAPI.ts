import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
}
export default class ApiKeyAiAPI {
    public static getAllApiKey(query: QueryParams) {
        return ApiSender.get('/core/admin/api-key-AI/all', query)
    }

    public static reloadBalance(payload: object) {
        return ApiSender.post('/core/admin/api-key-AI/reload-balance', payload)
    }

    public static createApiKey(payload: object) {
        const route = `/core/admin/api-key-AI`
        return ApiSender.post(route, payload)
    }

    public static editApiKey(_id: string, payload: object) {
        const route = `/core/admin/api-key-AI/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removeApiKey(_id: string) {
        const route = `/core/admin/api-key-AI/${_id}`
        return ApiSender.delete(route)
    }
}
