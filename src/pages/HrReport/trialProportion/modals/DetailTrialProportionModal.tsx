import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Popover, Table, DatePicker, Card, Tag } from 'antd'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import moment, { Moment } from 'moment'
import { IBooking } from 'types'
import { CurriculumList, DATE_FORMAT, ENUM_BOOKING_STATUS } from 'const'
import ReportAPI from 'api/ReportAPI'
import NameTeacherStudent from 'components/name-teacher-student'

type Props = {
    data: any
    visible: boolean
    start_time: Moment
    end_time: Moment
    toggleModal: (val: boolean) => void
}

const DetailTrialModal: FC<Props> = ({
    visible,
    data,
    toggleModal,
    start_time,
    end_time
}) => {
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [bookings, setBookings] = useState<IBooking[]>([])
    const [listStudentPay, setDataStudentPay] = useState<any[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize2, setPageSize2] = useState(10)
    const [pageNumber2, setPageNumber2] = useState(1)
    const [total2, setTotal2] = useState(0)

    const colorStatus = (_status) => {
        switch (_status) {
            case ENUM_BOOKING_STATUS.COMPLETED:
                return 'success'
            case ENUM_BOOKING_STATUS.PENDING:
                return 'warning'
            case ENUM_BOOKING_STATUS.UPCOMING:
                return 'cyan'
            case ENUM_BOOKING_STATUS.TEACHING:
                return 'processing'
            case ENUM_BOOKING_STATUS.STUDENT_ABSENT:
                return 'error'
            case ENUM_BOOKING_STATUS.TEACHER_ABSENT:
                return 'error'
            case ENUM_BOOKING_STATUS.CANCEL_BY_STUDENT:
                return 'error'
            case ENUM_BOOKING_STATUS.CANCEL_BY_TEACHER:
                return 'error'
            default:
                break
        }
    }

    const fetchUserTrialBookings = (query?: {
        page_size: number
        page_number: number
    }) => {
        setLoading(true)
        const filter: any = {
            ...query
        }
        if (start_time) filter.start_time = start_time.valueOf()
        if (end_time) filter.end_time = end_time.valueOf()
        if (data?.sale_id) {
            setLoading(true)
            ReportAPI.getTrialBookingsBySaleForSaleReport(data?.sale_id, filter)
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
    }

    const fetchUserBuyMainPackage = (query?: {
        page_size: number
        page_number: number
    }) => {
        setLoading2(true)
        const filter: any = {
            ...query
        }
        if (start_time) filter.start_time = start_time.valueOf()
        if (end_time) filter.end_time = end_time.valueOf()
        if (data?.sale_id) {
            setLoading2(true)
            ReportAPI.getListTrialStudentBuyMainPackage(data?.sale_id, filter)
                .then((res) => {
                    if (res.pagination && res.pagination.total >= 0) {
                        setTotal2(res.pagination.total)
                    }
                    setDataStudentPay(res.data)
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading2(false))
        }
    }

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            if (data?.sale_id) {
                fetchUserTrialBookings({
                    page_number: pageNumber,
                    page_size: pageSize
                })
                fetchUserBuyMainPackage({
                    page_number: pageNumber2,
                    page_size: pageSize2
                })
            }
        }
    }, [visible, data, status])

    const onClose = useCallback(() => {
        setPageNumber(1)
        setPageNumber2(1)
        toggleModal(false)
        setBookings([])
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(pageSize)
            fetchUserTrialBookings({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            fetchUserTrialBookings({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const handleChangePagination2 = (_pageNumber, _pageSize) => {
        if (pageSize2 !== _pageSize) {
            setPageSize2(pageSize2)
            fetchUserBuyMainPackage({
                page_number: pageNumber2,
                page_size: _pageSize
            })
        } else if (pageNumber2 !== _pageNumber) {
            setPageNumber2(_pageNumber)
            fetchUserBuyMainPackage({
                page_number: _pageNumber,
                page_size: pageSize2
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
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Học viên',
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
        },
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            render: (text, record: any) => <Tag color='#40a9ff'>{text}</Tag>
        },
        {
            title: 'Thời gian học',
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <Tag color={colorStatus(text)}>{ENUM_BOOKING_STATUS[text]}</Tag>
            )
        },
        {
            title: 'Gói học',
            dataIndex: 'ordered_package',
            key: 'name_ordered_package',
            align: 'center',
            width: 250,
            render: (text) => (
                <>
                    <p>{text && text.package_name}</p>
                </>
            )
        }
    ]

    const columns2: ColumnsType<IBooking> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index2',
            fixed: true,
            width: 80,
            align: 'center',
            render: (text, record, index) =>
                pageSize2 * (pageNumber2 - 1) + index + 1
        },
        {
            title: 'Học viên',
            dataIndex: 'student',
            key: 'student2',
            align: 'center',
            width: 200,
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Gói học',
            dataIndex: 'ordered_package',
            key: 'name_ordered_package2',
            align: 'center',
            width: 250,
            render: (text) => (
                <>
                    <p>{text && text.package_name}</p>
                </>
            )
        },
        {
            title: 'Active date',
            dataIndex: 'ordered_package',
            key: 'active_date_ordered_package',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <>
                    <p>
                        {text &&
                            moment(text.activation_date).format(
                                'HH:mm DD/MM/YYYY'
                            )}
                    </p>
                </>
            )
        }
    ]

    const renderBody = () => (
        <>
            <Card title='Danh sách Học viên học trial' bordered={false}>
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
            <Card title='Danh sách Học viên mua gói học chính' bordered={false}>
                <Table
                    bordered
                    dataSource={listStudentPay}
                    columns={columns2}
                    loading={loading2}
                    pagination={{
                        defaultCurrent: pageNumber2,
                        current: pageNumber2,
                        pageSize: pageSize2,
                        total: total2,
                        onChange: handleChangePagination2
                    }}
                    rowKey={(record: any) => record?._id}
                    scroll={{
                        x: 500,
                        y: 500
                    }}
                />
            </Card>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={`Chi tiết - ${data?.sale_name}`}
            footer={null}
            width={1280}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(DetailTrialModal)
