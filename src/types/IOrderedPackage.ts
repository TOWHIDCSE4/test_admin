import { IOrder } from 'types'

export enum EnumPackageOrderType {
    STANDARD = 1,
    PREMIUM = 2,
    TRIAL = 3
}

export interface IOrderedPackage {
    id: number
    package_id: number
    package_name: string
    type: EnumPackageOrderType
    user_id: number
    order_id: number
    number_class: number /** Number of class students can learn */
    day_of_use: number
    original_number_class: number
    paid_number_class?: number
    //    price: number;
    activation_date?: number
    order: IOrder
    created_time?: Date
    updated_time?: Date
}
