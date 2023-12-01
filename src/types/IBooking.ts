import { ENUM_BOOKING_STATUS } from 'const'
import { IOrderedPackage, ITrialAssessment } from 'types'
import { IStudent } from './IStudent'
import { IPackage } from './IPackage'
import { ICalendar } from './ICalendar'
import { ICourse } from './ICourse'
import { IUnit } from './IUnit'
import { ITeacher } from './ITeacher'
import { IQuiz } from './IQuiz'
import { IOriginMemo } from './IMemo'
import { IAdviceLetter } from './IAdviceLetter'

export interface IBooking {
    _id: string
    id: number
    calendar: ICalendar
    teacher: ITeacher
    teacher_id: number
    student_id: number
    student: IStudent
    advice_letters: IAdviceLetter
    package_id: number
    ordered_package_id: number
    package: IPackage
    course_id: number
    course: ICourse
    unit_id: number
    unit: IUnit
    status: number
    admin_note: string
    teacher_note: string
    cskh_note: string
    reason: string
    memo?: IOriginMemo
    communicate_tool: any
    ordered_package: IOrderedPackage
    quiz?: IQuiz
    average?: number
    first_time_do_homework?: number
    record_link?: any
    is_regular_booking?: boolean
    test_result?: any
    test_start_time: number
    test_topic_name: string
    learning_medium?: any
    admin_unit_lock?: boolean
}

export interface CreateTrialBookingDto {
    ordered_package_id: number
    teacher_id: number
    start_time: number
    end_time: number
    // test_level_id: number
}

export interface IStatisticBooking {
    total_class: number
    total_completed: number
    total_cancel: number
    total_cancel_by_teacher: number
    total_cancel_by_student: number
    total_absent: number
    total_absent_by_teacher: number
    total_absent_by_student: number
}

export interface CreateBookingDto {
    start_time: number
    course_id: number
    unit_id: number
    student_id: number
    teacher_id: number
    ordered_package_id: number
    admin_note?: string
    status: ENUM_BOOKING_STATUS
    admin_unit_lock?: boolean
}
