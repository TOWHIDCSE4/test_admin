export enum EnumTargetType {
    STUDENT = 1,
    TEACHER = 2
}

export enum EnumEventNoticeType {
    HOLIDAY_EVENT = 'HOLIDAY_EVENT',
    UPDATE_SYSTEM_EVENT = 'UPDATE_SYSTEM_EVENT',
    OTHER_EVENT = 'OTHER_EVENT'
}

export interface IEventNotice {
    _id: string
    type: EnumEventNoticeType
    target: EnumTargetType
    title: string
    content?: string
    start_time_shown: number
    end_time_shown: number
    status: boolean
    image?: string
    created_time?: Date
    updated_time?: Date
}
