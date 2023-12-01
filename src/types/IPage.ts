import { PAGE_STATUS } from 'const'
import { ICategory } from 'types'

export interface IPage {
    _id: string
    name: string
    slug: string
    status?: PAGE_STATUS
    content: object
    categories: [ICategory]
    created_time?: Date
    updated_time?: Date
}
