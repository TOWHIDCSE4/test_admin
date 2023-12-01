import React, { useCallback, useEffect, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import { Card, Table, Row, Col, notification, DatePicker } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment, { Moment } from 'moment'
import _ from 'lodash'

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
            CustomerSupportReportAPI.getBookingReport(query)
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
            min_start_time: minStartTime,
            max_end_time: maxEndTime
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
        [minStartTime, minStartTime]
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
            title: 'Ngày',
            dataIndex: 'day_of_booking',
            key: 'day_of_booking',
            align: 'center',
            width: '2%',
            render: (text) => text
        },
        {
            title: 'Tổng số buổi học trong',
            dataIndex: 'bookings',
            key: 'bookings',
            align: 'center',
            width: '2%',
            render: (text) => text?.length
        },
        {
            title: 'Buổi học đã hoàn thành',
            dataIndex: 'booking_completed',
            key: 'booking_completed',
            align: 'center',
            width: '2%',
            render: (text) => text
        },
        {
            title: 'Buổi học đã huỷ',
            dataIndex: 'booking_completed',
            key: 'booking_completed',
            align: 'center',
            width: '2%',
            render: (text) => text
        },
        {
            title: 'Học viên vắng',
            dataIndex: 'booking_absent_by_student',
            key: 'booking_absent_by_student',
            align: 'center',
            width: '2%',
            render: (text) => text
        },
        {
            title: 'Giáo viên vắng',
            dataIndex: 'booking_absent_by_teacher',
            key: 'booking_absent_by_teacher',
            align: 'center',
            width: '2%',
            render: (text) => text
        },
        {
            title: 'Vào muộn',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '2%',
            render: (text) => ''
        },
        {
            title: 'Thay đổi giảng viên',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '2%',
            render: (text) => ''
        }
    ]

    return (
        <Card title='Báo cáo tổng hợp trạng thái lớp học'>
            <Row gutter={[24, 24]} justify='start' className='mb-4'>
                <Col span={8} style={{ paddingLeft: 0 }}>
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
