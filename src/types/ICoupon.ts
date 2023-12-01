import { EnumPackageType, EnumStudentType } from 'types'

export enum EnumCouponType {
    DISCOUNT = 1 /** Chiet khau */,
    SALE_OFF = 2 /** Giam gia */
}

export interface ICoupon {
    id: number
    title: string
    code: string
    start_time_applied: number
    end_time_applied: number
    start_time_shown: number
    end_time_shown: number
    type: EnumCouponType
    percentage_off: number
    package_type: EnumPackageType
    min_age?: number
    max_age?: number
    student_type?: EnumStudentType /** For now, it has no effect */
    content?: string
    image?: string
    created_time?: Date
    updated_time?: Date
}
