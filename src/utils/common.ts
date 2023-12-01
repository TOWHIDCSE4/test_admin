import { BOOKING_STATUS_OBJECT } from 'const/status'

const { customAlphabet } = require('nanoid')

export const renderUid = () => {
    return customAlphabet(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        32
    )
}

export const getColorTagByBookingStatus = (status: number) => {
    switch (status) {
        case BOOKING_STATUS_OBJECT.COMPLETED:
            return 'success'
        case BOOKING_STATUS_OBJECT.PENDING:
            return 'warning'
        case BOOKING_STATUS_OBJECT.UPCOMING:
            return 'cyan'
        case BOOKING_STATUS_OBJECT.TEACHING:
            return 'processing'
        case BOOKING_STATUS_OBJECT.TEACHER_ABSENT:
            return 'volcano'
        case BOOKING_STATUS_OBJECT.STUDENT_ABSENT:
            return 'volcano'
        case BOOKING_STATUS_OBJECT.CANCEL_BY_STUDENT:
            return 'error'
        case BOOKING_STATUS_OBJECT.CANCEL_BY_TEACHER:
            return 'error'
        default:
            break
    }
}
