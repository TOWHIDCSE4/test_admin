import { ILocation, ISubject, ICoupon } from 'types'

export enum EnumPackageType {
    STANDARD = 1,
    PREMIUM = 2,
    TRIAL = 3,
    ALL_TYPE
}

export enum EnumFrequencyType {
    DAILY = 2,
    NORMAL = 1
}
export interface IPackage {
    id: number
    location_id: number
    type: EnumPackageType
    subject_id: number
    name: string
    alias: string
    slug: string
    description?: string
    price: number
    number_class: number
    number_ordered_package: number
    day_of_use: number
    is_active: boolean
    is_support: boolean
    image: string
    expired_time: Date
    location: ILocation
    subject: ISubject
    created_time?: Date
    updated_time?: Date
    new_student_coupon?: ICoupon
    renew_student_coupon?: ICoupon
    learning_frequency_type?: number
}
