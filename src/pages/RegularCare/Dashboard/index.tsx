/* eslint-disable jsx-a11y/control-has-associated-label */
import { useReducer, useEffect, useCallback } from 'react'
import { Row, Col, Card, Table, notification, Popover } from 'antd'
import CustomerSupportManagementAPI from 'api/CustomerSupportManagementAPI'
import './index.scss'
import _ from 'lodash'
import moment from 'moment'
import RegularCareAPI from 'api/RegularCareAPI'
import { EnumRegularCalendarStatus } from 'types'
import { CallTypeRegularCare, EnumRegularCare } from 'const/status'

const { Column, ColumnGroup } = Table

const Dashboard = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            dashboardForm: [],
            isLoading1: false
        }
    )

    const getDashboardForm = () => {
        setValues({ isLoading1: true })
        RegularCareAPI.getDataDashboardActiveForm(null)
            .then((res) => {
                setValues({ dashboardForm: res.data })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading1: false }))
    }

    useEffect(() => {
        getDashboardForm()
    }, [])

    return (
        <Card title='Dashboard'>
            <Row className='mb-5'>
                <Col span={24}>
                    <h4>Regular Care</h4>
                    <Table
                        className='student-management-table'
                        size='small'
                        dataSource={values.dashboardForm}
                        rowKey={(record: any) => record._id.username}
                        scroll={{
                            x: 500,
                            y: 768
                        }}
                        loading={values.isLoading1}
                        sticky
                        pagination={false}
                        bordered
                        summary={(pageData) => {
                            const total = pageData.reduce((pre, curv) => {
                                const arrIdStudentMain = []
                                const add = curv.student.reduce((prev, cur) => {
                                    let addv = 0
                                    if (
                                        !arrIdStudentMain.includes(cur.user_id)
                                    ) {
                                        arrIdStudentMain.push(cur.user_id)
                                        addv = 1
                                    }
                                    return prev + addv
                                }, 0)
                                return pre + add
                            }, 0)
                            const totalGreetingCallDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.GREETING &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalGreetingCallNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.GREETING &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalCheckingCallDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.CHECKING &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalCheckingCallNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.CHECKING &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalUpcomingTestDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.UPCOMING_TEST &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalUpcomingTestNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.UPCOMING_TEST &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalTestReportDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.TEST_REPORTS &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalTestReportNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.student.reduce(
                                        (prev, curv) => {
                                            const addv =
                                                curv.cs_list_info.call_type ===
                                                    CallTypeRegularCare.TEST_REPORTS &&
                                                curv.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            return (
                                <Table.Summary fixed='top'>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            key='cell-csm-student-0'
                                            index={0}
                                        >
                                            <p className='text-center '>Tổng</p>
                                        </Table.Summary.Cell>
                                        {(() => {
                                            const arr = []
                                            for (
                                                let index = 1;
                                                index <= 9;
                                                index++
                                            ) {
                                                arr.push(
                                                    <Table.Summary.Cell
                                                        key={`cell-csm-student-${index}`}
                                                        index={index}
                                                    >
                                                        <p className='text-center'>
                                                            {index === 1
                                                                ? total
                                                                : ''}
                                                            {index === 2
                                                                ? totalGreetingCallDone
                                                                : ''}
                                                            {index === 3
                                                                ? totalGreetingCallNotDone
                                                                : ''}
                                                            {index === 4
                                                                ? totalCheckingCallDone
                                                                : ''}
                                                            {index === 5
                                                                ? totalCheckingCallNotDone
                                                                : ''}
                                                            {index === 6
                                                                ? totalUpcomingTestDone
                                                                : ''}
                                                            {index === 7
                                                                ? totalUpcomingTestNotDone
                                                                : ''}
                                                            {index === 8
                                                                ? totalTestReportDone
                                                                : ''}
                                                            {index === 9
                                                                ? totalTestReportNotDone
                                                                : ''}
                                                        </p>
                                                    </Table.Summary.Cell>
                                                )
                                            }
                                            return arr
                                        })()}
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )
                        }}
                    >
                        <Column
                            width={200}
                            fixed
                            title='Tên CS'
                            dataIndex='_id'
                            key='_id'
                            render={(_id: any, record: any) => {
                                return (
                                    <div className='max-height text-center'>
                                        {record.fullname !== 'no_one' ? (
                                            <Popover
                                                content={
                                                    <>
                                                        <div className='popuplevel'>
                                                            <p>
                                                                <b>
                                                                    Fullname :{' '}
                                                                </b>
                                                                {`${record.fullname}`}
                                                            </p>
                                                            <p>
                                                                <b>
                                                                    Username :{' '}
                                                                </b>
                                                                {`${record.username}`}
                                                            </p>
                                                            <p>
                                                                <b>Email : </b>
                                                                <a
                                                                    href={`mailto:${record.email}`}
                                                                >{`${record.email}`}</a>
                                                            </p>
                                                            <p>
                                                                <b>
                                                                    Phone number
                                                                    :{' '}
                                                                </b>
                                                                <a
                                                                    href={`tel:${record.phoneNumber}`}
                                                                >{`${record.phoneNumber}`}</a>
                                                            </p>
                                                            <p>
                                                                <b>Active : </b>
                                                                {`${record.is_active}`}
                                                            </p>
                                                        </div>
                                                    </>
                                                }
                                            >
                                                <a className='text-primary'>
                                                    {`${record.fullname}`}
                                                </a>
                                            </Popover>
                                        ) : (
                                            <a className='text-primary'>
                                                {`${record.fullname}`}
                                            </a>
                                        )}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='Số học viên quản lý'
                            dataIndex='cs_list_info'
                            key='cs_list_info'
                            render={(total: any, record: any) => {
                                const arrIdStudent = []
                                const totalStudent = record.student.reduce(
                                    (pre, cur) => {
                                        let add = 0
                                        if (
                                            !arrIdStudent.includes(cur.user_id)
                                        ) {
                                            arrIdStudent.push(cur.user_id)
                                            add = 1
                                        }
                                        return pre + add
                                    },
                                    0
                                )

                                return (
                                    <div className='max-height text-center'>
                                        {record.student ? totalStudent : 0}
                                    </div>
                                )
                            }}
                        />
                        <ColumnGroup title='Greeting call'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='greeting_call_done'
                                key='greeting_call_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.GREETING &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='greeting_call_not_done'
                                key='greeting_call_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.GREETING &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>

                        <ColumnGroup title='Checking Call'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='checking_call_done'
                                key='checking_call_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.CHECKING &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='checking_call_not_done'
                                key='checking_call_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.CHECKING &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>

                        <ColumnGroup title='Upcoming Test'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='upcoming_test_done'
                                key='upcoming_test_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.UPCOMING_TEST &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='upcoming_test_not_done'
                                key='upcoming_test_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.UPCOMING_TEST &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>

                        <ColumnGroup title='Test Report'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='test_report_done'
                                key='test_report_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.TEST_REPORTS &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )

                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='test_report_not_done'
                                key='test_report_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.student.reduce(
                                        (pre, cur) => {
                                            const add =
                                                cur.cs_list_info.call_type ===
                                                    CallTypeRegularCare.TEST_REPORTS &&
                                                cur.cs_list_info.status ===
                                                    EnumRegularCare.NOT_DONE
                                                    ? 1
                                                    : 0
                                            return pre + add
                                        },
                                        0
                                    )
                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                    </Table>
                </Col>
            </Row>
        </Card>
    )
}
export default Dashboard
