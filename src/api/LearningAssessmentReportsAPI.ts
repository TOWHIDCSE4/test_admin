import ApiSender from './config'

export default class LearningAssessmentReportsAPI {
    public static createLAReportsByAdmin(payload: object) {
        const route = `/core/admin/learning-assessment-reports/create-by-admin`
        return ApiSender.post(route, payload)
    }

    public static getAllReport(query: object) {
        const route = `/core/admin/learning-assessment-reports/get-all`
        return ApiSender.get(route, query)
    }

    public static editLAReport(id: string, payload: object) {
        const route = `/core/admin/learning-assessment-reports/${id}`
        return ApiSender.put(route, payload)
    }

    public static updateStatusReports(data: any) {
        const route = `/core/admin/learning-assessment-reports/update-status/list-reports`
        return ApiSender.put(route, data)
    }

    public static removeLAReport(id: number) {
        const route = `/core/admin/learning-assessment-reports/${id}`
        return ApiSender.delete(route)
    }
}
