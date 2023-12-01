import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
}
export default class PostAPI {
    public static getPosts(query: QueryParams) {
        return ApiSender.get('/cms/admin/posts', query)
    }

    public static createPost(payload: object) {
        const route = `/cms/admin/posts`
        return ApiSender.post(route, payload)
    }

    public static editPost(_id: string, payload: object) {
        const route = `/cms/admin/posts/${_id}`
        return ApiSender.put(route, payload)
    }

    public static removePost(_id: string) {
        const route = `/cms/admin/posts/${_id}`
        return ApiSender.delete(route)
    }
}
