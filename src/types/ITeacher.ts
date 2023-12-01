import { ILocation, ITeacherLevel } from 'types'
import { REVIEW_STATUS } from 'const'
import { ITeacherSalary } from './ITeacherSalary'
import { IUser } from './IUser'

export interface ITeacher {
    _id: string
    id: number
    first_name: string
    last_name: string
    full_name: string
    username: string
    user: IUser
    user_info: IUser
    teacher: any
    user_id: number
    location_id: number
    teacher_level_id: number
    teacher_level_status: number
    staff_id?: number
    hourly_rate: number
    intro_video?: string
    experience?: string
    about_me?: string
    average_rating?: number
    skills?: any[]
    job_qualification?: number
    total_lesson?: number
    total_lesson_this_level?: number
    location: ILocation
    level: ITeacherLevel
    is_reviewed?: REVIEW_STATUS
    created_time?: Date
    updated_time?: Date
    teacher_salary?: ITeacherSalary
    staff: any
    cv: string
    degree: string
    english_certificate: EnglishCertificate
    teaching_certificate: TeachingCertificate
    skype_account: string
}

type EnglishCertificate = {
    ielts?: string
    toeic?: string
}
type TeachingCertificate = {
    tesol?: string
    tefl?: string
}
