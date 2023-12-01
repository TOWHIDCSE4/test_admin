import { ENUM_MEMO_NOTE_FIELD, ENUM_MEMO_OTHER_NOTE_FIELD } from 'const'

export interface IMemoOtherNote {
    keyword: ENUM_MEMO_OTHER_NOTE_FIELD
    comment: string
}

export interface IMemoNote extends IMemoOtherNote {
    point: number
}

export interface IMemo {
    key: string
    name: string
    point: number
    comment: string
}

export interface StudentLevel {
    id: number
    name: string
}

export interface IOriginMemo {
    note: IMemoNote[]
    other: IMemoOtherNote[]
    student_starting_level?: StudentLevel
    created_time?: Date
}
