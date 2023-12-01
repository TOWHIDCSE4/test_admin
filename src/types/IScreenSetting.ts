export interface IScreenSetting {
    _id?: string
    server: string
    screen: EnumScreenType
    is_show: boolean
    config?: any
}

export enum EnumScreenType {
    student_leave_request = 1
}

export const serverScreenConfig = {
    ADMIN: 'admin',
    WEBAPP: 'webapp'
}
