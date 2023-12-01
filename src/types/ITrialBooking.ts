import { IBooking, IStudent, ITrialAssessment } from 'types'
import { IOriginMemo } from './IMemo'

export enum EnumRecommendationType {
    KINDERGARTEN = 1,
    KIDS = 2,
    TEENS = 3,
    ADULT = 4
}

export interface ITrialBooking {
    booking_id: number
    booking: IBooking
    memo?: IOriginMemo
    admin_assessment?: ITrialAssessment[]
    recommendation_type?: EnumRecommendationType
    curriculum_id?: number
    recommendation_letter_link?: string
    created_time?: Date
    updated_time?: Date
}
