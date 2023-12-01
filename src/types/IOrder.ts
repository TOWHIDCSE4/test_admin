import { EnumOrderType } from 'const'

export interface IOrder {
    id: number
    code?: string
    package_id: number
    package_name: string
    number_class: number
    day_of_use: number
    time_of_use: number
    price: number
    discount: number
    total_bill: number
    coupon_id: number
    status: number
    pack_status: number
    admin_note: string
    user_id: number
    type: EnumOrderType
    created_time?: Date
    updated_time?: Date
}
