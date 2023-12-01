import { IQuiz } from 'types'
import { ICourse } from './ICourse'
import { IExam } from './IExam'

export interface IUnit {
    id: number
    course_id: number
    name: string
    student_document: string
    teacher_document: string
    audio: any
    workbook: string
    note?: string
    preview?: string
    course: ICourse
    created_time?: Date
    updated_time?: Date
    exam?: any
    homework?: any
    exam_id?: number
    exam_type?: number
    homework_id?: number
    homework2?: any
    homework2_id?: number
    test_topic?: any
    test_topic_id?: number
    unit_type?: string
    ielts_reading_topic?: any
    ielts_reading_topic_id?: number
    ielts_writing_topic?: any
    ielts_writing_topic_id?: number
    ielts_listening_topic?: any
    ielts_listening_topic_id?: number
}
