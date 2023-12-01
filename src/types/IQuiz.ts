export enum EnumQuizLevel {
    ALL_LEVEL = -1,
    BEGINNER = 1,
    ELEMENTARY = 2,
    INTERMEDIATE = 3,
    UPPER_INTER = 4,
    ADVANCED = 5,
    EXPERT = 6
}

export enum EnumQuizType {
    HOMEWORK = 1,
    TEST = 2,
    MIDTERM = 3,
    FINAL = 4
}

export enum EnumQuizSessionType {
    HOMEWORK = 1,
    TEST = 2,
    EXAM = 3,
    OTHER = 4
}

export interface IQuiz {
    id: number
    name: string
    price: number
    time_limit: number
    score: number
    passed_minimum: number
    instruction?: string
    level: EnumQuizLevel
    created_time?: Date
    updated_time?: Date
    _id?: string
    type: EnumQuizType
}
