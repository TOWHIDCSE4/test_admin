import { IStudent } from 'types'

export enum EnumStudentLeaveRequestStatus {
    APPROVED = 1,
    PENDING = 2,
    REJECT_BY_ADMIN = 3
}

export enum EnumStudentLeaveRequestSource {
    ADMIN = 1,
    STUDENT = 2
}
export interface IStudentLeaveRequest {
    _id: string
    id: number
    student_id: number
    start_time: number
    end_time: number
    status: number
    student: IStudent
    admin_note?: string
    created_time?: Date
    updated_time?: Date
}
