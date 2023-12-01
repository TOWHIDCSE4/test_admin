export interface ISubject {
    id: number
    name: string
    alias: string
    slug: string
    is_active: boolean
    created_time?: Date
    updated_time?: Date
}
