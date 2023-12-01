export enum EnumCommentType {
    NORMAL_MEMO = 'normal_memo',
    TRIAL_MEMO = 'trial_memo',
    COURSE_MEMO = 'course_memo',
    MONTHLY_MEMO = 'monthly_memo'
}
export interface ICommentSuggestion {
    _id: string
    id: number
    keyword: string
    type: EnumCommentType
    min_point: number
    max_point: number
    vi_comment: string
    en_comment: string
    created_time?: Date
    updated_time?: Date
}
