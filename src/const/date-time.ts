export const HOUR_TO_MS = 3600 * 1000

export const MINUTE_TO_MS = 60 * 1000

export const DAY_TO_MS = 24 * 3600 * 1000
export const MAX_TIME_TEACHER_REGULAR_TO_DYNAMIC_CALENDAR = 7 * 24 * HOUR_TO_MS

export const DAYS_OF_WEEK_ENUM = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
}

export enum EnumDaysOfWeek {
    SUNDAY = 0,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY
}

export const FULL_DATE_FORMAT = 'HH:mm DD-MM-YYYY'
export const DATE_FORMAT = 'DD-MM-YYYY'
export const locateMoment = {
    relativeTime: {
        future: 'trong %s',
        past: '%s trước',
        s: '1 giây',
        ss: '%s giây',
        m: 'một phút',
        mm: '%d phút',
        h: '1 giờ',
        hh: '%d giờ',
        d: '1 ngày',
        dd: '%d ngày',
        M: 'tháng',
        MM: '%d tháng',
        y: 'năm',
        yy: '%d năm'
    }
}

export const DAY_OF_WEEK_OPTION = [
    {
        title: 'Monday',
        value: 1
    },
    {
        title: 'Tuesday',
        value: 2
    },
    {
        title: 'Wednesday',
        value: 3
    },
    {
        title: 'Thursday',
        value: 4
    },
    {
        title: 'Friday',
        value: 5
    },
    {
        title: 'Saturday',
        value: 6
    },
    {
        title: 'Sunday',
        value: 0
    }
]
