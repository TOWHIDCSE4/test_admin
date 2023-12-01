import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
}
export default class LocationAPI {
    public static getLocations(query?: QueryParams) {
        const route = `/core/admin/locations`
        return ApiSender.get(route, query)
    }

    public static createLocation(payload: object) {
        const route = `/core/admin/locations`
        return ApiSender.post(route, payload)
    }

    public static editLocation(id: number, payload: object) {
        const route = `/core/admin/locations/${id}`
        return ApiSender.put(route, payload)
    }

    public static removeLocation(id: number) {
        const route = `/core/admin/locations/${id}`
        return ApiSender.delete(route)
    }
}
