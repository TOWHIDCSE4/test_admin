import ApiSender from './config'

export default class BankAPI {
    public static getBankList() {
        const route = '/core/public/bank-list'
        return ApiSender.get(route)
    }
}
