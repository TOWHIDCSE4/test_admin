import { HOUR_TO_MS, MINUTE_TO_MS, DAY_TO_MS } from 'const/date-time'
import moment from 'moment'

export function toReadableDatetime(datetime) {
    const date = new Date(datetime)
    const year = date.getFullYear()
    let month: any = 1 + date.getMonth()
    month = month >= 10 ? month : `0${month}`
    let day: any = date.getDate()
    day = day >= 10 ? day : `0${day}`

    let hour: any = date.getHours()
    hour = hour >= 10 ? hour : `0${hour}`
    let min: any = date.getMinutes()
    min = min >= 10 ? min : `0${min}`

    return {
        time: `${hour}:${min}`,
        date: `${day}/${month}/${year}`
    }
}

export function moduloTimestamp(timestamp) {
    const minute = (timestamp % HOUR_TO_MS) / MINUTE_TO_MS
    const hour = ((timestamp - minute * MINUTE_TO_MS) % DAY_TO_MS) / HOUR_TO_MS
    const day =
        (timestamp - minute * MINUTE_TO_MS - hour * HOUR_TO_MS) / DAY_TO_MS
    return {
        day,
        hour,
        minute
    }
}

export function convertToModuloTimestamp(
    day_of_week,
    hour_in_day,
    minute_in_hour
) {
    return (
        day_of_week * DAY_TO_MS +
        hour_in_day * HOUR_TO_MS +
        minute_in_hour * MINUTE_TO_MS
    )
}

export function getTimestampInWeekToUTC(timestamp_local) {
    const { day, hour, minute } = moduloTimestamp(timestamp_local)
    const timeLocal = moment()
        .days(day)
        .set('hours', hour)
        .set('minutes', minute)
    const timeUtc = moment(timeLocal).clone().utc()
    return (
        timeUtc.days() * DAY_TO_MS +
        timeUtc.get('hours') * HOUR_TO_MS +
        timeUtc.get('minutes') * MINUTE_TO_MS
    )
}

export function getTimestampInWeekToLocal(timestamp_utc) {
    const minute_utc = (timestamp_utc % HOUR_TO_MS) / MINUTE_TO_MS
    const hour_utc =
        ((timestamp_utc - minute_utc * MINUTE_TO_MS) % DAY_TO_MS) / HOUR_TO_MS
    const day_utc =
        (timestamp_utc - minute_utc * MINUTE_TO_MS - hour_utc * HOUR_TO_MS) /
        DAY_TO_MS
    const timeUtc = moment()
        .utc()
        .days(day_utc)
        .set('hours', hour_utc)
        .set('minutes', minute_utc)
    const timeLocal = moment(timeUtc).clone().local()
    const day_local = timeLocal.day()
    const hour_local = timeLocal.get('hours')
    const minute_local = timeLocal.get('minutes')
    return (
        day_local * DAY_TO_MS +
        hour_local * HOUR_TO_MS +
        minute_local * MINUTE_TO_MS
    )
}
export const getStartOfTheWeek = (current_time: number): number => {
    const date = new Date(current_time)
    const day = date.getUTCDay()
    const hour = date.getUTCHours()
    const minute = date.getUTCMinutes()
    const second = date.getUTCSeconds()
    const millisecond = date.getUTCMilliseconds()
    const start_of_the_week =
        current_time -
        day * DAY_TO_MS -
        hour * HOUR_TO_MS -
        minute * MINUTE_TO_MS -
        second * 1000 -
        millisecond
    return start_of_the_week
}
export const getTimestampInWeek = (current_timestamp: number): number => {
    const current_date = new Date(current_timestamp)
    const day_of_week = current_date.getUTCDay()
    const hour_in_day = current_date.getUTCHours()
    const minute_in_hour = current_date.getUTCMinutes()

    return (
        day_of_week * DAY_TO_MS +
        hour_in_day * HOUR_TO_MS +
        minute_in_hour * MINUTE_TO_MS
    )
}

export const getTimestampListInPeriod = (
    timestamps_in_week: number[],
    start_timestamp: number,
    end_timestamp: number
): number[] => {
    const timestamps = new Array<number>()
    for (const timestamp_in_week of timestamps_in_week) {
        let time_in_this_week =
            getStartOfTheWeek(start_timestamp) + timestamp_in_week
        if (time_in_this_week < start_timestamp) {
            time_in_this_week += 7 * DAY_TO_MS
        }

        while (time_in_this_week <= end_timestamp) {
            timestamps.push(time_in_this_week)
            time_in_this_week += 7 * DAY_TO_MS
        }
    }
    timestamps.sort((a, b) => {
        return a - b
    })

    return timestamps
}

export function formatTimestamp(timestamp) {
    const minute = (timestamp % HOUR_TO_MS) / MINUTE_TO_MS
    const hour = ((timestamp - minute * MINUTE_TO_MS) % DAY_TO_MS) / HOUR_TO_MS
    const day =
        (timestamp - minute * MINUTE_TO_MS - hour * HOUR_TO_MS) / DAY_TO_MS
    const time_local = moment(timestamp)
        .days(day)
        .set('hours', hour)
        .set('minutes', minute)
        .format('dddd - HH:mm')
    return time_local
}

export function formatTimestamp2(timestamp) {
    const minute = (timestamp % HOUR_TO_MS) / MINUTE_TO_MS
    const hour = ((timestamp - minute * MINUTE_TO_MS) % DAY_TO_MS) / HOUR_TO_MS
    const day =
        (timestamp - minute * MINUTE_TO_MS - hour * HOUR_TO_MS) / DAY_TO_MS
    const time_local = moment()
        .days(day)
        .set('hours', hour)
        .set('minutes', minute)
        .set('second', 0)
        .set('millisecond', 0)
    return time_local
}
