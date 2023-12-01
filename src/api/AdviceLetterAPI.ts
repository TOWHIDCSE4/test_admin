import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    sort?: string
    status?: number | string
    search?: string
}

export default class AdviceLetterAPI {
    public static createAdviceLetterForLearningAssessment(data: any) {
        const route =
            '/core/admin/advice-letter/create-advice-letter-for-learning-assessment'
        return ApiSender.put(route, { ...data })
    }

    public static getAllAdviceLetters(query: QueryParams) {
        return ApiSender.get('/core/admin/all-advice-letters', query)
    }

    public static updateStatus(data: any) {
        const route = '/core/admin/advice-letter/update-status'
        return ApiSender.put(route, { ...data })
    }

    public static removeAdviceLetter(_id: string) {
        const route = `/core/admin/advice-letter/delete/${_id}`
        return ApiSender.delete(route)
    }
}
