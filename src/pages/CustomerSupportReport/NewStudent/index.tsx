import React, { useCallback, useEffect, useState } from 'react'
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
    Select
} from 'antd'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import { ColumnsType } from 'antd/lib/table'
import StudentAPI from 'api/StudentAPI'
import moment from 'moment'
import { POINT_VND_RATE } from 'const'
import _ from 'lodash'

const { Search } = Input

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = React.useState(1)
    const [tableData, setTableData] = useState([])
    const [month, setMonth] = useState(moment().month() + 1)
    const [searchString, setSearchString] = useState('')

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            month: number
            search: string
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.getNewStudentReport(query)
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
            month,
            search: searchString
        })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                month,
                search: searchString
            })
        },
        [month, searchString]
    )

    const columns: ColumnsType = [
        {
            title: 'Mã HV',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Tên HV',
            dataIndex: 'full_name',
            key: 'full_name',
            align: 'left',
            width: '10%',
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {record?.email}
                            <br />
                            <b>Phone:</b> {record?.phone_number}
                            <br />
                            <b>Skype:</b> {record?.skype_account}
                        </>
                    }
                >
                    {text}
                </Popover>
            )
        },
        {
            title: 'Tuổi',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                text ? moment().diff(moment(text), 'years') : ''
        },
        {
            title: 'SĐT',
            dataIndex: 'phone_number',
            key: 'phone_number',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Skype',
            dataIndex: 'skype_account',
            key: 'skype_account',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Ngày đăng kí',
            dataIndex: 'orders',
            key: 'orders',
            align: 'center',
            width: '5%',
            render: (order, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Order ID:</b> {order?.id}
                            <br />
                            <b>Price:</b> {order?.price} đ
                            <br />
                        </>
                    }
                >
                    {record
                        ? moment(order?.updated_time).format('DD/MM/YYYY')
                        : ''}
                </Popover>
            )
        },
        {
            title: 'Ngày học bắt đầu',
            dataIndex: 'booking',
            key: 'booking',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                text
                    ? moment(text?.calendar?.start_time).format('DD/MM/YYYY')
                    : ''
        },
        {
            title: 'CS',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text?.staff?.fullname
        }
    ]

    const onSearchString = useCallback(
        (s) => {
            setSearchString(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: s,
                month
            })
        },
        [pageSize, pageNumber, month]
    )

    const onSearchMonth = useCallback(
        (_month) => {
            setMonth(_month)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                month: _month
            })
        },
        [pageSize, pageNumber, searchString]
    )

    return (
        <Card title='Báo cáo học viên mới'>
            <Row gutter={[24, 24]} justify='start' className='mb-4'>
                <Col span={4} style={{ paddingLeft: 10 }}>
                    <Select
                        placeholder='Tháng'
                        allowClear
                        style={{ width: '100%' }}
                        onChange={onSearchMonth}
                        value={month}
                    >
                        {Array.apply(1, Array(12)).map((d, i) => (
                            <Select.Option value={i + 1}>
                                Tháng {i + 1}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={8} style={{ paddingLeft: 0 }}>
                    <Search
                        placeholder='Enter text to search'
                        allowClear
                        enterButton='Search'
                        onSearch={_.debounce(onSearchString, 250)}
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
