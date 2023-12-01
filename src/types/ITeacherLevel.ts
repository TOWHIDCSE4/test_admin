export interface ILocationRate {
    location_id: number
    hourly_rate: number
    location: Location
}

export interface ITeacherLevel {
    _id: string
    id: number
    name: string
    hourly_rates: ILocationRate[]
    is_active: boolean
    min_calendar_per_circle: number
    min_peak_time_per_circle: number
    max_missed_class_per_circle: number
    max_absent_request_per_circle: number
    class_accumulated_for_promotion: number
}
