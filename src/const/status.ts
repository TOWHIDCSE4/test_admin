export enum REGULAR_REQUEST_STATUS {
    CONFIRMED = 1,
    PENDING,
    CANCELED
}

export enum REGULAR_REQUEST_TYPE {
    NEW = 'New Regular Time',
    EDIT = 'Edit Regular Time',
    CLOSE = 'Close Regular Time'
}

export const MODAL_TYPE_ENUM = {
    NEW: 1,
    EDIT: 2
}

export enum MODAL_TYPE {
    ADD_NEW,
    EDIT
}

export enum MODAL_TYPE_NEW {
    VIEW = 1,
    EDIT = 2
}

export const BOOKING_STATUS_OBJECT = {
    COMPLETED: 1,
    PENDING: 2,
    UPCOMING: 3,
    TEACHING: 4,
    STUDENT_ABSENT: 5,
    TEACHER_ABSENT: 6,
    CANCEL_BY_STUDENT: 7,
    CANCEL_BY_TEACHER: 8,
    CANCEL_BY_ADMIN: 9,
    TEACHER_CONFIRM: 10
}

export enum ENUM_BOOKING_STATUS {
    COMPLETED = 1,
    PENDING = 2,
    UPCOMING = 3,
    TEACHING = 4,
    STUDENT_ABSENT = 5,
    TEACHER_ABSENT = 6,
    CANCEL_BY_STUDENT = 7,
    CANCEL_BY_TEACHER = 8,
    CANCEL_BY_ADMIN = 9,
    TEACHER_CONFIRM = 10,
    CHANGE_TIME = 11
}

export enum REVIEW_STATUS {
    REJECT = -1,
    PENDING = 0,
    CONFIRMED = 1
}

export enum ORDER_STATUS {
    PAID = 1,
    PENDING = 2,
    CANCEL = 3
}
export enum PREORDER_STATUS {
    PENDING = 1,
    ACCEPTED = 2,
    REJECTED = 3
}

export enum PAGE_STATUS {
    DRAFT = 1,
    PUBLISH
}

export enum EnumBookingTypes {
    TRIAL,
    REGULAR,
    FLEXIBLE
}

export enum EnumOrderType {
    STANDARD = 1,
    PREMIUM = 2,
    TRIAL = 3
}

export enum EnumQuizSessionStatus {
    PASS = 1,
    FAIL = 2,
    DOING = 3
}

export enum EnumTeacherStatus {
    ALL = '',
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum EnumStudentStatus {
    ALL = '',
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum ERROR_REPORT_TYPES {
    SERVER = 1,
    NETWORK = 2
}

export enum EnumRegularCare {
    NOT_DONE = 1,
    DONE = 2
}

export enum TestTypeRegularCare {
    MID = 'MID',
    FINAL = 'FINAL'
}

export enum CallTypeRegularCare {
    GREETING = 'greeting',
    CHECKING = 'checking',
    UPCOMING_TEST = 'upcoming_test',
    TEST_REPORTS = 'test_reports'
}

export enum EnumPriority {
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}

export enum EnumPeriodicType {
    PERIODIC = 1,
    END_TERM = 2,
    NONE = 3
}

export enum EnumVNPeriodicType {
    BC_dinh_ky = 1,
    BC_cuoi_ky = 2,
    None = 3
}

export enum EnumTrialTestIeltsType {
    IELTS_GRAMMAR = 1,
    IELTS_4_SKILLS = 2
}

export enum EnumTrialTestIeltsSubType {
    READING = 'reading',
    SPEAKING = 'speaking',
    LISTENING = 'listening',
    WRITING = 'writing'
}

export enum EnumTemplateAIStatus {
    ALL = '',
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum EnumBookingMediumType {
    HAMIA_MEET = 1,
    SKYPE = 2
}
