import React, { useCallback, useEffect, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import {
    Card,
    Table,
    Row,
    Col,
    Input,
    notification,
    Select,
    Tooltip
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = React.useState(1)
    const [tableData, setTableData] = useState([])
    const [searchUser, setSearchUser] = useState(null)
    const [searchPackage, setSearchPackage] = useState(null)
    const [searchCourse, setSearchCourse] = useState(null)
    const [usersFilter, setUserFilter] = useState([])
    const [packageFilter, setPackageFilter] = useState([])
    const [courseFilter, setCourseFilter] = useState([])

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            user_id?: number
            package_id?: number
            course_id?: number
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.attendanceReport(query)
                .then((data) => {
                    setTableData(data?.data)
                    setTotal(data?.pagination?.total)
                    setUserFilter(data?.filter?.users)
                    setPackageFilter(data?.filter?.packages)
                    setCourseFilter(data?.filter?.courses)
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
        fetchData({ page_size: pageSize, page_number: pageNumber })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                user_id: searchUser,
                package_id: searchPackage,
                course_id: searchCourse
            })
        },
        [searchUser, searchPackage, searchCourse]
    )

    const onSearchUser = useCallback(
        (s) => {
            setSearchUser(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                user_id: s,
                package_id: searchPackage,
                course_id: searchCourse
            })
        },
        [pageSize, pageNumber, searchCourse, searchPackage]
    )

    const onSearchPackage = useCallback(
        (s) => {
            setSearchPackage(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                user_id: searchUser,
                package_id: s,
                course_id: searchCourse
            })
        },
        [pageSize, pageNumber, searchCourse, searchUser]
    )

    const onSearchCourse = useCallback(
        (s) => {
            setSearchCourse(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                user_id: searchUser,
                package_id: searchPackage,
                course_id: s
            })
        },
        [pageSize, pageNumber, searchPackage, searchUser]
    )

    const columns: ColumnsType = [
        {
            title: 'Mã HV',
            dataIndex: 'user',
            key: 'user',
            align: 'center',
            width: '2%',
            render: (text) => text?.id
        },
        {
            title: 'Tên HV',
            dataIndex: 'user',
            key: 'user',
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
            title: 'Gói học',
            dataIndex: 'package_name',
            key: 'package_name',
            align: 'left',
            width: '2%',
            render: (text) => text
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
            title: 'Ngày bắt đầu',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '2%',
            render: (text) =>
                moment(text?.firstBooking?.calendar?.start_time).format(
                    'DD/MM/YYYY HH:mm'
                )
        },
        {
            title: 'Ngày hoàn thành',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '2%',
            render: (text) => ''
            // moment(text?.firstBooking?.calendar?.start_time).format(
            //     'DD/MM/YYYY HH:mm'
            // )
        },
        {
            title: 'Số buổi của giáo trình',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '2%',
            render: (text) => text?.total_lesson
        },
        {
            title: () => (
                <Tooltip title='Hoàn thành”/Số buổi trạng thái (Hoàn thành + Student Absent)'>
                    Số buổi đã học
                </Tooltip>
            ),
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '2%',
            render: (text) => (
                <p title='Số buổi đã học / Số buổi đã được lên lịch'>
                    {text?.total_booking_completed} /{' '}
                    {text?.total_booking_created}
                </p>
            )
        },
        {
            title: 'Điểm chuyên cần',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '2%',
            render: (text) => (
                <p title='Số buổi đã học / Số buổi đã được lên lịch'>
                    {text?.total_booking_completed !== 0 &&
                    text?.total_booking_created !== 0
                        ? (
                              (text?.total_booking_completed /
                                  text?.total_booking_created) *
                              10
                          )
                              .toFixed(2)
                              .replace(/\.00$/, '')
                        : ''}
                </p>
            )
        }
    ]

    return (
        <Card title='Báo cáo tổng hợp điểm chuyên cần'>
            <Row gutter={[24, 24]} justify='start' className='mb-4'>
                <Col span={8} style={{ paddingLeft: 0 }}>
                    <Select<
                        string | number,
                        { value: string; children: string }
                    >
                        showSearch
                        allowClear
                        style={{ width: 250, paddingLeft: 10 }}
                        placeholder='Học viên'
                        filterOption={(input, option) =>
                            option!.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={onSearchUser}
                        filterSort={(optionA, optionB) =>
                            optionA.children
                                .toLowerCase()
                                .localeCompare(optionB.children.toLowerCase())
                        }
                    >
                        {usersFilter?.map((item) => (
                            <Option value={item.id} key={item.id}>
                                {`${item.full_name} - ${item.username}`}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col span={8} style={{ paddingLeft: 0 }}>
                    <Select<
                        string | number,
                        { value: string; children: string }
                    >
                        showSearch
                        allowClear
                        style={{ width: 250 }}
                        placeholder='Gói học'
                        onChange={onSearchPackage}
                        filterOption={(input, option) =>
                            option!.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                            optionA.children
                                .toLowerCase()
                                .localeCompare(optionB.children.toLowerCase())
                        }
                    >
                        {packageFilter?.map((item) => (
                            <Option key={item.id} value={item.id}>
                                {item.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col span={8} style={{ paddingLeft: 0 }}>
                    <Select<
                        string | number,
                        { value: string; children: string }
                    >
                        showSearch
                        allowClear
                        style={{ width: 250 }}
                        placeholder='Giáo trình'
                        onChange={onSearchCourse}
                        filterOption={(input, option) =>
                            option!.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                            optionA.children
                                .toLowerCase()
                                .localeCompare(optionB.children.toLowerCase())
                        }
                    >
                        {courseFilter?.map((item) => (
                            <Option key={item.id} value={item.id}>
                                {item.name}
                            </Option>
                        ))}
                    </Select>
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
