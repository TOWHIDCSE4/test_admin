import { ITag } from './ITag'
import { ICategory } from './ICategory'

export interface IPost {
    _id: string
    tag_id: number
    category_id: number
    title?: string
    author?: string
    content?: string
    categories: [ICategory]
    slug?: string
    image?: string
    subject: ITag
    package: ICategory
    description?: string
    created_time?: Date
    updated_time?: Date
}
