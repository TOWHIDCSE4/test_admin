import { useCallback, useEffect, useReducer, useState } from 'react'
import { Table, Card, notification, DatePicker, Row, Col, Tag } from 'antd'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import { DATE_FORMAT, ENUM_BOOKING_STATUS } from 'const'
import { notify } from 'utils/notify'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import DetailStatusClasses from './modals/DetailStatusClasses'

const { RangePicker } = DatePicker

const StatusClassesReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            start_time: moment().startOf('month'),
            end_time: moment().endOf('month')
        }
    )

    const [visibleModal, setVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState()
    const [status, setStatus] = useState<ENUM_BOOKING_STATUS[]>([])

    const fetchStatusClasses = useCallback(
        ({ page_size, page_number, start_time, end_time }) => {
            setValues({ isLoading: true })
            ReportAPI.getStatusClassesForAcademyReport({
                page_size,
                page_number,
                start_time: start_time.valueOf(),
                end_time: end_time.valueOf()
            })
                .then((res) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ data_reports: res.data, total })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    useEffect(() => {
        fetchStatusClasses({ ...values })
    }, [])

    const handleRangePicker = (value) => {
        if (value[0] && value[1] && value[0] < value[1]) {
            setValues({
                start_time: value[0],
                end_time: value[1]
            })
            fetchStatusClasses({
                page_number: values.page_number,
                page_size: values.page_size,
                start_time: value[0],
                end_time: value[1]
            })
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().endOf('month'))

    const toggleModal = useCallback(
        (val: boolean, item?: any, _status?: ENUM_BOOKING_STATUS[]) => {
            setVisible(val)
            setStatus(_status)
            setSelectedItem(item)
        },
        [visibleModal, status, selectedItem]
    )
    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 50,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text) => <b>{moment(text).format(DATE_FORMAT)}</b>
        },
        {
            title: 'Hoàn thành',
            dataIndex: 'total_completed',
            key: 'total_completed',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text, record: any) => (
                <b
                    className='completed clickable'
                    onClick={() =>
                        toggleModal(true, record, [
                            ENUM_BOOKING_STATUS.COMPLETED
                        ])
                    }
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Học viên vắng',
            dataIndex: 'total_absent_by_student',
            key: 'total_absent_by_student',
            width: 100,
            align: 'center',
            render: (text, record: any) => (
                <b
                    className='absent clickable'
                    onClick={() =>
                        toggleModal(true, record, [
                            ENUM_BOOKING_STATUS.STUDENT_ABSENT
                        ])
                    }
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Giáo viên vắng',
            dataIndex: 'total_absent_by_teacher',
            key: 'total_absent_by_teacher',
            align: 'center',
            width: 100,
            render: (text, record: any) => (
                <b
                    className='absent clickable'
                    onClick={() =>
                        toggleModal(true, record, [
                            ENUM_BOOKING_STATUS.TEACHER_ABSENT
                        ])
                    }
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Học viên hủy',
            dataIndex: 'total_cancel_by_student',
            key: 'total_cancel_by_student',
            width: 100,
            align: 'center',
            render: (text, record: any) => (
                <b
                    className='cancel clickable'
                    onClick={() =>
                        toggleModal(true, record, [
                            ENUM_BOOKING_STATUS.CANCEL_BY_STUDENT
                        ])
                    }
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Giáo viên hủy',
            dataIndex: 'total_cancel_by_teacher',
            key: 'total_cancel_by_teacher',
            width: 100,
            align: 'center',
            render: (text, record: any) => (
                <b
                    className='cancel clickable'
                    onClick={() =>
                        toggleModal(true, record, [
                            ENUM_BOOKING_STATUS.CANCEL_BY_TEACHER
                        ])
                    }
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Vào muộn',
            dataIndex: 'total_late',
            key: 'total_late',
            align: 'center',
            width: 100,
            render: (text, record: any) => (
                <b
                    className='cancel clickable'
                    onClick={() => toggleModal(true, record, [])}
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Thay đổi giáo viên thành công',
            dataIndex: 'total_change_teacher',
            key: 'total_change_teacher',
            align: 'center',
            width: 100,
            render: (text, record: any) => (
                <b
                    className='completed clickable'
                    onClick={() => toggleModal(true, record, [])}
                >
                    {text}
                </b>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    onChange={handleRangePicker}
                    disabledDate={disabledDateTime}
                    value={[values.start_time, values.end_time]}
                    format={DATE_FORMAT}
                    allowClear={false}
                />
            )
        }
    ]

    return (
        <Card title='BÁO CÁO TỔNG HỢP TRẠNG THÁI LỚP HỌC'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.data_reports}
                columns={columns}
                loading={values.isLoading}
                // pagination={{
                //     defaultCurrent: values.page_number,
                //     pageSize: values.page_size,
                //     // total: values.total,
                //     // onChange: handleChangePagination,
                //     current: values.page_number
                // }}
                rowKey={(record: any) => record?.date}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
            <DetailStatusClasses
                data={selectedItem}
                visible={visibleModal}
                status={status}
                toggleModal={toggleModal}
            />
        </Card>
    )
}

export default StatusClassesReport
