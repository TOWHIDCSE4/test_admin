import { EnumCouponType, EnumPackageType } from 'types'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    type?: EnumCouponType
    package_type?: EnumPackageType
    start_time_applied?: number
    end_time_applied?: number
}
export default class CouponAPI {
    public static getCoupons(query?: QueryParams) {
        return ApiSender.get('/core/admin/coupons', query)
    }

    public static createCoupon(payload: object) {
        const route = `/core/admin/coupons`
        return ApiSender.post(route, payload)
    }

    public static editCoupon(id: number, payload: object) {
        const route = `/core/admin/coupons/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeCoupon(id: number) {
        const route = `/core/admin/coupons/${id}`
        return ApiSender.delete(route)
    }
}
