import { ITeacher } from './ITeacher'

export interface ITeacherTrial {
    teacher_id: number
    age_groups: EnumAgeGroup[]
    teacher: ITeacher
    created_time?: Date
    updated_time?: Date
}

export enum EnumAgeGroup {
    CHILDREN = 1 /* 5-7 */,
    JUNIOR = 2 /* 8-10 */,
    SECONDARY_JUNIOR = 3 /* 11-14 */,
    SENIOR = 4 /* adult */
}
export const AGE_GROUP_NAMES = {
    [EnumAgeGroup.CHILDREN]: '5-7',
    [EnumAgeGroup.JUNIOR]: '8-10',
    [EnumAgeGroup.SECONDARY_JUNIOR]: '11-14',
    [EnumAgeGroup.SENIOR]: 'Người lớn'
}
