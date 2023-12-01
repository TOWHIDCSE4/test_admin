import { ISubject } from './ISubject'
import { IPackage } from './IPackage'

export enum EnumCourseTag {
    HOT = 'hot',
    POPULAR = 'popular',
    NEW = 'new',
    SPECIAL_OFFER = 'special_offer'
}

export enum EnumCourseType {
    Regular = 'EN_COMMON',
    IELTS = 'IELTS'
}

export enum EnumCourseStatus {
    ACTIVE = 1,
    INACTIVE = 2,
    ALL_STATUS = ''
}

export interface ICourse {
    id: number
    subject_id: number
    package_id: number
    name: string
    alias: string
    description?: string
    slug?: string
    image?: string
    subject: ISubject
    package: IPackage
    created_time?: Date
    updated_time?: Date
    _id?: string
    tags: EnumCourseTag[]
    course_type: string
}
