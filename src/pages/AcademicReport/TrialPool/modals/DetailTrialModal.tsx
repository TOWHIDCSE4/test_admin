import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Popover, Table, DatePicker, Card, Tag } from 'antd'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import moment, { Moment } from 'moment'
import { IBooking } from 'types'
import { CurriculumList, DATE_FORMAT } from 'const'
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
    const [bookings, setBookings] = useState<IBooking[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchTrialBookings = (query?: {
        page_size: number
        page_number: number
    }) => {
        setLoading(true)
        const filter: any = {
            ...query
        }
        if (start_time) filter.start_time = start_time.valueOf()
        if (end_time) filter.end_time = end_time.valueOf()
        if (data?.teacher_id) {
            setLoading(true)
            ReportAPI.getTrialBookingsByTeacherForAcademyReport(
                data?.teacher_id,
                filter
            )
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

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            if (data?.teacher_id) {
                fetchTrialBookings({
                    page_number: pageNumber,
                    page_size: pageSize
                })
            }
        }
    }, [visible, data, status])

    const onClose = useCallback(() => {
        toggleModal(false)
        setBookings([])
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(pageSize)
            fetchTrialBookings({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            fetchTrialBookings({
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
            title: 'Ngày học thử',
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
            title: 'Mã HV',
            dataIndex: 'student_id',
            key: 'student_id',
            align: 'center',
            width: 120,
            render: (text, record: any) => <Tag color='#40a9ff'>{text}</Tag>
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
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Giáo trình',
            dataIndex: 'curriculum_id',
            key: 'curriculum_id',
            align: 'center',
            width: 250,
            render: (text, record: any) => {
                const curriculum = _.find(CurriculumList, (o) => o.id === text)
                if (curriculum) {
                    return <span>{curriculum.name}</span>
                }
            }
        },
        {
            title: 'Gói học',
            dataIndex: 'ordered_packages',
            key: 'ordered_packages',
            align: 'center',
            width: 250,
            render: (text) => {
                if (!_.isEmpty(text)) {
                    if (text.length === 1) return text[0].package_name
                    return (
                        <Popover
                            content={
                                <div
                                    style={{
                                        maxHeight: '200px',
                                        height: '200px',
                                        overflow: 'auto'
                                    }}
                                >
                                    {text.map((item, index) => (
                                        <p key={index} className='p-0'>
                                            {index + 1}. {item.package_name}
                                        </p>
                                    ))}
                                </div>
                            }
                        >
                            <Tag color='processing'>{text.length} packages</Tag>
                        </Popover>
                    )
                }
            }
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
            title={`DANH SÁCH LỚP HỌC TRIAL CỦA GIÁO VIÊN: ${
                data?.username
            } - Từ ngày ${start_time.format(
                DATE_FORMAT
            )} đến ngày ${end_time.format(DATE_FORMAT)}`}
            footer={null}
            width={1280}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(DetailTrialModal)
