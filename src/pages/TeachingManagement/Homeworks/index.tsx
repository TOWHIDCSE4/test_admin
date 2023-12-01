import React, { useEffect, useReducer, useCallback } from 'react'
import HomeworkAPI from 'api/HomeworkAPI'
import StudentAPI from 'api/StudentAPI'
import QuizAPI from 'api/QuizAPI'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Tag,
    Popover,
    Select,
    Input,
    DatePicker,
    Space
} from 'antd'
import { SkypeOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import { IBooking } from 'types'
import { EnumOrderType } from 'const'
import { debounce } from 'lodash'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import HistoryModal from './history-modal'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search } = Input
const { RangePicker } = DatePicker

const HomeWorks = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            homeworks: [],
            students: [],
            isFetchingUser: false,
            // student_id: 0,
            min_start_time: moment().startOf('month'),
            max_end_time: moment().endOf('month'),
            unit_name: '',
            visibleHistory: false,
            selectedBooking: {}
        }
    )

    const getHomeworks = useCallback(
        ({
            page_size,
            page_number,
            student_id,
            unit_name,
            min_start_time,
            max_end_time
        }) => {
            setValues({ isLoading: true })
            if (max_end_time) max_end_time = max_end_time.valueOf()
            if (min_start_time) min_start_time = min_start_time.valueOf()
            QuizAPI.getHomeworksHistory({
                page_size,
                page_number,
                student_id,
                unit_name,
                min_start_time,
                max_end_time
            })
                .then((res) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({
                        homeworks: res.data.sort(
                            (a, b) =>
                                a.first_time_do_homework -
                                b.first_time_do_homework
                        ),
                        total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        []
    )

    const fetchStudent = useCallback(
        async (q) => {
            const res = await StudentAPI.searchStudentByString({
                page_number: 1,
                page_size: 100,
                role: 'STUDENT',
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        },
        [values]
    )

    const handleChangeSearchStudent = useCallback(
        (value) => {
            setValues({ student_id: value })
            getHomeworks({
                ...values,
                student_id: value,
                page_size: values.page_size,
                page_number: values.page_number
            })
        },
        [values]
    )

    const onSearchUnitName = useCallback((e) => {
        setValues({ unit_name: e.target.value })
        getHomeworks({
            ...values,
            unit_name: e.target.value
        })
    }, [])

    const handleRangePicker = useCallback((time_range) => {
        if (
            time_range &&
            time_range[0] &&
            time_range[1] &&
            time_range[0] < time_range[1]
        ) {
            setValues({
                min_start_time: time_range[0],
                max_end_time: time_range[1]
            })
            getHomeworks({
                ...values,
                min_start_time: time_range[0],
                max_end_time: time_range[1]
            })
        } else {
            notification.error({
                message: 'Error',
                description: 'Date time invalid'
            })
        }
    }, [])

    useEffect(() => {
        setValues({ visibleHistory: false })
        getHomeworks({
            ...values,
            page_size: values.page_size,
            page_number: values.page_number
        })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            getHomeworks({
                ...values,
                page_number: pageNumber,
                page_size: pageSize
            })
        },
        [values]
    )

    const toggleViewHistory = useCallback(
        (visible: boolean, selectedBooking?: IBooking) => {
            setValues({ visibleHistory: visible })
            setValues({ selectedBooking })
        },
        [values]
    )

    const columns: ColumnsType = [
        // {
        //     title: 'Course',
        //     dataIndex: 'unit',
        //     key: 'unit',
        //     align: 'left',
        //     width: 250,
        //     render: (text, record: any) => (
        //         <span>{text.course && text.course.name}</span>
        //     )
        // },
        {
            title: 'Class',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>{text?.skype_account}</span>
                            <br />
                            <b>Student:</b>
                            <NameTeacherStudent
                                data={record?.student}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <PhoneOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student && record.student.phone_number}
                            </span>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student && record.student.skype_account}
                            </span>
                        </>
                    }
                >
                    <div>
                        <p className='mb-2'>
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                        </p>
                    </div>
                    <p>
                        <b>Student:</b>{' '}
                        <NameTeacherStudent
                            data={record?.student}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                </Popover>
            )
        },
        // {
        //     title: 'Unit',
        //     dataIndex: 'unit',
        //     key: 'unit',
        //     align: 'left',
        //     width: 250,
        //     render: (text, record: any) => (
        //         <span>{text?.name && text?.name}</span>
        //     )
        // },
        {
            title: 'Class Time',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'center',
            width: 120,
            render: (text, record) =>
                text && moment(text?.start_time).format('HH:mm DD/MM/YYYY')
        },
        // {
        //     title: 'Booking type',
        //     dataIndex: 'is_regular_booking',
        //     key: 'is_regular_booking',
        //     align: 'center',
        //     width: 150,
        //     render: (text, record: IBooking) => {
        //         if (record.order) {
        //             if (record.order.type === EnumOrderType.TRIAL) {
        //                 return <Tag color='#87d068'>TRIAL</Tag>
        //             }
        //             if (text) {
        //                 return <Tag color='#f50'>REGULAR</Tag>
        //             }
        //             return <Tag color='#108ee9'>FLEXIBLE</Tag>
        //         }
        //     }
        // },
        {
            title: 'First Finish Time',
            dataIndex: 'first_time_do_homework',
            key: 'first_time_do_homework',
            align: 'center',
            width: 150,
            render: (text, record: IBooking) => {
                if (text) {
                    if (
                        moment(text).diff(
                            moment(record?.calendar?.start_time)
                        ) >
                        48 * 60 * 60 * 1000
                    ) {
                        return (
                            <Tag color='#f50'>
                                {moment(text).format('HH:mm DD/MM/YYYY')}
                            </Tag>
                        )
                    }
                    return (
                        <Tag color='blue'>
                            {moment(text).format('HH:mm DD/MM/YYYY')}
                        </Tag>
                    )
                }
            }
        },
        {
            title: 'Last Finish Time',
            dataIndex: 'last_time_do_homework',
            key: 'last_time_do_homework',
            align: 'center',
            width: 150,
            render: (text, record) =>
                text && moment(text).format('HH:mm DD/MM/YYYY')
        },
        {
            title: 'Total Times',
            dataIndex: 'total_quiz_session',
            key: 'total_quiz_session',
            align: 'center',
            width: 150,
            render: (text, record) => <span>{text && text}</span>
        },
        {
            title: 'Average Score',
            dataIndex: 'average',
            key: 'average',
            align: 'center',
            width: 120,
            render: (text, record) => text
        },
        {
            title: 'Status',
            dataIndex: 'is_done_homework',
            key: 'is_done_homework',
            align: 'center',
            width: 250,
            render: (text, record: IBooking) =>
                text ? (
                    moment(record.first_time_do_homework).diff(
                        moment(record?.calendar?.start_time)
                    ) >
                    48 * 60 * 60 * 1000 ? (
                        <Tag color='green'>Done After 48h</Tag>
                    ) : (
                        <Tag color='green'>Done</Tag>
                    )
                ) : (
                    <Tag color='#f50'>Haven't Test</Tag>
                )
        },
        {
            title: 'Detail',
            key: 'history',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (text, record: IBooking) => (
                <Space size='middle'>
                    <BookOutlined
                        style={{ color: '#1890ff' }}
                        type='button'
                        onClick={() => toggleViewHistory(true, record)}
                        title='History homework result'
                    />
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    // disabledDate={disabledDateTime}
                    value={[values.min_start_time, values.max_end_time]}
                />
            )
        },
        {
            label: 'Search Student',
            engine: (
                <DebounceSelect
                    placeholder='By name'
                    fetchOptions={fetchStudent}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={handleChangeSearchStudent}
                />
            )
        }
    ]

    return (
        <Card title='Homeworks'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                columns={columns}
                dataSource={values.homeworks}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey='_id'
            />
            <HistoryModal
                visible={values.visibleHistory}
                toggleModal={toggleViewHistory}
                booking={values.selectedBooking}
            />
        </Card>
    )
}

export default HomeWorks
