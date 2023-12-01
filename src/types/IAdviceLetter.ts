import { IStudent } from './IStudent'

export enum EnumAdviceLetterStatus {
    Published = 1,
    Private = 2
}

export interface IAdviceLetter {
    _id: string
    student_id: number
    booking_id: number
    student: IStudent
    file_name: string
    file: string
    status: EnumAdviceLetterStatus
    created_time: Date
    // updated_time?: Date;
}
