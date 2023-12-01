import ApiSender from './config'

export default class ReportAPI {
    public static getReportList(query: any) {
        const route = `/core/admin/report/claim/list`
        return ApiSender.get(route, query)
    }

    public static findStaffByStudent(query: any) {
        const route = `/core/admin/report/claim/find-staff-by-student`
        return ApiSender.get(route, query)
    }

    public static findStaffByTeacher(query: any) {
        const route = `/core/admin/report/claim/find-staff-by-teacher`
        return ApiSender.get(route, query)
    }

    public static updateReport(data: any) {
        const route = `/core/admin/report/claim/update/${data.id}`
        return ApiSender.put(route, data)
    }

    public static createReport(data: any) {
        const route = `/core/admin/report/claim/create`
        return ApiSender.post(route, data)
    }

    public static getListTeacherForReport(query: any) {
        const route = `/core/admin/reports/list-teachers`
        return ApiSender.get(route, query)
    }

    public static getScheduleSlotForReport(query: any) {
        const route = `/core/admin/reports/schedule-slot`
        return ApiSender.get(route, query)
    }

    public static getStatusClassesForAcademyReport(query: any) {
        const route = `/core/admin/academy-reports/status-classes`
        return ApiSender.get(route, query)
    }

    public static getTrialTeachersForAcademyReport(query: any) {
        const route = `/core/admin/trial-bookings/teacher-report`
        return ApiSender.get(route, query)
    }

    public static getAcademicRenewReport(query: any) {
        const route = `/core/admin/academic-report/renew`
        return ApiSender.get(route, query)
    }

    public static getTrialBookingsByTeacherForAcademyReport(
        teacher_id,
        query: {
            start_time: number
            end_time: number
            page_size: number
            page_number: number
        }
    ) {
        const route = `/core/admin/teachers/${teacher_id}/trial-report`
        return ApiSender.get(route, query)
    }

    public static getTeachingQualitiesForAcademyReport(query: {
        month: number
        year: number
        page_size: number
        page_number: number
    }) {
        const route = `/core/admin/teachers/teaching-salary/monthly-report`
        return ApiSender.get(route, query)
    }

    public static getTeacherAbsenceForAcademyReport(query: {
        month: number
        year: number
        page_size: number
        page_number: number
        teacher_id?: number
    }) {
        const route = `/core/admin/bookings/teacher-absence/monthly-report`
        return ApiSender.get(route, query)
    }

    public static getRenewAndCommission(query: {
        month: number
        year: number
    }) {
        const route = `/core/admin/students/renew-students-statistics`
        return ApiSender.get(route, query)
    }

    public static getTrialProportion(query: any) {
        const route = `/core/admin/hr-report/trial-proportion-of-sale`
        return ApiSender.get(route, query)
    }

    public static getTrialBookingsBySaleForSaleReport(
        sale_id,
        query: {
            start_time: number
            end_time: number
            page_size: number
            page_number: number
        }
    ) {
        const route = `/core/admin/hr-report/${sale_id}/all-booking-trial-of-sale`
        return ApiSender.get(route, query)
    }

    public static getListTrialStudentBuyMainPackage(
        sale_id,
        query: {
            start_time: number
            end_time: number
            page_size: number
            page_number: number
        }
    ) {
        const route = `/core/admin/hr-report/${sale_id}/all-trial-students-buy-main-package-of-sale`
        return ApiSender.get(route, query)
    }
}
