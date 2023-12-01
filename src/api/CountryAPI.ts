import ApiSender from './config'

export default class CountryAPI {
    public static getCountries() {
        const route = '/core/admin/countries'
        return ApiSender.get(route)
    }

    public static getTimeZones() {
        const route = '/core/admin/timezone'
        return ApiSender.get(route)
    }
}
