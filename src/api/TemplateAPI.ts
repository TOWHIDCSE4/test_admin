import { EnumTemplateType } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    type?: EnumTemplateType | EnumTemplateType[]
    search?: string
    filter_type?: string
    fromDate?: any
    toDate?: any
}
export default class TemplateAPI {
    public static getTemplates(query?: QueryParams) {
        const route = `/core/admin/templates`
        return ApiSender.get(route, query)
    }

    public static createTemplate(payload: object) {
        const route = `/core/admin/templates`
        return ApiSender.post(route, payload)
    }

    public static editTemplate(id: number, payload: object) {
        const route = `/core/admin/templates/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeTemplate(id: number) {
        const route = `/core/admin/templates/${id}`
        return ApiSender.delete(route)
    }

    public static getTemplateCodes() {
        const route = `/core/admin/template-codes`
        return ApiSender.get(route, {})
    }

    public static getTemplateFilters(query?: QueryParams) {
        const route = `/core/admin/template-filters`
        return ApiSender.get(route, query)
    }
}
