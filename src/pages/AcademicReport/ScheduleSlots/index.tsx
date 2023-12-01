import { useCallback, useEffect, useReducer } from 'react'
import { Table, Card, notification, DatePicker, Row, Col, Tag } from 'antd'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'

const ScheduleSlotsReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            teachers: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            start_time: moment().startOf('m')
        }
    )

    const fetchScheduleSlotReport = useCallback(
        ({ page_size, page_number, start_time }) => {
            setValues({ isLoading: true })
            ReportAPI.getScheduleSlotForReport({
                page_size,
                page_number,
                start_time: moment(start_time).startOf('m').valueOf(),
                end_time: moment(start_time).endOf('m').valueOf()
            })
                .then((res) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ teachers: res.data, total })
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
        TeacherLevelAPI.getTeacherLevels({}).then((result) => {
            fetchScheduleSlotReport({ ...values })
        })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            fetchScheduleSlotReport({
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
            fetchScheduleSlotReport({
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
            dataIndex: '_id',
            key: '_id',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Tên GV',
            dataIndex: 'first_name',
            key: 'first_name',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={record?.teacher?.user}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Quản lý',
            dataIndex: ['staff', 'fullname'],
            key: 'staff',
            width: 150,
            align: 'center',
            render: (text, record: any) =>
                record?.teacher?.staff && (
                    <p>{record?.teacher?.staff[0]?.fullname}</p>
                )
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
            width: 150,
            render: (text, record: ITeacher) => (
                <p>{record?.teacher?.level.name}</p>
            )
        },
        {
            title: 'Số lớp phải mở',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 120,
            align: 'center',
            render: (text: ITeacher) => (
                <b style={{ color: 'red' }}>
                    {text?.level?.min_calendar_per_circle}
                </b>
            )
        },
        {
            title: 'Thực tế đã mở',
            dataIndex: 'schedule_slots',
            key: 'schedule_slots',
            align: 'center',
            width: 100,
            render: (text) => (
                <b
                    style={{
                        color: 'blue'
                    }}
                >
                    {text}
                </b>
            )
        },
        {
            title: 'Thực hiện',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            width: 100,
            render: (text: ITeacher, record: any) => {
                let per = 0
                if (
                    text?.level?.min_calendar_per_circle &&
                    text?.level?.min_calendar_per_circle > 0
                ) {
                    per = _.round(
                        (record.schedule_slots /
                            text?.level?.min_calendar_per_circle) *
                            100,
                        2
                    )
                }
                if (per > 50) {
                    return <b style={{ color: 'green' }}>{per} %</b>
                }
                return <b style={{ color: 'red' }}>{per} %</b>
            }
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
                    disabledDate={(current) => current > moment()}
                />
            )
        }
    ]

    return (
        <Card title='BÁO CÁO SCHEDULE CỦA GIÁO VIÊN'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.teachers}
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
