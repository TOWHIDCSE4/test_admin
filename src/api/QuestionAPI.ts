import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    idSearch?: any
}
export default class QuestionAPI {
    public static getQuestions(query?: QueryParams) {
        return ApiSender.get('/core/admin/questions', query)
    }

    public static createQuestion(payload: object) {
        const route = `/core/admin/questions`
        return ApiSender.post(route, payload)
    }

    public static editQuestion(id: number, payload: object) {
        const route = `/core/admin/questions/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeQuestion(id: number) {
        const route = `/core/admin/questions/${id}`
        return ApiSender.delete(route)
    }

    public static getQuestionsNEW(query?: QueryParams) {
        const route = `/quiz-svc/admin/questions`
        return ApiSender.get(route, query)
    }

    public static getQuestionsWidthMultipleAnswers(query?: QueryParams) {
        const route = `/quiz-svc/admin/questions-with-multiple-answers`
        return ApiSender.get(route, query)
    }

    public static createQuestionNEW(payload: object) {
        const route = `/quiz-svc/admin/question`
        return ApiSender.post(route, payload)
    }

    public static editQuestionNEW(id: number, payload: object) {
        const route = `/quiz-svc/admin/question/${id}`
        return ApiSender.put(route, payload)
    }
}
