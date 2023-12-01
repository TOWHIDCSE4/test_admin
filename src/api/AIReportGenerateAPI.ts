import { ObjectChain } from 'lodash'
import ApiSender from './config'

export default class AIReportGenerateAPI {
    public static reportGenerate(payload: Object) {
        return ApiSender.post('/core/admin/ai-report/report-generate', payload)
    }
}
