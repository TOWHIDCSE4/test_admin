import ApiSender from './config'

export default class CustomerSupportReportAPI {
    public static getReportList(query: any) {
        const route = `/core/admin/report/claim/list`
        return ApiSender.get(route, query)
    }

    public static updateReport(query: any) {
        const route = `/core/admin/report/claim/update/${query.id}`
        return ApiSender.put(route, query)
    }

    public static attendanceReport(query: any) {
        const route = `/core/admin/customer-report/attendance`
        return ApiSender.get(route, query)
    }

    public static getExamReport(query: any) {
        const route = `/core/admin/customer-report/exam`
        return ApiSender.get(route, query)
    }

    public static getRenewReport(query: any) {
        const route = `/core/admin/customer-report/renew`
        return ApiSender.get(route, query)
    }

    public static caculateRenewReport(data: any) {
        const route = `/core/admin/customer-report/renew`
        return ApiSender.post(route, data)
    }

    public static getBookingReport(query: any) {
        const route = `/core/admin/customer-report/booking`
        return ApiSender.get(route, query)
    }

    public static getBirthdayReport(query: any) {
        const route = `/core/admin/customer-report/birthday`
        return ApiSender.get(route, query)
    }

    public static getExpireSoonClass(query: any) {
        const route = `/core/admin/customer-report/expire-soon`
        return ApiSender.get(route, query)
    }

    public static exportExpireSoonClass(query: any) {
        const route = `/core/admin/customer-report/export-expire-soon`
        return ApiSender.get(route, query)
    }

    public static getNewStudentReport(query: any) {
        const route = `/core/admin/customer-report/new-student`
        return ApiSender.get(route, query)
    }

    public static getExpireStudentNotRenew(query: any) {
        const route = `/core/admin/customer-report/list-expired-student-not-renew`
        return ApiSender.get(route, query)
    }
}
