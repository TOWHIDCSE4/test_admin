import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    student_id?: number
    teacher_name?: string
    status?: number
}
export default class MergePackageAPI {
    public static getMergedPackages(query: any) {
        return ApiSender.get('/core/admin/merge-package', query)
    }

    public static getPackageUnmatch(query: any) {
        return ApiSender.get('/core/admin/package-unmatched', query)
    }

    public static mergePackage(data: any) {
        return ApiSender.post('/core/admin/merge-package', data)
    }

    public static deleteMergedPackage(data: any) {
        return ApiSender.delete('/core/admin/merge-package', { data })
    }
}
