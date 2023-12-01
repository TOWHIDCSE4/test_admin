export enum EnumCurriculumAgeList {
    KINDERGARTEN = 1,
    KIDS = 2,
    TEENS = 3,
    ADULT = 4
}

export interface ICurriculum {
    _id: string
    id: number
    name: string
    alias: string
    description?: string
    image?: string
    age_list: EnumCurriculumAgeList[]
    created_time?: Date
    updated_time?: Date
}
