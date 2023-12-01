import { REGULAR_REQUEST_STATUS } from 'const/status'
import { ITeacher } from './ITeacher'

export interface IRegularRequest {
    _id: string
    id: number
    teacher_id: number
    old_regular_times: number[]
    regular_times: number[]
    status: REGULAR_REQUEST_STATUS
    admin_note: string
    teacher: ITeacher
}
