import React, { useCallback, useEffect, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import {
    Card,
    Table,
    Row,
    Col,
    Input,
    notification,
    Popover,
    Select
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'

const { Search } = Input

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = React.useState(1)
    const [tableData, setTableData] = useState([])
    const [searchString, setSearchString] = useState('')
    const [day, setDay] = useState(null)
    const [month, setMonth] = useState(moment().month() + 1)

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search?: string
            day?: number
            month?: number
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.getBirthdayReport(query)
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
        fetchData({ page_size: pageSize, page_number: pageNumber, month })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                search: searchString,
                day,
                month
            })
        },
        [searchString, day, month]
    )

    const onSearchString = useCallback(
        (s) => {
            setSearchString(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: s,
                day,
                month
            })
        },
        [pageSize, pageNumber, day, month, status]
    )

    const onSearchMonth = useCallback(
        (_month) => {
            setMonth(_month)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                day,
                month: _month
            })
        },
        [pageSize, pageNumber, searchString, day, status]
    )

    const onSearchDay = useCallback(
        (_day) => {
            setDay(_day)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                day: _day,
                month
            })
        },
        [pageNumber, pageSize, searchString, month, status]
    )

    const columns: ColumnsType = [
        {
            title: 'Mã HV',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '5%',
            render: (text, record: any) => record.id
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
            title: 'Gói đang học',
            dataIndex: 'packages',
            key: 'packages',
            align: 'left',
            width: '10%',
            render: (text, record: any) => {
                const activePackages = record.packages.filter(
                    (p) => p.order.status === 1
                )
                if (activePackages.length < 3) {
                    return (
                        <p>
                            {activePackages.map((a) => a.package_name).join()}
                        </p>
                    )
                }
                return (
                    <Popover
                        content={() => (
                            <div>
                                {activePackages.map((a) => (
                                    <p>
                                        <b>Order: {a.order.id}</b>&nbsp;
                                        {a.package_name}
                                    </p>
                                ))}
                            </div>
                        )}
                    >
                        <p>{activePackages.length} Packages</p>
                    </Popover>
                )
            }
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            align: 'left',
            width: '5%',
            render: (text, record: any) =>
                moment(text).utc().format('DD/MM/YYYY')
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
            title: 'Ngày sinh nhật',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <b>{moment(text).utc().format('DD-MM')}</b>
            )
        }
    ]

    return (
        <Card title='Báo cáo sinh nhật hàng tháng của học viên'>
            <Row gutter={[24, 24]} justify='end' className='mb-4'>
                <Col span={4} style={{ paddingLeft: 0 }}>
                    <Select
                        placeholder='Ngày sinh nhật'
                        allowClear
                        style={{ width: '100%' }}
                        onChange={onSearchDay}
                    >
                        {Array.apply(1, Array(31)).map((d, i) => (
                            <Select.Option value={i + 1}>
                                Ngày {i + 1}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={4} style={{ paddingLeft: 0 }}>
                    <Select
                        placeholder='Tháng sinh nhật'
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
