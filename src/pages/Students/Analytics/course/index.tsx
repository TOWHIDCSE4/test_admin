import React, { useEffect, useCallback, useReducer, useState } from 'react'
import {
    Alert,
    Card,
    Row,
    Col,
    Table,
    Input,
    Button,
    notification,
    Empty,
    Collapse,
    Space,
    Select,
    DatePicker,
    Spin,
    Tag,
    Divider,
    Popover
} from 'antd'
import ScheduledMemoAPI from 'api/ScheduledMemo'
import moment from 'moment'
import { EditScheduledMemoDTO, EnumScheduledMemoType } from 'types'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import CourseAPI from 'api/CourseAPI'
import UserAPI from 'api/UserAPI'
// import PDFModal from './modal/PDFModal'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import ViewReport from './view-report-modal'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select

const getAvgPoint = (item) =>
    _.round(
        _.mean(
            [
                item.attendance.point,
                item.attitude.point,
                item.homework.point,
                item.exam_result
            ].filter((point) => _.isFinite(point))
        ),
        2
    )

const StudentAnalytics = () => {
    const [state, setState] = useReducer(
        (curState, newState) => ({ ...curState, ...newState }),
        {
            isLoading: false,
            memos: [],
            students: [],
            dateType: 'year',
            date: moment(),
            page_size: 10,
            page_number: 1,
            total: 0,
            course_id: null,
            teacher_id: null,
            student_id: null,
            // showPDFModal: false,
            // pdfContent: null,
            showReportModal: false,
            reportContent: null
        }
    )

    const fetch = useCallback(
        async (query: {
            pageSize?: number
            pageNumber?: number
            courseId?: number
            studentId?: number
            teacherId?: number
        }) => {
            setState({ isLoading: true })
            try {
                const res = await ScheduledMemoAPI.getScheduledMemo({
                    type: EnumScheduledMemoType.COURSE,
                    course_id: query.courseId,
                    student_id: query.studentId,
                    teacher_id: query.teacherId,
                    page_number: query.pageNumber,
                    page_size: query.pageSize,
                    sort: 'created_time:-1'
                })
                setState({
                    memos: res.data.map((d) => ({
                        average: getAvgPoint(d),
                        ...d
                    }))
                })
                if (res.pagination && res.pagination.total >= 0) {
                    setState({ total: res.pagination.total })
                }
            } catch (err) {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            }
            setState({ isLoading: false })
        },
        []
    )

    useEffect(() => {
        fetch({
            pageSize: state.page_size,
            pageNumber: state.page_number,
            courseId: state.course_id,
            studentId: state.student_id,
            teacherId: state.teacher_id
        })
    }, [])

    const fetchCourse = useCallback(async (search) => {
        const res = await CourseAPI.getCourses({
            page_number: 1,
            page_size: 100,
            search
        })
        return res.data.map((i) => ({
            label: i.name,
            value: i.id
        }))
    }, [])

    const fetchStudent = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'STUDENT',
            q
        })
        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const fetchTeacher = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'TEACHER',
            q
        })
        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const handlerCourseFilter = useCallback(
        (v) => {
            setState({ course_id: v })
            fetch({
                pageSize: state.page_size,
                pageNumber: state.page_number,
                courseId: v,
                studentId: state.student_id,
                teacherId: state.teacher_id
            })
        },
        [state.page_size, state.page_number, state.student_id, state.teacher_id]
    )

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setState(page_size)
            setState(page_number)
            fetch({
                pageSize: page_size,
                pageNumber: page_number,
                courseId: state.course_id,
                studentId: state.student_id,
                teacherId: state.teacher_id
            })
        },
        [state.course_id, state.student_id, state.teacher_id]
    )

    const handlerStudentFilter = useCallback(
        (v) => {
            setState({ student_id: v })
            fetch({
                pageSize: state.page_size,
                pageNumber: state.page_number,
                courseId: state.course_id,
                studentId: v,
                teacherId: state.teacher_id
            })
        },
        [state.course_id, state.page_size, state.page_number, state.teacher_id]
    )

    const handlerTeacherFilter = useCallback(
        (v) => {
            setState({ teacher_id: v })
            fetch({
                pageSize: state.page_size,
                pageNumber: state.page_number,
                courseId: state.course_id,
                studentId: state.student_id,
                teacherId: v
            })
        },
        [state.course_id, state.page_size, state.page_number, state.student_id]
    )

    // const togglePDfModal = useCallback(
    //     (record) => {
    //         if (record) setState({ pdfContent: record })
    //         setState({ showPDFModal: !state.showPDFModal })
    //     },
    //     [state.showPDFModal]
    // )

    const toggleReportModal = useCallback(
        (record) => {
            if (record) setState({ reportContent: record })
            setState({ showReportModal: !state.showReportModal })
        },
        [state.showReportModal]
    )

    const columns: ColumnsType = [
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            width: '250',
            align: 'center',
            render: (text) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {text?.email}
                            <br />
                            <b>Phone:</b> {text?.phone_number}
                            <br />
                            <b>Skype:</b> {text?.skype_account}
                        </>
                    }
                >
                    <p className='mb-2'>
                        <b>Student</b>{' '}
                        <NameTeacherStudent
                            data={text}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                </Popover>
            )
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            render: (text) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {text?.email}
                            <br />
                            <b>Phone:</b> {text?.phone_number}
                            <br />
                            <b>Skype:</b> {text?.skype_account}
                        </>
                    }
                >
                    <p className='mb-2'>
                        <b>Teacher</b>{' '}
                        <NameTeacherStudent
                            data={text}
                            type='teacher'
                        ></NameTeacherStudent>
                    </p>
                </Popover>
            )
        },
        {
            title: 'Customer Support',
            dataIndex: 'customer_support',
            key: 'customer_support',
            align: 'center',
            render: (cs) => ''
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            render: (course) => course?.name
        },
        {
            title: 'Attendance',
            dataIndex: 'id',
            key: 'id',
            render: (text, record: any) => record?.attendance?.point
        },
        {
            title: 'Attitude',
            dataIndex: 'id',
            key: 'id',
            render: (text, record: any) => record?.attitude?.point
        },
        {
            title: 'Homework',
            dataIndex: 'id',
            key: 'id',
            render: (text, record: any) => record?.homework?.point
        },
        {
            title: 'Exam',
            dataIndex: 'id',
            key: 'id',
            render: (text, record: any) => record?.exam_result
        },
        {
            title: 'Score',
            dataIndex: 'memo',
            key: 'memo',
            render: (memo, record: any) => (
                <>
                    <b style={{ color: 'blueviolet' }}>Điểm trung bình:</b>
                    <span className='ml-1'>{record?.average}</span>
                    <br />
                    <b style={{ color: 'red' }}>Xếp loại:</b>
                    <span className='ml-1'>
                        {record?.average <= 3.5
                            ? 'Yếu'
                            : record?.average <= 5.5
                            ? 'Trung bình'
                            : record?.average <= 8
                            ? 'Khá'
                            : record?.average < 10
                            ? 'Giỏi'
                            : 'Xuất sắc'}
                    </span>
                </>
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            render: (text, record: any) => (
                <>
                    {/* <Button
                        type='primary'
                        onClick={() => togglePDfModal(record)}
                    >
                        View PDF
                    </Button> */}
                    <Button
                        type='primary'
                        onClick={() => toggleReportModal(record)}
                    >
                        View Full Report
                    </Button>
                </>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search by course',
            engine: (
                <DebounceSelect
                    placeholder='Search by course'
                    fetchOptions={fetchCourse}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(v) => handlerCourseFilter(v)}
                />
            )
        },
        {
            label: 'Search by student',
            engine: (
                <DebounceSelect
                    placeholder='Search by student'
                    fetchOptions={fetchStudent}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(v) => handlerStudentFilter(v)}
                />
            )
        },
        {
            label: 'Search by teacher',
            engine: (
                <DebounceSelect
                    placeholder='Search by teacher'
                    fetchOptions={fetchTeacher}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(v) => handlerTeacherFilter(v)}
                />
            )
        }
    ]

    return (
        <>
            <Card title='Report By Course'>
                <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

                <Table
                    columns={columns}
                    dataSource={state.memos.map((d, i) => ({ key: i, ...d }))}
                    bordered
                    pagination={{
                        defaultCurrent: state.page_number,
                        pageSize: state.page_size,
                        total: state.total,
                        onChange: handleChangePagination
                    }}
                />
            </Card>
            {/* <PDFModal
                visible={state.showPDFModal}
                title='PDF Modal'
                toggleModal={togglePDfModal}
                content={state.pdfContent}
            /> */}
            <ViewReport
                visible={state.showReportModal}
                toggleModal={toggleReportModal}
                type={2}
                data={state.reportContent}
            />
        </>
    )
}

export default StudentAnalytics
