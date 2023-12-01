import ApiSender from './config'

export default class CustomerSupportManagementAPI {
    public static export(query: any) {
        const route = `/core/admin/customer-support-management/export`
        return ApiSender.get(route, query)
    }

    public static getStudents(query: any) {
        const route = `/core/admin/customer-support-management/students-management`
        return ApiSender.get(route, query)
    }

    public static getAllRegularCalendar(query: any) {
        const route = `/core/admin/customer-support-management/get-all-regular-calendar`
        return ApiSender.get(route, query)
    }

    public static updateData(data: any) {
        const route = `/core/admin/customer-support-management/students-management`
        return ApiSender.put(route, { ...data })
    }

    public static getDataDashboardActiveForm(query: any) {
        const route = `/core/admin/customer-support-management/dashboard/active-form`
        return ApiSender.get(route, query)
    }

    public static getDataDashboardCS(query: any) {
        const route = `/core/admin/customer-support-management/dashboard/cs`
        return ApiSender.get(route, query)
    }

    public static getDataDashboardCS2(query: any) {
        const route = `/core/admin/customer-support-management/dashboard/cs2`
        return ApiSender.get(route, query)
    }

    public static updateStaffStudents(data: any) {
        const route = `/core/admin/customer-support-management/students-management/update-staff`
        return ApiSender.put(route, data)
    }
}
