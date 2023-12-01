import { IQuiz } from './IQuiz'

export interface IExam {
    id: number
    name: string
    description: string
    quiz: IQuiz
    created_time?: Date
    updated_time?: Date
    _id?: string
}
