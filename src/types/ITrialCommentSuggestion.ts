import { EnumRecommendationType } from './ITrialBooking'

export interface CreateTrialMemoBookingDTO {
    teacher_assessment: ITrialAssessment[]
    admin_assessment: ITrialAssessment[]
    starting_level_id: number
    recommendation_type: EnumRecommendationType
    curriculum_id: number
}
export interface ITrialAssessment {
    keyword: string
    point: number
    comment: string
}
export interface ITrialCommentSuggestion {
    keyword: string
    comments: string[]
    created_time?: Date
    updated_time?: Date
}
