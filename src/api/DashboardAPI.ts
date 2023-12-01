import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}

export default class DashboardAPI {
    public static getStatistics(query: QueryParams) {
        const route = `/core/admin/dashboard/statistics`
        return ApiSender.get(route, query)
    }

    public static getStatisticsSideBar() {
        const route = `/core/admin/customer-support-management/dashboard/statistics`
        return ApiSender.get(route, {})
    }
}
