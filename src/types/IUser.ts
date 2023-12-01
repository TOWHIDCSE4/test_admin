import { IStudent } from './IStudent'

export interface IBankAccount {
    bank_name?: string
    account_number?: string
    account_name?: string
    paypal_email?: string
    note?: string
}
export enum EnumUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export interface IUser {
    _id: string
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    username: string
    phone_number: string
    gender: number
    date_of_birth: Date
    avatar: string
    skype_account: string
    intro: string
    role: number[]
    is_active: boolean
    is_verified_phone: boolean
    is_verified_email: boolean
    regular_times: number[]
    country: string
    currency: string
    timezone: string
    last_login: Date
    bank_account: IBankAccount
    student?: IStudent
    // learning_medium_type?: number
    created_time?: Date
}
