import React, { useEffect, useReducer, useCallback } from 'react'
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
import DebounceSelect from 'core/Atoms/DebounceSelect'
import ExamAPI from 'api/ExamAPI'
import StudentAPI from 'api/StudentAPI'
import CourseAPI from 'api/CourseAPI'
import _ from 'lodash'

const { Search } = Input
const { RangePicker } = DatePicker

const Exams = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            data: [],
            search: {
                // min_start_time: moment().startOf('month').valueOf(),
                // max_end_time: moment().endOf('month').valueOf(),
                exam_id: null,
                user_id: null,
                course_id: null
            }
        }
    )

    const getExamHistory = useCallback((query) => {
        setValues({ isLoading: true })
        ExamAPI.getExamHistory({
            page_number: query.page_number || values.page_number,
            page_size: query.page_size || values.page_size,
            min_start_time: query.min_start_time,
            max_end_time: query.max_end_time,
            exam_id: query.exam_id,
            user_id: query.user_id,
            course_id: query.course_id
        })
            .then((res) => {
                setValues({
                    isLoading: false,
                    data: res.data,
                    total: res.pagination.total
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.response.data.message
                })
                setValues({ isLoading: false })
            })
            .finally(() => setValues({ isLoading: false }))
    }, [])

    useEffect(() => {
        // getExamHistory({})
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setValues({ page_number, page_size })
            getExamHistory({
                page_number,
                page_size,
                ...values.search
            })
        },
        [values.page_size, values.page_number, values.search]
    )

    const handleChangeSearch = useCallback(
        (vls) => {
            setValues({ search: { ...values.search, ...vls } })
            getExamHistory({
                page_number: values.page_number,
                page_size: values.page_size,
                user_id: vls.user_id || values.search.user_id,
                exam_id: vls.exam_id || values.search.exam_id,
                course_id: vls.course_id || values.search.course_id
            })
        },
        [values.page_size, values.page_number, values.search]
    )
    const columns: ColumnsType = [
        {
            title: 'Exam Name',
            dataIndex: 'exam',
            key: 'exam',
            align: 'center',
            width: '5%',
            render: (text, record: any) => <span>{text?.name}</span>
        },
        {
            title: 'Student',
            dataIndex: 'user',
            key: 'user',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <Tag color='cyan'>
                    <span>{text?.full_name}</span>
                </Tag>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '5%',
            render: (text, record: any) => <span>{text?.name}</span>
        },
        {
            title: 'Type',
            dataIndex: 'exam',
            key: 'exam',
            align: 'center',
            width: '5%',
            render: (text, record: any) => {
                if (!_.isEmpty(record.units) && record.units.length !== 0) {
                    return <Tag color='green'>Exam</Tag>
                }
                return <Tag color='red'>Test</Tag>
            }
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                moment(record.created_time).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Doing Time(minutes)',
            dataIndex: 'start_time',
            key: 'start_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                record.submit_time
                    ? (
                          moment(record?.submit_time).diff(
                              moment(record?.start_time),
                              'seconds'
                          ) / 60
                      ).toFixed(2)
                    : 'NaN'
        },
        {
            title: 'Score',
            dataIndex: 'user_score',
            key: 'user_score',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <span>
                    {text}/{record.score}
                </span>
            )
        }
    ]

    return (
        <Card title='Exam History'>
            <Row className='mb-4' gutter={[10, 10]}>
                {/* <Col span={4}>
                    <RangePicker
                        allowClear={false}
                        onChange={() => {}}
                        // disabledDate={disabledDateTime}
                        value={[values.min_start_time, values.max_end_time]}
                    />
                </Col> */}
                {/* <Col span={4}>
                    <DebounceSelect
                        // defaultValue={reportUserId}
                        placeholder='Search by exam'
                        fetchOptions={fetchExams}
                        style={{ width: '100%' }}
                        onChange={(v) => handleChangeSearch({ exam_id: v })}
                    />
                </Col> */}
                {/* <Col span={4}>
                    <DebounceSelect
                        // defaultValue={reportUserId}
                        placeholder='Search by user'
                        fetchOptions={fetchStudent}
                        style={{ width: '100%' }}
                        onChange={(v) => handleChangeSearch({ user_id: v })}
                    />
                </Col> */}
                {/* <Col span={4}>
                    <DebounceSelect
                        // defaultValue={reportUserId}
                        placeholder='Search by course'
                        fetchOptions={fetchCourse}
                        style={{ width: '100%' }}
                        onChange={(v) => handleChangeSearch({ course_id: v })}
                    />
                </Col> */}
            </Row>
            <Table
                bordered
                rowKey={(record: any) => record.id}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                dataSource={values.data}
            />
        </Card>
    )
}

export default Exams
