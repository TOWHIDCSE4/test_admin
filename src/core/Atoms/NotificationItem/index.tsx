import { FC, memo, ReactNode } from 'react'
import { INotification } from 'types'
import moment from 'moment'
import { FULL_DATE_FORMAT, locateMoment } from 'const'
import _ from 'lodash'
import { sanitize } from 'utils'
import { sanitizeMessage } from 'utils/notification'

moment.updateLocale('en', locateMoment)

type Props = {
    data: INotification
    icon?: ReactNode
}

const NotificationItem: FC<Props> = ({ data, icon }) => {
    return (
        <a className='list-group-item'>
            <div className='row no-gutters align-items-center'>
                <div className='col-2'>
                    <i
                        className='text-warning fas fa-fw fa-bell'
                        data-feather='bell'
                    />
                </div>
                <div className='col-10'>
                    <div className='text-dark'>
                        {data.seen ? (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeMessage(data)
                                }}
                            />
                        ) : (
                            <b>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeMessage(data)
                                    }}
                                />
                            </b>
                        )}
                    </div>
                    {/* <div className='text-muted small mt-1'>
                            Aliquam ex eros, imperdiet vulputate hendrerit et.
                        </div> */}
                    <div className='text-muted small mt-1'>
                        {data.seen ? (
                            <span
                                title={moment(data.created_time).format(
                                    'HH:mm DD-MM-YYYY'
                                )}
                                style={{ cursor: 'default' }}
                            >
                                {moment(data.created_time).fromNow()}
                            </span>
                        ) : (
                            <b>
                                <span
                                    title={moment(data.created_time).format(
                                        'HH:mm DD-MM-YYYY'
                                    )}
                                    style={{ cursor: 'default' }}
                                >
                                    {moment(data.created_time).fromNow()}
                                </span>
                            </b>
                        )}
                    </div>
                </div>
            </div>
        </a>
    )
}

export default memo(NotificationItem)
