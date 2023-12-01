/* eslint-disable jsx-a11y/control-has-associated-label */
import { useReducer, useEffect, useCallback } from 'react'
import { Statistic, Row, Col, Card, Table, notification, Progress } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import DashboardAPI from 'api/DashboardAPI'
import NotificationAPI from 'api/NotificationAPI'
import moment from 'moment'
import {
    UserOutlined,
    UserSwitchOutlined,
    ShoppingCartOutlined,
    DesktopOutlined
} from '@ant-design/icons'
import { sanitize } from 'utils'
import _ from 'lodash'
import { FULL_DATE_FORMAT } from 'const'
import RenewAndCommission from './RenewAndCommission'
import { sanitizeMessage } from 'utils/notification'

const Dashboard = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            notifications: [],
            teachers: {},
            students: {},
            booking: {}
        }
    )
    const columns: ColumnsType = [
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            render: (text: any, record: any) =>
                record.seen ? (
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeMessage(record)
                        }}
                    />
                ) : (
                    <b>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeMessage(record)
                            }}
                        />
                    </b>
                )
        },
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            render: (text) => text && moment(text).format('HH:mm:ss DD/MM/YYYY')
        }
    ]
    const getStatistics = useCallback(() => {
        DashboardAPI.getStatistics({})
            .then((data) => {
                setValues({
                    teachers: data.teachers,
                    students: data.students,
                    booking: data.booking
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }, [])
    const getNotifications = useCallback(({ page_size, page_number }) => {
        setValues({ isLoading: true })
        NotificationAPI.getNotifications({ page_size, page_number })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ notifications: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }, [])

    useEffect(() => {
        getStatistics()
        getNotifications({ ...values })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            getNotifications({
                ...values,
                page_number: pageNumber,
                page_size: pageSize
            })
        },
        [values]
    )

    return (
        <Card title='Dashboard'>
            <Row gutter={[8, 16]}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title='Active Teachers'
                            value={values.teachers.active}
                            valueStyle={{
                                color: '#47bac1',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            prefix={
                                <UserSwitchOutlined
                                    style={{ display: 'flex' }}
                                />
                            }
                        />
                        <Progress
                            percent={
                                (100 * values.teachers.active) /
                                values.teachers.count
                            }
                            showInfo={false}
                            strokeColor='#47bac1'
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title='Active Students'
                            value={values.students.active}
                            valueStyle={{
                                color: '#5b7dff',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            prefix={
                                <UserOutlined style={{ display: 'flex' }} />
                            }
                        />
                        {/* <UserOutlined style={{ color: '#5b7dff' }} /> */}
                        <Progress
                            percent={
                                (100 * values.students.active) /
                                values.students.count
                            }
                            showInfo={false}
                            strokeColor='#5b7dff'
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title='Total Booking'
                            value={values.booking.count}
                            valueStyle={{
                                color: '#fcc100',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            prefix={
                                <DesktopOutlined style={{ display: 'flex' }} />
                            }
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title='Upcoming Booking'
                            value={values.booking.upcoming}
                            valueStyle={{
                                color: '#3f8600',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            prefix={
                                <ShoppingCartOutlined
                                    style={{ display: 'flex' }}
                                />
                            }
                        />
                    </Card>
                </Col>
                <RenewAndCommission />
                <Card
                    title='Notifications'
                    style={{ width: '100%' }}
                    size='small'
                >
                    <Table
                        bordered
                        columns={columns}
                        dataSource={values.notifications}
                        loading={values.isLoading}
                        pagination={{
                            defaultCurrent: values.page_number,
                            pageSize: values.page_size,
                            total: values.total,
                            onChange: handleChangePagination
                        }}
                        rowKey='_id'
                    />
                </Card>
            </Row>
        </Card>
    )
}
export default Dashboard
