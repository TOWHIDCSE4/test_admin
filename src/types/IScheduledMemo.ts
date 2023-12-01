import { IUser, ICourse } from 'types'

export interface Assessment {
    point: number
    comment?: string
}

export enum EnumScheduledMemoType {
    MONTHLY = 1,
    COURSE = 2
}

export interface IScheduledMemo {
    id: number
    student_id: number
    type: EnumScheduledMemoType
    month?: number
    year?: number
    course_id?: number
    teacher_id?: number
    registered_class: number
    completed_class: number
    attendance: Assessment
    attitude: Assessment
    homework: Assessment
    exam_result: number
    teacher_note?: string
    admin_note?: string
    teacher_commented: boolean
    student: IUser
    teacher?: IUser
    course?: ICourse
    created_time?: Date
    updated_time?: Date
    segments?: SegmentPoint[]
    student_start_level: number
}

// DTO
export interface EditScheduledMemoDTO {
    teacher_id?: number
    attendance_comment: string
    attitude_comment: string
    homework_comment: string
    teacher_note: string
    admin_note: string
}
export interface SegmentPoint {
    start_time: number
    end_time: number
    attendance_point?: number
    attitude_point?: number
    homework_point?: number
    exam_result?: number
}
