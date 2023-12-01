import _ from 'lodash'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class TeacherLevelAPI {
    public static getScheduledJobs(query: QueryParams) {
        return ApiSender.get('/cron-jobs/scheduled-jobs', query)
    }
}
