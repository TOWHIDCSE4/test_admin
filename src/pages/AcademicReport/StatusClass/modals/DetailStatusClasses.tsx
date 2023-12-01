import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Table, DatePicker, Card, Tag } from 'antd'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import { IBooking } from 'types'
import BookingAPI from 'api/BookingAPI'
import { DATE_FORMAT, ENUM_BOOKING_STATUS } from 'const'
import NameTeacherStudent from 'components/name-teacher-student'

type Props = {
    data: any
    visible: boolean
    toggleModal: (val: boolean) => void
    status: ENUM_BOOKING_STATUS[]
}

const DetailStatusClassesModal: FC<Props> = ({
    visible,
    data,
    status,
    toggleModal
}) => {
    const [loading, setLoading] = useState(false)
    const [bookings, setBookings] = useState<IBooking[]>([])
    const [queryParams, setQueryParams] = useState({
        status: [],
        min_start_time: moment().startOf('month'),
        max_end_time: moment().endOf('month'),
        sort: 'prev'
    })

    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchBookings = (query?: {
        page_size: number
        page_number: number
        sort: string
        status: ENUM_BOOKING_STATUS[]
        min_start_time: any
        max_end_time: any
    }) => {
        setLoading(true)
        const filter = {
            ...query
        }
        if (filter.min_start_time)
            filter.min_start_time = filter.min_start_time.valueOf()
        if (filter.max_end_time)
            filter.max_end_time = filter.max_end_time.valueOf()
        BookingAPI.getAllBookings(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setBookings(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (visible && !_.isEmpty(data) && !_.isEmpty(status)) {
            if (data.date) {
                const min_start_time = moment(data.date).startOf('day')
                const max_end_time = moment(data.date).endOf('day')
                setQueryParams({
                    ...queryParams,
                    min_start_time,
                    max_end_time,
                    status
                })
                fetchBookings({
                    min_start_time,
                    max_end_time,
                    status,
                    sort: queryParams.sort,
                    page_number: pageNumber,
                    page_size: pageSize
                })
            }
        }
    }, [visible, data, status])

    const onClose = useCallback(() => {
        toggleModal(false)
        setBookings([])
        setQueryParams({
            status: [],
            min_start_time: moment().startOf('month'),
            max_end_time: moment().endOf('month'),
            sort: 'prev'
        })
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(pageSize)
            fetchBookings({
                ...queryParams,
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            fetchBookings({
                ...queryParams,
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const columns: ColumnsType<IBooking> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 80,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            render: (text, record) => text
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <>
                    <p>
                        {text &&
                            moment(text.start_time).format('HH:mm DD/MM/YYYY')}
                    </p>
                </>
            )
        },
        {
            title: 'Thời gian hoàn thành',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'center',
            width: 180,
            render: (text, record) => (
                <>
                    <p>
                        {text &&
                            moment(text.end_time).format('HH:mm DD/MM/YYYY')}
                    </p>
                </>
            )
        },
        {
            title: 'Lesson',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: 250,
            render: (text, record: any) => <span>{text && text.name}</span>
        },
        {
            title: 'Unit',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: 250,
            render: (text, record: any) => (
                <span>{record.unit && record.unit.name}</span>
            )
        },
        {
            title: 'Giáo trình',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: 250,
            render: (text, record: any) => <span>{text && text.name}</span>
        },
        {
            title: 'Mã GV',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            width: 120,
            render: (text, record: any) => (
                <div>
                    <Tag color='cyan' className='mb-2'>
                        {text && `${text.id}`}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Tên GV',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            width: 200,
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Mã HV',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            width: 120,
            render: (text, record: any) => (
                <Tag color='gold'>
                    {record.student && `${record.student.id}`}
                </Tag>
            )
        },
        {
            title: 'Tên HV',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: 200,
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        }
    ]

    const renderBody = () => (
        <Card loading={loading} bordered={false}>
            <Table
                bordered
                dataSource={bookings}
                columns={columns}
                loading={loading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500,
                    y: 500
                }}
            />
        </Card>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={`DANH SÁCH TRẠNG THÁI LỚP HỌC NGÀY ${
                data?.date && moment(data.date).format(DATE_FORMAT)
            }`}
            footer={null}
            width={1280}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(DetailStatusClassesModal)
