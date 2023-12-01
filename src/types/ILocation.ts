export interface ILocation {
    id: number
    name: string
    currency: string
    weekend_bonus: number
    student_enrollment_bonus: number
    referral_bonus: number
    late_memo_fines: number
    lack_of_open_slot_fines: number
    accept_time: number
    cancel_time: number
    created_time?: Date
    updated_time?: Date
}
