export enum EnumStudentType {
    NEW = 1,
    RENEW = 2,
    ALL_TYPE
}

export enum EnumStudentTypeByOrderPackage {
    STANDARD = 'standard',
    PREMIUM = 'premium'
}

export enum EnumSourceCRM {
    CSKH = 'CSKH',
    OFFICE_HAMIA = 'OFFICE_HAMIA'
}

export interface ICrmInfo {
    sale_user_id: string
    sale_name: string
    source: EnumSourceCRM
}

export interface IStudent {
    _id: string
    id: number
    first_name: string
    last_name: string
    full_name: string
    username: string
    email?: string
    phone_number?: string
    date_of_birth?: string
    staff?: any
    skype_account: string
    crm?: ICrmInfo
    trial_class_skype_url?: any
}
