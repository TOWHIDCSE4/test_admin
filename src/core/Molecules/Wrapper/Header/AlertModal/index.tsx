import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Table, Card } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { EnumAlertType, INotification } from 'types'
import { FULL_DATE_FORMAT } from 'const'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import { sanitize } from 'utils'
import NotificationAPI from 'api/NotificationAPI'
import { sanitizeMessage } from 'utils/notification'

type Props = {
    visible: boolean
    toggleModal: (val: boolean) => void
}

const AlertModal: FC<Props> = ({ visible, toggleModal }) => {
    const [loading, setLoading] = useState(false)
    const [alerts, setAlerts] = useState<INotification[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchAlerts = (query: { page_size: number; page_number: number }) => {
        setLoading(true)
        NotificationAPI.getNotifications({ ...query, is_alert: true })
            .then((res: any) => {
                const newAlerts = [...alerts, ...res.data]
                setAlerts(newAlerts)
                if (res.pagination.total) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err: any) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (_pageNumber !== pageNumber) {
                setPageNumber(_pageNumber)
                fetchAlerts({
                    page_number: _pageNumber,
                    page_size: pageSize
                })
            }
            if (_pageSize !== pageSize) {
                setPageSize(_pageNumber)
                fetchAlerts({
                    page_number: pageNumber,
                    page_size: _pageSize
                })
            }
        },
        [pageNumber, pageSize]
    )

    useEffect(() => {
        if (visible) {
            fetchAlerts({ page_number: pageNumber, page_size: pageSize })
        }
    }, [visible])

    const columns: ColumnsType = [
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            width: '55%',
            render: (text: any, record: any) =>
                record.seen ? (
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeMessage(record)
                        }}
                    />
                ) : (
                    <b>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeMessage(record)
                            }}
                        />
                    </b>
                )
        },
        {
            title: 'Extra info',
            dataIndex: 'extra_info',
            key: 'extra_info',
            width: '30%',
            render: (text, record) => {
                if (
                    text?.alerted &&
                    text?.alerted.includes(
                        EnumAlertType.ATTENDANCE_BY_NOTIFICATION
                    )
                ) {
                    return (
                        <>
                            <p>
                                Course: <b>{text?.course_name}</b>
                            </p>
                            <p style={{ color: 'red' }}>
                                Total absent: <b>{text?.total_absent}</b>
                            </p>
                        </>
                    )
                }
                if (
                    text?.alerted &&
                    text?.alerted.includes(
                        EnumAlertType.DO_NOT_HOMEWORK_BY_NOTIFICATION
                    )
                ) {
                    return (
                        <>
                            <p>
                                Course: <b>{text?.course_name}</b>
                            </p>
                            <p style={{ color: 'red' }}>
                                Unit: <b>{text?.unit_name}</b>
                            </p>
                        </>
                    )
                }
                if (
                    text?.alerted &&
                    text?.alerted.includes(
                        EnumAlertType.WILL_EXPIRED_BY_NOTIFICATION
                    )
                ) {
                    return (
                        <>
                            <p>
                                Package: <b>{text?.package_name}</b>
                            </p>
                            <p style={{ color: 'red' }}>
                                Expired date:{' '}
                                <b>
                                    {text?.expired_time &&
                                        moment(text?.expired_time).format(
                                            FULL_DATE_FORMAT
                                        )}
                                </b>
                            </p>
                        </>
                    )
                }
            }
        },
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            render: (text) => text && moment(text).format('HH:mm:ss DD/MM/YYYY')
        }
    ]

    const renderBody = () => (
        <>
            <Table
                bordered
                columns={columns}
                dataSource={alerts}
                loading={loading}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey='_id'
            />
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Alert student'
            footer={null}
            width={1024}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AlertModal)
