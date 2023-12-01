import { IQuiz } from 'types'

export enum EnumQuestionType {
    MULTI_CHOICE = 1,
    FILL_ANSWER = 2,
    ONE_CHOICE = 3
}

export interface IAnswers {
    content?: string
    is_correct?: boolean
    label?: string
    text?: string
}

export interface IQuestion {
    id: number
    name: string
    description?: string
    answers: IAnswers[]
    question_type: EnumQuestionType
    quiz_id: number //
    quiz: IQuiz //
    display_order: number
    created_time?: Date
    updated_time?: Date
    image?: string
    video?: string
    audio?: string
}
