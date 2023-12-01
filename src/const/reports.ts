export enum EnumRecommendSection {
    TEACHER_SYSTEM_REPORT = 1,
    TEACHER_STUDENT_REPORT = 2,
    TEACHER_WAGE_RULE_REPORT = 3,
    TEACHER_MATERIAL_REPORT = 4,
    TEACHER_OTHER_REPORT = 5,
    STUDENT_SYSTEM_REPORT = 6,
    STUDENT_TEACHER_REPORT = 7,
    STUDENT_SUPPORT_REPORT = 8,
    STUDENT_LEARNING_DOCUMENT_REPORT = 9,
    STUDENT_OTHER_REPORT = 10
}

export const EnumRecommendSection2 = {
    '1': 'TEACHER_SYSTEM_REPORT',
    '2': 'TEACHER_STUDENT_REPORT',
    '3': 'TEACHER_WAGE_RULE_REPORT',
    '4': 'TEACHER_MATERIAL_REPORT',
    '5': 'STUDENT_SYSTEM_REPORT',
    '6': 'TEACHER_SYSTEM_REPORT',
    '7': 'STUDENT_TEACHER_REPORT',
    '8': 'STUDENT_SUPPORT_REPORT',
    '9': 'STUDENT_LEARNING_DOCUMENT_REPORT',
    '10': 'STUDENT_OTHER_REPORT'
}

export enum EnumRecommendStatus {
    PENDING = 1,
    PROCESSING = 2,
    COMPLETED = 3,
    CANCELED = 4,
    CLOSED = 5
}

export const EnumRecommendStatus2 = {
    '1': 'PENDING',
    '2': 'PROCESSING',
    '3': 'COMPLETED',
    '4': 'CANCELED',
    '5': 'CLOSED'
}

export enum EnumClassify {
    SUPPORT = 1,
    COMPLAIN = 2,
    OTHER = 3
}

export enum EnumReportType {
    RECOMMEND = 1,
    REPORT = 2
}

export enum EnumLevel {
    NORMAL = 1,
    HOT = 2
}

export const objectClassify = {
    SUPPORT: 1,
    COMPLAIN: 2,
    OTHER: 3
}

export const ObjectLevel = {
    NORMAL: 1,
    HOT: 2
}

export const ArrayCause = [
    'Customer support',
    'Teacher',
    'Academic',
    'Admissions',
    'Customer',
    'Software',
    'Customer support + Teacher',
    'Admissions + Customer support',
    'Admissions + Teacher',
    'Customer support(part-time)',
    'Other'
]
export const EnumReportType2 = {
    '1': 'RECOMMEND',
    '2': 'REPORT'
}
