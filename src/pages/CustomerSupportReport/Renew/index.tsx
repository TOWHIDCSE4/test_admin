import React, { useCallback, useEffect, useReducer, useState } from 'react'
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
    DatePicker,
    Spin
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'
import NameTeacherStudent from 'components/name-teacher-student'
import { EyeOutlined } from '@ant-design/icons'
import DetailRenew from './ModalDetail'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { Search } = Input
const { RangePicker } = DatePicker

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [time, setTime] = useState(moment().startOf('month').valueOf())

    const [visibleModal, setVisibleModal] = useState(false)
    const [loadingBtn, setLoadingBtn] = useState(false)
    const [selectedData, setSelectedData] = useState([])

    const [dashboard, setDashboard] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            totalExprire: 0,
            totalExtend: 0,
            totalRenew: 0,
            totalRevenue: 0,
            totalRevenueExtend: 0,
            totalRevenueRenew: 0
        }
    )
    const toggleModal = (val: boolean) => {
        setVisibleModal(val)
    }

    const fetchData = useCallback((query?: { time?: number }) => {
        setLoading(true)
        CustomerSupportReportAPI.getRenewReport(query)
            .then((data) => {
                setTableData(data?.data)
                let totalExprire = 0
                let totalExtend = 0
                let totalRenew = 0
                let totalRevenue = 0
                let totalRevenueExtend = 0
                let totalRevenueRenew = 0
                data?.data.forEach((element) => {
                    totalExprire += element.totalExprire
                    totalExtend += element.totalExtend
                    totalRenew += element.totalRenew
                    totalRevenue += element.totalRevenue
                    totalRevenueExtend += element.totalRevenueExtend
                    totalRevenueRenew += element.totalRevenueRenew
                })
                setDashboard({
                    totalExprire,
                    totalExtend,
                    totalRenew,
                    totalRevenue,
                    totalRevenueExtend,
                    totalRevenueRenew
                })
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
    }, [])

    useEffect(() => {
        fetchData({
            time: time.valueOf()
        })
    }, [])

    const handleRangePicker = useCallback((value) => {
        if (value) {
            setTime(value.clone().startOf('month'))
            fetchData({
                time: value.clone().startOf('month').valueOf()
            })
        }
    }, [])

    const viewDetail = (record: any) => {
        const data = { ...record }
        data.students_exprire = record.child[0].students_exprire
        data.students_extend = []
        data.students_renew = []
        record.child.forEach((element) => {
            data.students_extend = data.students_extend.concat(
                element.students_extend
            )
        })
        record.child.forEach((element) => {
            data.students_renew = data.students_renew.concat(
                element.students_renew
            )
        })

        setSelectedData(data)
        console.log(data)

        toggleModal(true)
    }
    const columns: ColumnsType = [
        {
            title: 'CS',
            dataIndex: 'staff_name',
            key: 'staff_name',
            render: (text) => text
        },
        {
            title: 'Tái ký',
            dataIndex: 'totalRenew',
            key: 'totalRenew',
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Gia hạn',
            dataIndex: 'totalExtend',
            key: 'totalExtend',
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Hết hạn',
            dataIndex: 'totalExprire',
            key: 'totalExprire',
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Tái ký/Hết hạn',
            dataIndex: 'totalRenew',
            key: 'totalRenew',
            align: 'center',
            render: (text, record: any) => {
                if (record.totalExprire === 0) {
                    return '0%'
                }
                return `${(
                    (record.totalRenew / record.totalExprire) *
                    100
                ).toLocaleString('en-US', {
                    minimumIntegerDigits: 1,
                    useGrouping: false
                })}%`
            }
        },
        {
            title: 'Doanh số tái ký',
            dataIndex: 'totalRevenueRenew',
            key: 'totalRevenueRenew',
            align: 'right',
            render: (text) => Intl.NumberFormat('en-US').format(text)
        },
        {
            title: 'Doanh số gia hạn',
            dataIndex: 'totalRevenueExtend',
            key: 'totalRevenueExtend',
            align: 'right',
            render: (text, record: any) =>
                Intl.NumberFormat('en-US').format(text)
        },
        {
            title: 'Tổng Doanh số',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            align: 'right',
            render: (text) => Intl.NumberFormat('en-US').format(text)
        },
        {
            title: 'Action',
            dataIndex: 'total_revenue_extend',
            key: 'total_revenue_extend',
            align: 'right',
            render: (text, record: any) => {
                return (
                    <EyeOutlined
                        type='button'
                        title='View Detail'
                        onClick={() => {
                            viewDetail(record)
                        }}
                    />
                )
            }
        }
    ]

    const renderTable = () => {
        const arr = []
        const grouped = _.groupBy(tableData, 'team')
        for (const key in grouped) {
            if (Object.prototype.hasOwnProperty.call(grouped, key)) {
                const element = grouped[key]
                arr.push(
                    <>
                        <h4 className='mt-2'>{key || 'Chưa phân nhóm'}</h4>
                        <Table
                            pagination={false}
                            loading={isLoading}
                            bordered
                            columns={columns}
                            dataSource={element.map((d, i) => ({
                                key: i,
                                ...d
                            }))}
                            summary={(pageData) => {
                                const totalRenew = pageData.reduce(
                                    (total, e: any) => total + e.totalRenew,
                                    0
                                )
                                const totalExtend = pageData.reduce(
                                    (total, e: any) => total + e.totalExtend,
                                    0
                                )
                                const totalExprire = pageData.reduce(
                                    (total, e: any) => total + e.totalExprire,
                                    0
                                )
                                const totalRevenueRenew = pageData.reduce(
                                    (total, e: any) =>
                                        total + e.totalRevenueRenew,
                                    0
                                )
                                const totalRevenueExtend = pageData.reduce(
                                    (total, e: any) =>
                                        total + e.totalRevenueExtend,
                                    0
                                )
                                const totalRevenue = pageData.reduce(
                                    (total, e: any) => total + e.totalRevenue,
                                    0
                                )
                                const avgPercent =
                                    totalExprire === 0
                                        ? 0
                                        : (totalRenew / totalExprire) * 100
                                return (
                                    <>
                                        <Table.Summary.Row
                                            className='font-weight-bold'
                                            style={{ background: '#fafafa' }}
                                        >
                                            <Table.Summary.Cell index={0}>
                                                Total
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='center'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalRenew)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='center'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalExtend)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='center'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalExprire)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='center'
                                            >
                                                {avgPercent.toLocaleString(
                                                    'en-US',
                                                    {
                                                        minimumIntegerDigits: 1,
                                                        useGrouping: false
                                                    }
                                                )}
                                                %
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='right'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalRevenueRenew)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='right'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalRevenueExtend)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='right'
                                            >
                                                {Intl.NumberFormat(
                                                    'en-US'
                                                ).format(totalRevenue)}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell
                                                index={0}
                                                align='right'
                                            ></Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                )
                            }}
                        />
                    </>
                )
            }
        }

        return arr
    }

    const caculateRenew = async () => {
        setLoadingBtn(true)
        CustomerSupportReportAPI.caculateRenewReport({ time: time.valueOf() })
            .then((data) => {
                setLoading(false)
                fetchData({
                    time: time.valueOf()
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
                setLoading(false)
            })
            .finally(() => setLoadingBtn(false))
    }

    return (
        <Card title='Báo cáo tái ký'>
            <Row gutter={[24, 24]} justify='start' className='mb-4'>
                <Col
                    span={24}
                    className='d-flex align-items-center'
                    style={{ paddingLeft: 10 }}
                >
                    <DatePicker
                        allowClear={false}
                        picker='month'
                        disabledDate={(current) => current >= moment()}
                        onChange={handleRangePicker}
                        defaultValue={moment()}
                    />
                    {checkPermission(PERMISSIONS.csrrn_caculate) && (
                        <Button
                            disabled={loadingBtn}
                            className='my-3 ml-auto'
                            type='primary'
                            onClick={() => caculateRenew()}
                        >
                            <Spin
                                size='small'
                                className='mr-2'
                                spinning={loadingBtn}
                            />
                            Caculate
                        </Button>
                    )}
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={4}>
                    <Card
                        title='Tái ký'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalRenew
                            )}
                        </p>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card
                        title='Gia hạn'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalExtend
                            )}
                        </p>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card
                        title='Hết hạn'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalExprire
                            )}
                        </p>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card
                        title='Doanh số tái ký'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalRevenueRenew
                            )}
                        </p>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card
                        title='Doanh số gia hạn'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalRevenueExtend
                            )}
                        </p>
                    </Card>
                </Col>
                <Col span={4}>
                    <Card
                        title='Tổng Doanh số'
                        bordered={false}
                        headStyle={{ background: '#8bc34a' }}
                    >
                        <p
                            className='text-right font-weight-bold text-success'
                            style={{ fontSize: '1.6rem' }}
                        >
                            {Intl.NumberFormat('en-US').format(
                                dashboard.totalRevenue
                            )}
                        </p>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[24, 24]}>
                <Col span={24}>{renderTable()}</Col>
            </Row>
            <DetailRenew
                toggleModal={toggleModal}
                visible={visibleModal}
                data={selectedData}
            ></DetailRenew>
        </Card>
    )
}

export default Report
