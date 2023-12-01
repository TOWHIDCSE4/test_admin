import { IUser } from './IUser'

export interface IWallet {
    user_id: number
    total_balance: number
    user?: IUser
    created_time?: Date
    updated_time?: Date
}
