import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    category_id?: any[]
}
export default class PageAPI {
    public static getPages(query: QueryParams) {
        return ApiSender.get('/cms/admin/pages', query)
    }

    public static createPage(payload: object) {
        const route = `/cms/admin/pages`
        return ApiSender.post(route, payload)
    }

    public static editPage(_id: string, payload: object) {
        const route = `/cms/admin/pages/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removePage(_id: string) {
        const route = `/cms/admin/pages/${_id}`
        return ApiSender.delete(route)
    }
}
