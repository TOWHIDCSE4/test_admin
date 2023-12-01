import ApiSender from './config'

export default class LogAPI {
    public static get(query?: any) {
        return ApiSender.get('/core/admin/logs', query)
    }

    public static getListApi() {
        return ApiSender.get('/core/admin/list-api')
    }
}
