import ApiSender from './config'

export default class TrialTestAPI {
    public static getAllTopic(query?: any) {
        const route = `/core/admin/trial-test/all-topic`
        return ApiSender.get(route, query)
    }

    public static getTopicById(id?: number) {
        const route = `/core/admin/trial-test/topic`
        return ApiSender.get(route, { id_topic: id })
    }
}
