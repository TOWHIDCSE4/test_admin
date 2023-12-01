import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    category?: any
    prompt_template_id?: string
}
export default class AIReportResultAPI {
    public static getAllAIReportResult(query: QueryParams) {
        return ApiSender.get('/core/admin/ai-report-result/all', query)
    }

    public static createAIReportResult(payload: object) {
        const route = `/core/admin/ai-report-result`
        return ApiSender.post(route, payload)
    }

    public static editAIReportResult(_id: string, payload: object) {
        const route = `/core/admin/ai-report-result/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removeAIReportResult(_id: string) {
        const route = `/core/admin/ai-report-result/${_id}`
        return ApiSender.delete(route)
    }
}
