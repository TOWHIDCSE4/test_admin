import ApiSender from './config'

export default class UploadAPI {
    public static uploadImage(file: any) {
        const route = `/st/admin/upload`
        const formData = new FormData()
        formData.append('file', file)
        return ApiSender.post(route, formData)
    }

    public static uploadBlob(blob: Blob, name: string) {
        const route = `/st/admin/upload`
        const formData = new FormData()
        formData.append('file', blob, name)
        return ApiSender.post(route, formData)
    }

    public static handleUploadFile(file: any) {
        const route = `/st/admin/upload`
        const formData = new FormData()
        formData.append('file', file)
        return ApiSender.post(route, formData)
    }

    public static handleDeleteFile(filePath: any) {
        const route = `/st/admin/delete`
        return ApiSender.post(route, { filePath })
    }

    public static handleUploadHomeworkFile(file: any) {
        const route = `/st/admin/homework/upload`
        const formData = new FormData()
        formData.append('file', file)
        return ApiSender.post(route, formData)
    }

    public static handleEmailMarketingFile(file: any) {
        const route = `/st/admin/email-marketing/upload`
        const formData = new FormData()
        formData.append('file', file)
        return ApiSender.post(route, formData)
    }
}
