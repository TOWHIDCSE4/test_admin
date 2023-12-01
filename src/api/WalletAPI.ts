import ApiSender from './config'

export default class WalletAPI {
    public static getBalance(query: any) {
        const route = `/core/admin/wallet/balance`
        return ApiSender.get(route, query)
    }

    public static deposit(data: any) {
        const route = `/core/admin/wallet/add-funds`
        return ApiSender.post(route, data)
    }

    public static getWallets(query: any) {
        const route = `/core/admin/wallets`
        return ApiSender.get(route, query)
    }

    public static getWalletTransactions(query: any) {
        const route = `/core/admin/wallet/transactions/`
        return ApiSender.get(route, query)
    }

    public static getOrderInformation(query: any) {
        const route = `/core/admin/wallet/check-order`
        return ApiSender.get(route, query)
    }

    public static addFundsToWallet(balance, note, user_id) {
        const route = `/core/admin/wallet/add-funds`
        return ApiSender.put(route, { balance, note, user_id })
    }

    public static getDepositWithdrawRequest(query: any) {
        const route = `/core/admin/wallet/deposit-withdraw`
        return ApiSender.get(route, query)
    }

    public static acceptDeposit(data: any) {
        const route = `/core/admin/wallet/deposit/accept`
        return ApiSender.post(route, data)
    }

    public static rejectDeposit(data: any) {
        const route = `/core/admin/wallet/deposit/reject`
        return ApiSender.post(route, data)
    }
}
