import ApiSender from './config'

type QueryParams = {
    operation_issue_ids?: any
}

export default class OperationIssueAPI {
    public static markOperationById(payload) {
        const route = `/core/admin/mark-operation-by-id`
        return ApiSender.put(route, payload)
    }

    public static getStaffNameByIds(query?: QueryParams) {
        const route = `/core/admin/staff-name-by-ids`
        return ApiSender.get(route, query)
    }
}
