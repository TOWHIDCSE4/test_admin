import ApiSender from './config'

export default class TrialTestIeltsResultAPI {
    public static getAllTrialTestIeltsResult(query?: any) {
        const route = `/core/admin/trial-test-ielts/results`
        return ApiSender.get(route, query)
    }

    public static editTrialTestIeltsResult(id: number, payload: object) {
        const route = `/core/admin/trial-test-ielts/results/${id}`
        return ApiSender.put(route, payload)
    }
}
