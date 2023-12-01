import React, { useCallback, useEffect, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import {
    Card,
    Table,
    Row,
    Col,
    Tag,
    Button,
    Input,
    notification,
    Popover,
    Select,
    DatePicker
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search } = Input
const { RangePicker } = DatePicker

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = React.useState(1)
    const [tableData, setTableData] = useState([])
    const [minStartTime, setMinStartTime] = useState(
        moment().startOf('month').valueOf()
    )
    const [maxEndTime, setMaxEndTime] = useState(
        moment().endOf('month').valueOf()
    )

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            min_start_time?: number
            max_end_time?: number
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.getExamReport(query)
                .then((data) => {
                    setTableData(data?.data)
                    setTotal(data?.pagination?.total)
                    setLoading(false)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                    setLoading(false)
                })
                .finally(() => setLoading(false))
        },
        []
    )

    useEffect(() => {
        fetchData({
            page_size: pageSize,
            page_number: pageNumber,
            max_end_time: maxEndTime,
            min_start_time: minStartTime
        })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                min_start_time: minStartTime.valueOf(),
                max_end_time: maxEndTime.valueOf()
            })
        },
        [minStartTime, maxEndTime]
    )

    const handleRangePicker = useCallback(
        (value) => {
            if (value[0] && value[1] && value[0] < value[1]) {
                setMinStartTime(value[0])
                setMaxEndTime(value[1])
                fetchData({
                    page_size: pageSize,
                    page_number: pageNumber,
                    min_start_time: value[0].valueOf(),
                    max_end_time: value[1].valueOf()
                })
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Invalid date range'
                })
            }
        },
        [pageNumber, pageSize]
    )

    const columns: ColumnsType = [
        {
            title: 'Mã HV',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: '2%',
            render: (text) => text?.id
        },
        {
            title: 'Tên HV',
            dataIndex: 'student',
            key: 'student',
            align: 'left',
            width: '2%',
            render: (text) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Giáo trình',
            dataIndex: 'course',
            key: 'course',
            align: 'left',
            width: '2%',
            render: (text) => text?.name
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: '2%',
            render: (text) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'CS',
            dataIndex: 'student_staff',
            key: 'student_staff',
            align: 'left',
            width: '2%',
            render: (text) => text?.staff?.fullname
        },
        {
            title: 'Midterm Test',
            dataIndex: 'midTermExam',
            key: 'midTermExam',
            align: 'left',
            width: '2%',
            children: [
                {
                    title: 'Lesson',
                    dataIndex: 'midTermExam',
                    key: 'midTermExam',
                    align: 'left',
                    width: '2%',
                    render: (text) => text?.exam?.name
                },
                {
                    title: 'Ngày Test',
                    dataIndex: 'midTermExam',
                    key: 'midTermExam',
                    align: 'left',
                    width: '2%',
                    render: (text) =>
                        text?.booking?.calendar?.start_time
                            ? moment(
                                  text?.booking?.calendar?.start_time
                              ).format('DD/MM/YYYY HH:mm')
                            : ''
                },
                {
                    title: 'Trạng thái',
                    dataIndex: 'midTermExam',
                    key: 'midTermExam',
                    align: 'left',
                    width: '2%',
                    render: (text) => {
                        if (!text?.booking) return 'Chưa có lịch đặt'
                        if (text?.quizSession) return 'Đã hoàn thành'
                        return 'Chưa hoàn thành'
                    }
                }
            ]
        },
        {
            title: 'Final Test',
            dataIndex: 'finalExam',
            key: 'finalExam',
            align: 'left',
            width: '2%',
            children: [
                {
                    title: 'Lesson',
                    dataIndex: 'finalExam',
                    key: 'finalExam',
                    align: 'left',
                    width: '2%',
                    render: (text) => text?.exam?.name
                },
                {
                    title: 'Ngày Test',
                    dataIndex: 'finalExam',
                    key: 'finalExam',
                    align: 'left',
                    width: '2%',
                    render: (text) =>
                        text?.booking?.calendar?.start_time
                            ? moment(
                                  text?.booking?.calendar?.start_time
                              ).format('DD/MM/YYYY HH:mm')
                            : ''
                },
                {
                    title: 'Trạng thái',
                    dataIndex: 'finalExam',
                    key: 'finalExam',
                    align: 'left',
                    width: '2%',
                    render: (text) => {
                        if (!text?.booking) return 'Chưa có lịch đặt'
                        if (text?.quizSession) return 'Đã hoàn thành'
                        return 'Chưa hoàn thành'
                    }
                }
            ]
        }
    ]

    return (
        <Card title='Báo cáo hạn bài kiểm tra'>
            <Row gutter={[24, 24]} justify='start' className='mb-4'>
                <Col span={8} style={{ paddingLeft: 10 }}>
                    <RangePicker
                        allowClear={false}
                        onChange={handleRangePicker}
                        value={[moment(minStartTime), moment(maxEndTime)]}
                    />
                </Col>
            </Row>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Table
                        loading={isLoading}
                        bordered
                        columns={columns}
                        dataSource={tableData.map((d, i) => ({ key: i, ...d }))}
                        pagination={{
                            defaultCurrent: pageNumber,
                            pageSize,
                            total,
                            onChange: handleChangePagination
                        }}
                    />
                </Col>
            </Row>
        </Card>
    )
}

export default Report
