import { ICourse, IOrderedPackage, IUser, IUnit } from 'types'

export enum EnumRegularCalendarStatus {
    ACTIVE = 1,
    ACTIVE_TEACHER_REQUEST_CANCELING = 2,
    ADMIN_CANCEL = 3,
    TEACHER_CANCEL = 4,
    EXPIRED = 5 /** Order expired */,
    FINISHED = 6 /** Student finish course */
}

export interface IRegularCalendar {
    _id: string
    id: number
    student_id: number
    teacher_id: number
    course_id: number
    unit_id: number
    ordered_package_id: number
    regular_start_time: number
    student: IUser
    teacher: IUser
    course: ICourse
    unit: IUnit
    ordered_package: IOrderedPackage
    status: EnumRegularCalendarStatus
    created_time?: Date
    updated_time?: Date
}
