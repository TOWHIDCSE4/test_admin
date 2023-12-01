import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    search_type?: number
    search_level?: number
    quiz_id?: number
}
export default class QuizAPI {
    public static getQuizzes(query?: QueryParams) {
        return ApiSender.get('/core/admin/quizzes', query)
    }

    public static createQuiz(payload: object) {
        const route = `/core/admin/quizzes`
        return ApiSender.post(route, payload)
    }

    public static editQuiz(id: number, payload: object) {
        const route = `/core/admin/quizzes/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeQuiz(id: number) {
        const route = `/core/admin/quizzes/${id}`
        return ApiSender.delete(route)
    }

    public static createQuizByUpload(payload: object) {
        const route = `/quiz-svc/admin/import-quiz/create`
        return ApiSender.post(route, payload)
    }

    public static updateQuizByUpload(payload: object) {
        const route = `/quiz-svc/admin/import-quiz/update`
        return ApiSender.post(route, payload)
    }

    public static getQuizzesNEW(query?: QueryParams) {
        const route = `/quiz-svc/admin/quizzes`
        return ApiSender.get(route, query)
    }

    public static getQuizzesLite(query?: QueryParams) {
        const route = `/quiz-svc/admin/quizzes-lite`
        return ApiSender.get(route, query)
    }

    public static createQuizNEW(payload: object) {
        const route = `/quiz-svc/admin/quiz`
        return ApiSender.post(route, payload)
    }

    public static updateQuizNEW(id: number, payload: object) {
        const route = `/quiz-svc/admin/quiz/${id}`
        return ApiSender.put(route, payload)
    }

    public static deleteQuizNEW(id: number) {
        const route = `/quiz-svc/admin/quiz/${id}`
        return ApiSender.delete(route)
    }

    public static getQuizByIdNEW(id: number) {
        const route = `/quiz-svc/admin/quiz/${id}`
        return ApiSender.get(route)
    }

    public static getQuizSession(query?: any) {
        const route = `/quiz-svc/admin/quiz-sessions`
        return ApiSender.get(route, query)
    }

    public static getQuizSessionInfo(id: number) {
        const route = `/quiz-svc/admin/quiz-session/${id}`
        return ApiSender.get(route)
    }

    public static getHomeworksHistory(query?: any) {
        const route = `/core/admin/quiz/homeworks`
        return ApiSender.get(route, query)
    }

    public static getExamHistory(query?: any) {
        const route = `/core/admin/quiz/exams`
        return ApiSender.get(route, query)
    }
}
