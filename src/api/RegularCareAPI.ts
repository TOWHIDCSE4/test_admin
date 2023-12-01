import ApiSender from './config'

export default class RegularCareAPI {
    // dashboard
    public static getDataDashboardActiveForm(query: any) {
        const route = `/core/admin/regular-care/dashboard/active-form`
        return ApiSender.get(route, query)
    }

    // greeting call

    public static getAllGreetingCall(query: any) {
        const route = `/core/admin/regular-care/get-all-greeting-call`
        return ApiSender.get(route, query)
    }

    public static updateGreetingCall(data: any) {
        const route = `/core/admin/regular-care/update-greeting-call`
        return ApiSender.put(route, { ...data })
    }

    // upcoming test

    public static getAllUpcomingTest(query: any) {
        const route = `/core/admin/regular-care/get-all-upcoming-test`
        return ApiSender.get(route, query)
    }

    public static updateUpcomingTest(data: any) {
        const route = `/core/admin/regular-care/update-upcoming-test`
        return ApiSender.put(route, { ...data })
    }

    public static getListStaffContactHistory(query: any) {
        const route = `/core/admin/regular-care/get-list-staff-contact-history`
        return ApiSender.get(route, query)
    }

    // Checking call
    public static getAllCheckingCall(query: any) {
        const route = `/core/admin/regular-care/get-all-checking-call`
        return ApiSender.get(route, query)
    }

    public static updateCheckingCall(data: any) {
        const route = `/core/admin/regular-care/update-checking-call`
        return ApiSender.put(route, { ...data })
    }

    // Test reports
    public static getAllTestReports(query: any) {
        const route = `/core/admin/regular-care/get-all-test-reports`
        return ApiSender.get(route, query)
    }

    public static updateTestReports(data: any) {
        const route = `/core/admin/regular-care/update-test-reports`
        return ApiSender.put(route, { ...data })
    }

    // Regular test
    public static getAllRegularTest(query: any) {
        const route = `/core/admin/regular-care/regular-test`
        return ApiSender.get(route, query)
    }

    // Periodic reports
    public static getAllPeriodicReports(query: any) {
        const route = `/core/admin/regular-care/get-all-periodic-reports`
        return ApiSender.get(route, query)
    }

    public static updatePeriodicReports(data: any) {
        const route = `/core/admin/regular-care/update-periodic-reports`
        return ApiSender.put(route, { ...data })
    }

    public static createPeriodicReportsForLearningAssessment(data: any) {
        const route = `/core/admin/regular-care/create-periodic-reports-for-learning-assessment`
        return ApiSender.put(route, { ...data })
    }

    public static removePeriodicReports(_id: string) {
        const route = `/core/admin/regular-care/periodic-reports/${_id}`
        return ApiSender.delete(route)
    }

    public static getListActionHistory(query: any) {
        const route = `/core/admin/regular-care/periodic-reports/get-list-action-history`
        return ApiSender.get(route, query)
    }

    // Observation list
    public static getAllObservation(query: any) {
        const route = `/core/admin/regular-care/all-observation`
        return ApiSender.get(route, query)
    }

    public static updateObservation(data: any) {
        const route = `/core/admin/regular-care/update-observation`
        return ApiSender.put(route, { ...data })
    }

    public static removeObservation(_id: string) {
        const route = `/core/admin/regular-care/observation/${_id}`
        return ApiSender.delete(route)
    }
}
