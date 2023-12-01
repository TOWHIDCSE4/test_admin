import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
}
export default class CategoryAPI {
    public static getCategories(query?: QueryParams) {
        return ApiSender.get('/cms/admin/categories', query)
    }

    public static createCategory(payload: object) {
        const route = `/cms/admin/categories`
        return ApiSender.post(route, payload)
    }

    public static editCategory(_id: string, payload: object) {
        const route = `/cms/admin/categories/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removeCategory(_id: string) {
        const route = `/cms/admin/categories/${_id}`
        return ApiSender.delete(route)
    }
}
