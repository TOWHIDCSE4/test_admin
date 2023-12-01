import ApiSender from './config'

export default class HomeworkTestResultAPI {
    public static getSelfStudyHistoryV2(query?: any) {
        return ApiSender.get('/core/admin/homework/get-self-study-history-v2', {
            ...query
        })
    }
}
