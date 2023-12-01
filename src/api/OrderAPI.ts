import { EnumOrderType, ORDER_STATUS } from 'const'
import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: ORDER_STATUS
    student_id?: number
    order_id?: number
    type?: EnumOrderType[]
    active?: boolean
    expired_x_days_ago?: number
    expired?: string
    gte_number_class?: number
}
export default class OrderAPI {
    public static getOrders(query: QueryParams) {
        const route = `/core/admin/orders`
        return ApiSender.get(route, query)
    }

    public static getPreOrders(query: QueryParams) {
        const route = `/core/admin/pre-orders`
        return ApiSender.get(route, query)
    }

    public static acceptPreOrders(data: any) {
        const route = `/core/admin/pre-orders/accept`
        return ApiSender.post(route, data)
    }

    public static rejectPreOrders(data: any) {
        const route = `/core/admin/pre-orders/reject`
        return ApiSender.post(route, data)
    }

    public static getDetailOrder(id: number) {
        const route = `/core/admin/orders/${id}`
        return ApiSender.get(route)
    }

    public static createOrder(payload: object) {
        const route = `/core/admin/orders`
        return ApiSender.post(route, payload)
    }

    public static createPreOrderWithRevenue(payload: object) {
        const route = `/core/admin/pre-orders-revenue`
        return ApiSender.post(route, payload)
    }

    public static editOrder(id: number, payload: object) {
        const route = `/core/admin/orders/${id}`
        return ApiSender.put(route, payload)
    }

    public static updateStatusOrder(id: number, payload: object) {
        const route = `/core/admin/orders/${id}`
        return ApiSender.put(route, payload)
    }

    public static getOrdersByUserId(id: number, query: QueryParams) {
        const route = `/core/admin/users/${id}/orders`
        return ApiSender.get(route, query)
    }

    public static getOrdersByPackageId(id: number) {
        const route = `/core/admin/orders/${id}/package`
        return ApiSender.get(route)
    }

    public static getOrderedPackagesByUserId(id: number, query: QueryParams) {
        const route = `/core/admin/students/${id}/packages`
        return ApiSender.get(route, query)
    }

    public static getAllOrderedPackagesByUserId(
        id: number,
        query: QueryParams
    ) {
        const route = `/core/admin/students/${id}/all-packages`
        return ApiSender.get(route, query)
    }

    public static removePreOrders(data: any) {
        const route = `/core/admin/pre-orders/delete`
        return ApiSender.delete(route, { data })
    }
}
