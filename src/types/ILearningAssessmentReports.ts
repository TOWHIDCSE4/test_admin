export enum EnumLAReportStatus {
    PRIVATE = 1,
    PUBLISHED = 2
}

export enum textLAReportStatus {
    PRIVATE = 'Private',
    PUBLISHED = 'Publish'
}

export enum EnumLAReportType {
    OTHER = 1,
    DILIGENCE = 2,
    PERIODIC = 3,
    END_TERM = 4
}

export enum textLAReportType {
    OTHER = 'BC khác',
    DILIGENCE = 'BC chuyên cần',
    PERIODIC = 'BC định kỳ',
    END_TERM = 'BC cuối kỳ'
}

export enum EnumLAReportSource {
    SYSTEM = 1,
    ADMIN = 2
}

export enum EnumLAModalType {
    NEW = 1,
    EDIT = 2,
    VIEW = 3
}

export interface ILocation {
    id: number
    start_time: number
    end_time: number
    status: EnumLAReportStatus
    type: EnumLAReportType
    prompt_obj_id?: string
    prompt_template?: any
    memo?: string
    booking_ids?: number[]
    source?: EnumLAReportSource
    note?: any
    created_time?: Date
    updated_time?: Date
}
