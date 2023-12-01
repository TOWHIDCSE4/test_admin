import { ITeacher } from 'types'

export enum EnumTeacherAbsentRequestStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECT_BY_ADMIN = 3,
    WITHDRAWN_BY_TEACHER = 4
}

export interface IAbsentRequest {
    _id: string
    id: number
    teacher_id: number
    start_time: number
    end_time: number
    status: EnumTeacherAbsentRequestStatus
    teacher: ITeacher
    teacher_note?: string
    admin_note?: string
    created_time?: Date
    updated_time?: Date
}

export interface AbsentRequestDto {
    start_time: number
    end_time: number
    teacher_note: string
}
