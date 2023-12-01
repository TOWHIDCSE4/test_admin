import { FULL_DATE_FORMAT } from 'const'
import _ from 'lodash'
import moment from 'moment'
import { formatTimestamp, getTimestampInWeekToLocal, sanitize } from 'utils'

export const sanitizeMessage = (data) => {
    const dataExtra = JSON.parse(JSON.stringify(data?.extra_info))
    if (dataExtra.booking) {
        if (dataExtra.booking.calendar.start_time) {
            const time = moment(dataExtra.booking.calendar.start_time).format(
                FULL_DATE_FORMAT
            )
            dataExtra.booking.calendar.start_time = time
        }
    }
    return sanitize(
        _.template(data.message)({
            ...dataExtra,
            start_time: dataExtra.start_time
                ? moment(dataExtra.start_time).format(FULL_DATE_FORMAT)
                : '',
            regular_start_time: dataExtra.regular_start_time
                ? moment(dataExtra.regular_start_time).format('dddd HH:mm Z')
                : '',
            expired_time: dataExtra.expired_time
                ? moment(dataExtra.expired_time).format(FULL_DATE_FORMAT)
                : '',
            old_booking_start_time: dataExtra.old_booking_start_time
                ? moment(dataExtra.old_booking_start_time).format(
                      FULL_DATE_FORMAT
                  )
                : '',
            new_booking_start_time: dataExtra.new_booking_start_time
                ? moment(dataExtra.new_booking_start_time).format(
                      FULL_DATE_FORMAT
                  )
                : '',
            schedule_time: dataExtra.schedule_time
                ? formatTimestamp(
                      getTimestampInWeekToLocal(dataExtra.schedule_time)
                  )
                : '',
            end_time: dataExtra.end_time
                ? moment(dataExtra.end_time).format(FULL_DATE_FORMAT)
                : ''
        })
    )
}
