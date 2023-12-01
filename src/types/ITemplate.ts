export interface ITemplate {
    _id: string
    code: string
    title: string
    content: string
    description?: string
    type: EnumTemplateType
    created_time?: Date
    updated_time?: Date
}

export enum EnumTemplateType {
    EMAIL = 1,
    NOTIFICATION = 2,
    EVENT = 3,
    PDF = 4,
    ZALOOA = 5
}
