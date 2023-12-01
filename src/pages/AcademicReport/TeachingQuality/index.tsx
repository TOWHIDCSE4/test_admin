import { useCallback, useEffect, useReducer } from 'react'
import { Table, Card, notification, DatePicker, Row, Col, Tag } from 'antd'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import { DATE_FORMAT } from 'const'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'

const ScheduleSlotsReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            start_time: moment().startOf('m')
        }
    )

    const fetchReport = useCallback(
        ({ page_size, page_number, start_time }) => {
            setValues({ isLoading: true })
            ReportAPI.getTeachingQualitiesForAcademyReport({
                page_size,
                page_number,
                month: moment(start_time).get('months') + 1,
                year: moment(start_time).get('years')
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
        fetchReport({ ...values })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            fetchReport({
                page_number: pageNumber,
                page_size: pageSize,
                start_time: values.start_time
            })
        },
        [values]
    )

    const handlerDateFilter = useCallback(
        (v) => {
            setValues({ start_time: v })
            fetchReport({
                page_number: values.page_number,
                page_size: values.page_size,
                start_time: v
            })
        },
        [values]
    )

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text, record: ITeacher, index) => index + 1
        },
        {
            title: 'Mã GV',
            dataIndex: 'teacher_id',
            key: 'teacher_id',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Tên GV',
            dataIndex: 'full_name',
            key: 'full_name',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Quản lý',
            dataIndex: ['staff', 'full_name'],
            key: 'staff',
            width: 150,
            align: 'center',
            render: (text, record: any) => text && <p color='#f50'>{text}</p>
        },
        {
            title: 'Start date',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 150,
            render: (text) => text && moment(text).format(DATE_FORMAT)
        },
        {
            title: 'Nghỉ có phép',
            dataIndex: 'total_authorized_leave',
            key: 'total_authorized_leave',
            width: 120,
            align: 'center',
            render: (text) => <b style={{ color: '#40a9ff' }}>{text}</b>
        },
        {
            title: 'Nghỉ không phép',
            dataIndex: 'total_unauthorized_leave',
            key: 'total_unauthorized_leave',
            align: 'center',
            width: 100,
            render: (text) => <b style={{ color: '#ff4d4f' }}>{text}</b>
        },
        {
            title: 'Vào muộn',
            dataIndex: 'total_late',
            key: 'total_late',
            align: 'center',
            width: 100,
            render: (text) => <b style={{ color: '#d4380d' }}>{text}</b>
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <DatePicker
                    format='MM-YYYY'
                    allowClear={false}
                    picker='month'
                    value={values.start_time}
                    onChange={handlerDateFilter}
                    disabledDate={(current) => current >= moment()}
                />
            )
        }
    ]

    return (
        <Card title='BÁO CÁO CHẤT LƯỢNG GIẢNG DẠY HÀNG THÁNG'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.data_reports}
                columns={columns}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: ITeacher) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
        </Card>
    )
}

export default ScheduleSlotsReport
