export enum EnumAlertType {
    ATTENDANCE_BY_NOTIFICATION = 1,
    WILL_EXPIRED_BY_NOTIFICATION,
    DO_NOT_HOMEWORK_BY_NOTIFICATION,
    ATTENDANCE_BY_EMAIL,
    WILL_EXPIRED_BY_EMAIL,
    DO_NOT_HOMEWORK_BY_EMAIL
}

export interface INotification {
    _id: string
    receiver: string
    message: string
    seen: boolean
    extra_info: any
    created_time: Date
    updated_time: Date
}
