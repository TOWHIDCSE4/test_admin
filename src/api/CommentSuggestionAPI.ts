import { EnumCommentType } from 'types/ICommentSuggestion'
import _ from 'lodash'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    type?: EnumCommentType
    keyword?: string | string[]
    point?: number
}
export default class CommentSuggestionAPI {
    public static getCommentSuggestions(query?: QueryParams) {
        return ApiSender.get('/core/admin/comment-suggestions', query)
    }

    public static createCommentSuggestion(payload: object) {
        const route = `/core/admin/comment-suggestions`
        return ApiSender.post(route, payload)
    }

    public static editCommentSuggestion(id: number, payload: object) {
        const route = `/core/admin/comment-suggestions/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeCommentSuggestion(id: number) {
        const route = `/core/admin/comment-suggestions/${id}`
        return ApiSender.delete(route)
    }

    public static getRandomCommentSuggestion(query?: QueryParams) {
        const route = `/core/admin/comment-suggestion`
        return ApiSender.get(route, query)
    }
}
