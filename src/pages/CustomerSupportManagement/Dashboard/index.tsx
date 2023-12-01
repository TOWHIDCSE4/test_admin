/* eslint-disable jsx-a11y/control-has-associated-label */
import { useReducer, useEffect, useCallback } from 'react'
import { Row, Col, Card, Table, notification, Popover } from 'antd'
import CustomerSupportManagementAPI from 'api/CustomerSupportManagementAPI'
import './index.scss'
import _ from 'lodash'
import moment from 'moment'

const { Column, ColumnGroup } = Table

const Dashboard = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            dashboardForm: [],
            dashboardCS: [],
            dashboardCS2: [],
            isLoading1: false,
            isLoading2: false,
            isLoading3: false
        }
    )

    const getDashboardForm = () => {
        setValues({ isLoading1: true })
        CustomerSupportManagementAPI.getDataDashboardActiveForm(null)
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

    const getDashboardCS = () => {
        setValues({ isLoading2: true })
        CustomerSupportManagementAPI.getDataDashboardCS(null)
            .then(async (res) => {
                const dataRes = res.data
                // sửa data của các cs nếu có thông tin chăm sóc học viên
                for (const iterator of dataRes) {
                    if (iterator.cs_list_info.length > 0) {
                        // sort theo ngày được phân user đầu tiên
                        iterator.cs_list_info.sort(function (a, b) {
                            const timeA = new Date(a.created_time).getTime()
                            const timeB = new Date(b.created_time).getTime()
                            return timeA - timeB
                        })
                        // tạo thêm trường date mới dạng MM/YYYY
                        for (const iterator2 of iterator.cs_list_info) {
                            iterator2.createAt = moment(
                                iterator2.created_time
                            ).format('MM/YYYY')
                        }
                        // gom nhóm các học sinh lại theo tháng-năm mà cs được nhận quản lý
                        const grouped = _.mapValues(
                            _.groupBy(iterator.cs_list_info, 'createAt'),
                            (clist) => ({
                                listUser: JSON.parse(JSON.stringify(clist)),
                                total: clist.length
                            })
                        )
                        // tạo 1 mảng mới từ object đã nhóm với key cs_list_time
                        const cs_list_time = Object.keys(grouped).map((key) => {
                            return {
                                time: key,
                                old: 0,
                                new: grouped[key].total,
                                listUser: grouped[key].listUser,
                                total: 0
                            }
                        }) as any
                        // lấy start date là ngày đầu tiên cs đưuọc nhận chăm sóc học viên
                        const startDate = new Date(
                            iterator.cs_list_info[0].created_time
                        )
                        const endDate = new Date(Date.now())
                        const monthDiff = (d1, d2) => {
                            let months
                            months = (d2.getFullYear() - d1.getFullYear()) * 12
                            months -= d1.getMonth()
                            months += d2.getMonth()
                            return months <= 0 ? 0 : months
                        }
                        const diff = monthDiff(startDate, endDate) + 1
                        // tạo ra các tháng không có dữ liệu khi group
                        let tempList = []
                        for (let index = 0; index < diff; index++) {
                            const stringDate =
                                moment(startDate).format('MM/YYYY')
                            const item = cs_list_time.find(
                                (e) => e.time === stringDate
                            )
                            if (item) {
                                item.date = startDate.getTime()
                                tempList = item.listUser
                            } else {
                                cs_list_time.push({
                                    date: startDate.getTime(),
                                    time: stringDate,
                                    listUser: JSON.parse(
                                        JSON.stringify(tempList)
                                    ),
                                    old: 0,
                                    new: 0,
                                    total: 0
                                })
                            }
                            startDate.setMonth(startDate.getMonth() + 1)
                        }
                        // sort lại data
                        cs_list_time.sort(function (a, b) {
                            const timeA = new Date(a.date).getTime()
                            const timeB = new Date(b.date).getTime()
                            return timeA - timeB
                        })

                        // tính toán lại tổng số học sinh chăm sóc hàng thàng, học sinh cũ, học sinh mới,
                        // thông tin chăm sóc, báo cáo cuối khóa của từng CS
                        for (const [
                            index,
                            iterator2
                        ] of cs_list_time.entries()) {
                            if (index === 0) {
                                iterator2.total = iterator2.old + iterator2.new
                            } else {
                                iterator2.old = cs_list_time[index - 1].total
                                iterator2.total = iterator2.old + iterator2.new
                            }

                            const listUser = JSON.parse(
                                JSON.stringify(iterator2.listUser)
                            )
                            // filter thông tin chăm sóc theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.customer_care =
                                    iterator3.customer_care
                                        ? iterator3.customer_care.filter(
                                              (e) => {
                                                  e.date2 = moment(
                                                      e.date
                                                  ).format('MM/YYYY')
                                                  return (
                                                      e.date2 === iterator2.time
                                                  )
                                              }
                                          )
                                        : []
                            }
                            // filter thông tin báo cáo cuối khóa theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.scheduled_memos =
                                    iterator3.scheduled_memos
                                        ? iterator3.scheduled_memos.filter(
                                              (e) => {
                                                  e.date2 = moment(
                                                      e.created_time
                                                  ).format('MM/YYYY')
                                                  return (
                                                      e.date2 === iterator2.time
                                                  )
                                              }
                                          )
                                        : []
                            }
                            // filter thông tin feedback theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.reports = iterator3.reports
                                    ? iterator3.reports.filter((e) => {
                                          e.date2 = moment(
                                              e.created_time
                                          ).format('MM/YYYY')
                                          return e.date2 === iterator2.time
                                      })
                                    : []
                            }
                            iterator2.listUser = listUser
                        }
                        iterator.cs_list_time = JSON.parse(
                            JSON.stringify(cs_list_time)
                        )
                    } else {
                        iterator.cs_list_time = []
                    }
                }
                setValues({ dashboardCS: dataRes })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading2: false }))
    }

    const getDashboardCS2 = () => {
        setValues({ isLoading3: true })
        CustomerSupportManagementAPI.getDataDashboardCS2(null)
            .then(async (res) => {
                const dataRes = res.data
                // sửa data của các cs nếu có thông tin chăm sóc học viên
                for (const iterator of dataRes) {
                    if (iterator.cs_list_info.length > 0) {
                        // sort theo ngày được phân user đầu tiên
                        iterator.cs_list_info.sort(function (a, b) {
                            const timeA = new Date(a.created_time).getTime()
                            const timeB = new Date(b.created_time).getTime()
                            return timeA - timeB
                        })
                        // tạo thêm trường date mới dạng MM/YYYY
                        for (const iterator2 of iterator.cs_list_info) {
                            iterator2.createAt = moment(
                                iterator2.created_time
                            ).format('MM/YYYY')
                        }
                        // gom nhóm các học sinh lại theo tháng-năm mà cs được nhận quản lý
                        const grouped = _.mapValues(
                            _.groupBy(iterator.cs_list_info, 'createAt'),
                            (clist) => ({
                                listUser: JSON.parse(JSON.stringify(clist)),
                                total: clist.length
                            })
                        )
                        // tạo 1 mảng mới từ object đã nhóm với key cs_list_time
                        const cs_list_time = Object.keys(grouped).map((key) => {
                            return {
                                time: key,
                                old: 0,
                                new: grouped[key].total,
                                listUser: grouped[key].listUser,
                                total: 0
                            }
                        }) as any
                        // lấy start date là ngày đầu tiên cs đưuọc nhận chăm sóc học viên
                        const startDate = new Date(
                            iterator.cs_list_info[0].created_time
                        )
                        const endDate = new Date(Date.now())
                        const monthDiff = (d1, d2) => {
                            let months
                            months = (d2.getFullYear() - d1.getFullYear()) * 12
                            months -= d1.getMonth()
                            months += d2.getMonth()
                            return months <= 0 ? 0 : months
                        }
                        const diff = monthDiff(startDate, endDate) + 1
                        // tạo ra các tháng không có dữ liệu khi group
                        let tempList = []
                        for (let index = 0; index < diff; index++) {
                            const stringDate =
                                moment(startDate).format('MM/YYYY')
                            const item = cs_list_time.find(
                                (e) => e.time === stringDate
                            )
                            if (item) {
                                item.date = startDate.getTime()
                                tempList = item.listUser
                            } else {
                                cs_list_time.push({
                                    date: startDate.getTime(),
                                    time: stringDate,
                                    listUser: JSON.parse(
                                        JSON.stringify(tempList)
                                    ),
                                    old: 0,
                                    new: 0,
                                    total: 0
                                })
                            }
                            startDate.setMonth(startDate.getMonth() + 1)
                        }
                        // sort lại data
                        cs_list_time.sort(function (a, b) {
                            const timeA = new Date(a.date).getTime()
                            const timeB = new Date(b.date).getTime()
                            return timeA - timeB
                        })

                        // tính toán lại tổng số học sinh chăm sóc hàng thàng, học sinh cũ, học sinh mới,
                        // thông tin chăm sóc, báo cáo cuối khóa của từng CS
                        for (const [
                            index,
                            iterator2
                        ] of cs_list_time.entries()) {
                            if (index === 0) {
                                iterator2.total = iterator2.old + iterator2.new
                            } else {
                                iterator2.old = cs_list_time[index - 1].total
                                iterator2.total = iterator2.old + iterator2.new
                            }

                            const listUser = JSON.parse(
                                JSON.stringify(iterator2.listUser)
                            )
                            // filter thông tin chăm sóc theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.customer_care =
                                    iterator3.customer_care
                                        ? iterator3.customer_care.filter(
                                              (e) => {
                                                  e.date2 = moment(
                                                      e.date
                                                  ).format('MM/YYYY')
                                                  return (
                                                      e.date2 === iterator2.time
                                                  )
                                              }
                                          )
                                        : []
                            }
                            // filter thông tin báo cáo cuối khóa theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.scheduled_memos =
                                    iterator3.scheduled_memos
                                        ? iterator3.scheduled_memos.filter(
                                              (e) => {
                                                  e.date2 = moment(
                                                      e.created_time
                                                  ).format('MM/YYYY')
                                                  return (
                                                      e.date2 === iterator2.time
                                                  )
                                              }
                                          )
                                        : []
                            }
                            // filter thông tin feedback theo tháng
                            for (const iterator3 of listUser) {
                                iterator3.reports = iterator3.reports
                                    ? iterator3.reports.filter((e) => {
                                          e.date2 = moment(
                                              e.created_time
                                          ).format('MM/YYYY')
                                          return e.date2 === iterator2.time
                                      })
                                    : []
                            }
                            iterator2.listUser = listUser
                        }
                        iterator.cs_list_time = JSON.parse(
                            JSON.stringify(cs_list_time)
                        )
                    } else {
                        iterator.cs_list_time = []
                    }
                }
                setValues({ dashboardCS2: dataRes })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading3: false }))
    }

    const caculatorCustomerType = (arr, value) => {
        return arr.reduce((pre, cur) => {
            const add = cur.customer_care.reduce((prev, curv) => {
                const addv = curv.customer_type === value ? 1 : 0
                return prev + addv
            }, 0)
            return pre + add
        }, 0)
    }

    const caculatorCareType = (arr) => {
        return arr.reduce((pre, cur) => {
            const add = cur.customer_care.reduce((prev, curv) => {
                const addv = curv.type !== '' && curv.type !== null ? 1 : 0
                return prev + addv
            }, 0)
            return pre + add
        }, 0)
    }
    const caculatorWatchVideo = (arr) => {
        return arr.reduce((pre, cur) => {
            const add = cur.customer_care.reduce((prev, curv) => {
                const addv = curv.video_feedback ? 1 : 0
                return prev + addv
            }, 0)
            return pre + add
        }, 0)
    }
    const caculatorMemoDone = (arr) => {
        return arr.reduce((pre, cur) => {
            const add = cur.scheduled_memos.reduce((prev, curv) => {
                const addv = curv.teacher_note ? 1 : 0
                return prev + addv
            }, 0)
            return pre + add
        }, 0)
    }
    const caculatorMemoNotDone = (arr) => {
        const totalScheduleMemo = arr.reduce((pre, cur) => {
            const add = cur.scheduled_memos.length
            return pre + add
        }, 0)
        const total = totalScheduleMemo - caculatorMemoDone(arr)
        return total
    }
    const caculatorReport = (arr, type) => {
        return arr.reduce((pre, cur) => {
            const add = cur.reports.reduce((prev, curv) => {
                const addv =
                    type === 'hot'
                        ? curv.level === 2
                            ? 1
                            : 0
                        : curv.level !== 2
                        ? 1
                        : 0
                return prev + addv
            }, 0)
            return pre + add
        }, 0)
    }

    const getArr = (record) => {
        let arr = []
        // children
        if (!record._id) {
            arr = record.listUser
        } else {
            // parent
            const temp = record.cs_list_time.find(
                (e) => moment(Date.now()).format('MM/YYYY') === e.time
            )
            arr = temp?.listUser || []
        }
        return arr
    }

    useEffect(() => {
        // getDashboardForm()
        getDashboardCS()
        getDashboardCS2()
    }, [])

    return (
        <Card title='Dashboard'>
            {/* <Row className='mb-5'>
                <Col span={24}>
                    <h4>Báo cáo form kích hoạt</h4>
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
                            const total = pageData.reduce(
                                (pre, cur) => pre + cur.cs_list_info.length,
                                0
                            )
                            const totalCheckkingDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .checking_call
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
                            const totalCheckkingNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .checking_call
                                                ? 0
                                                : 1
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalGreetingDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .greeting_call
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
                            const totalGreetingNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .greeting_call
                                                ? 0
                                                : 1
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                },
                                0
                            )
                            const totalScheduledDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .scheduled
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
                            const totalScheduledNotDone = pageData.reduce(
                                (pre, cur) => {
                                    const add = cur.cs_list_info.reduce(
                                        (prev, curv) => {
                                            const addv = curv.supporter
                                                .scheduled
                                                ? 0
                                                : 1
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
                                                index <= 7;
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
                                                                ? totalCheckkingDone
                                                                : ''}
                                                            {index === 3
                                                                ? totalCheckkingNotDone
                                                                : ''}
                                                            {index === 4
                                                                ? totalGreetingDone
                                                                : ''}
                                                            {index === 5
                                                                ? totalGreetingNotDone
                                                                : ''}
                                                            {index === 6
                                                                ? totalScheduledDone
                                                                : ''}
                                                            {index === 7
                                                                ? totalScheduledNotDone
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
                                        <Popover
                                            content={
                                                <>
                                                    <div className='popuplevel'>
                                                        <p>
                                                            <b>Fullname : </b>
                                                            {`${record.fullname}`}
                                                        </p>
                                                        <p>
                                                            <b>Username : </b>
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
                                                                Phone number :{' '}
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
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='Số học viên quản lý'
                            dataIndex='cs_list_info'
                            key='cs_list_info'
                            render={(total: any, record: any) => (
                                <div className='max-height text-center'>
                                    {record.cs_list_info.length}
                                </div>
                            )}
                        />
                        <ColumnGroup title='Checking Call'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='checking_call'
                                key='checking_call'
                                render={(text: any, record: any) => {
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter
                                                .checking_call
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
                                dataIndex='schedule_not_done'
                                key='schedule_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter
                                                .checking_call
                                                ? 0
                                                : 1
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

                        <ColumnGroup title='Greeting call'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='greeting_call_done'
                                key='greeting_call_done'
                                render={(text: any, record: any) => {
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter
                                                .greeting_call
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
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter
                                                .greeting_call
                                                ? 0
                                                : 1
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
                        <ColumnGroup title='Schedule'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='schedule_done'
                                key='schedule_done'
                                render={(text: any, record: any) => {
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter.scheduled
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
                                dataIndex='schedule_not_done'
                                key='schedule_not_done'
                                render={(text: any, record: any) => {
                                    const total = record.cs_list_info.reduce(
                                        (pre, cur) => {
                                            const add = cur.supporter.scheduled
                                                ? 0
                                                : 1
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
            </Row> */}
            <Row className='mb-5'>
                <Col span={24}>
                    <h4>Báo cáo chăm sóc khách hàng</h4>
                    <Table
                        className='student-management-table'
                        size='small'
                        dataSource={values.dashboardCS}
                        rowKey={(record: any) =>
                            record._id?.username || record.date
                        }
                        scroll={{
                            x: 500,
                            y: 768
                        }}
                        bordered
                        pagination={false}
                        loading={values.isLoading2}
                        sticky
                        expandable={{
                            childrenColumnName: 'cs_list_time'
                        }}
                        summary={(pageData: any) => {
                            const total = pageData.reduce(
                                (pre, cur) => pre + cur.cs_list_info.length,
                                0
                            )
                            const findE = (arr = []) => {
                                return arr.find(
                                    (e) =>
                                        moment(Date.now()).format('MM/YYYY') ===
                                        e.time
                                )
                            }

                            let totalNormalCustomer = 0
                            let totalNewCustomer = 0
                            let totalWarningCustomer = 0
                            let totalDearCustomer = 0
                            let totalVipCustomer = 0
                            let totalBusinessCustomer = 0
                            let totalCareDone = 0
                            let totalNotCareDone = 0
                            let percent = 0
                            let totalWatchVideo = 0
                            let percentWatchVideo = 0
                            let totalMemoDone = 0
                            let totalMemoNotDone = 0
                            let totalReportHot = 0
                            let totalReportNormal = 0

                            // loop all cs
                            pageData.forEach((e) => {
                                // find data of now month
                                const element = findE(e.cs_list_time)
                                if (element) {
                                    totalNormalCustomer +=
                                        element.listUser.reduce((pre, cur) => {
                                            const add =
                                                cur.customer_care.reduce(
                                                    (prev, curv) => {
                                                        const addv =
                                                            !curv.customer_type
                                                                ? 1
                                                                : 0
                                                        return prev + addv
                                                    },
                                                    0
                                                )
                                            return pre + add
                                        }, 0)
                                    totalNewCustomer += caculatorCustomerType(
                                        element.listUser,
                                        1
                                    )
                                    totalWarningCustomer +=
                                        caculatorCustomerType(
                                            element.listUser,
                                            2
                                        )
                                    totalDearCustomer += caculatorCustomerType(
                                        element.listUser,
                                        3
                                    )
                                    totalVipCustomer += caculatorCustomerType(
                                        element.listUser,
                                        4
                                    )
                                    totalBusinessCustomer +=
                                        caculatorCustomerType(
                                            element.listUser,
                                            5
                                        )
                                    totalCareDone += caculatorCareType(
                                        element.listUser
                                    )
                                    totalWatchVideo += caculatorWatchVideo(
                                        element.listUser
                                    )
                                    totalMemoDone += caculatorMemoDone(
                                        element.listUser
                                    )
                                    totalMemoNotDone += caculatorMemoNotDone(
                                        element.listUser
                                    )
                                    totalReportHot += caculatorReport(
                                        element.listUser,
                                        'hot'
                                    )
                                    totalReportNormal += caculatorReport(
                                        element.listUser,
                                        'normal'
                                    )
                                }
                            })
                            totalNotCareDone = total - totalCareDone
                            percent =
                                total !== 0
                                    ? Math.round((totalCareDone / total) * 100)
                                    : 0
                            percentWatchVideo =
                                total !== 0
                                    ? Math.round(
                                          (totalWatchVideo / total) * 100
                                      )
                                    : 0
                            return (
                                <Table.Summary fixed='top'>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            key='cell-cs-0'
                                            index={0}
                                        >
                                            <p className='text-center '>Tổng</p>
                                        </Table.Summary.Cell>
                                        {(() => {
                                            const arr = []
                                            for (
                                                let index = 1;
                                                index <= 15;
                                                index++
                                            ) {
                                                arr.push(
                                                    <Table.Summary.Cell
                                                        key={`cell-cs-${index}`}
                                                        index={index}
                                                    >
                                                        <p className='text-center'>
                                                            {index === 1
                                                                ? total
                                                                : ''}
                                                            {index === 2
                                                                ? totalCareDone
                                                                : ''}
                                                            {index === 3
                                                                ? totalNotCareDone
                                                                : ''}
                                                            {index === 4
                                                                ? `${totalCareDone}(${percent}%)`
                                                                : ''}
                                                            {index === 5
                                                                ? `${totalWatchVideo}(${percentWatchVideo}%)`
                                                                : ''}

                                                            {index === 6
                                                                ? totalNormalCustomer
                                                                : ''}
                                                            {index === 7
                                                                ? totalNewCustomer
                                                                : ''}
                                                            {index === 8
                                                                ? totalWarningCustomer
                                                                : ''}
                                                            {index === 9
                                                                ? totalDearCustomer
                                                                : ''}
                                                            {index === 10
                                                                ? totalVipCustomer
                                                                : ''}
                                                            {index === 11
                                                                ? totalBusinessCustomer
                                                                : ''}

                                                            {index === 12
                                                                ? totalMemoDone
                                                                : ''}
                                                            {index === 13
                                                                ? totalMemoNotDone
                                                                : ''}
                                                            {index === 14
                                                                ? totalReportHot
                                                                : ''}
                                                            {index === 15
                                                                ? totalReportNormal
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
                            dataIndex='fullname'
                            key='fullname'
                            render={(fullname: any, record: any) => {
                                // render children row
                                if (!record._id) {
                                    return (
                                        <p className='text-center'>
                                            {record.time}
                                        </p>
                                    )
                                }
                                // render main row
                                return (
                                    <div className='max-height text-center'>
                                        <Popover
                                            content={
                                                <>
                                                    <div className='popuplevel'>
                                                        <p>
                                                            <b>Fullname : </b>
                                                            {`${record.fullname}`}
                                                        </p>
                                                        <p>
                                                            <b>username : </b>
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
                                                                Phone number :{' '}
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
                                                {`${record.fullname} (${moment(
                                                    Date.now()
                                                ).format('MM/YYYY')})`}
                                            </a>
                                        </Popover>
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            fixed
                            title='Số học viên quản lý'
                            dataIndex='total'
                            key='total'
                            render={(total: any, record: any) => {
                                // render children row
                                if (!record._id) {
                                    return (
                                        <p className='text-center'>
                                            {' '}
                                            {record.total}
                                        </p>
                                    )
                                }

                                // render main row
                                return (
                                    <div className='max-height text-center'>
                                        {record.cs_list_info.length}
                                    </div>
                                )
                            }}
                        />
                        <ColumnGroup title='Kết quả Customer Care'>
                            <Column
                                width={100}
                                title='Đã Customer care'
                                dataIndex='customer_care_done'
                                key='customer_care_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorCareType(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Chưa Customer care'
                                dataIndex='customer_care_not_done'
                                key='customer_care_not_done'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorCareType(arr)
                                    const total = totalStudent - done
                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Tỉ lệ'
                                dataIndex='customer_care_rate'
                                key='customer_care_rate'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorCareType(arr)
                                    const percent =
                                        totalStudent !== 0
                                            ? Math.round(
                                                  (done / totalStudent) * 100
                                              )
                                            : 0
                                    return (
                                        <div className='max-height text-center'>
                                            {`${done}(${percent}%)`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Xem video'
                                dataIndex='customer_care_video'
                                key='customer_care_video'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorWatchVideo(arr)
                                    const percent =
                                        totalStudent !== 0
                                            ? Math.round(
                                                  (done / totalStudent) * 100
                                              )
                                            : 0
                                    return (
                                        <div className='max-height text-center'>
                                            {`${done}(${percent}%)`}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                        <Column
                            width={100}
                            title='KH thông thường'
                            dataIndex='normal_student'
                            key='normal_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = arr.reduce((pre, cur) => {
                                    const add = cur.customer_care.reduce(
                                        (prev, curv) => {
                                            const addv = !curv.customer_type
                                                ? 1
                                                : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                }, 0)

                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH mới'
                            dataIndex='new_student'
                            key='new_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 1)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH cảnh báo'
                            dataIndex='warning_student'
                            key='warning_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 2)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH thân thiết'
                            dataIndex='dear_student'
                            key='dear_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 3)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH Vip/Ngoại giao'
                            dataIndex='dear_student'
                            key='vip_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 4)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH doanh nghiệp'
                            dataIndex='business_student'
                            key='business_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 5)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />

                        <ColumnGroup title='Báo cáo cuối khóa'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='report_done'
                                key='report_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorMemoDone(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='report_not_done'
                                key='report_not_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)

                                    const total = caculatorMemoNotDone(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                        <ColumnGroup title='Khiếu nại'>
                            <Column
                                width={100}
                                title='Hot'
                                dataIndex='customer_care_hot'
                                key='customer_care_hot'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)

                                    const total = caculatorReport(arr, 'hot')
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Normal'
                                dataIndex='customer_care_normal'
                                key='customer_care_normal'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorReport(arr, 'normal')
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                    </Table>
                </Col>
            </Row>
            <Row className='mb-5'>
                <Col span={24}>
                    <h4>Báo cáo chăm sóc khách hàng có gói đang học</h4>
                    <Table
                        className='student-management-table'
                        size='small'
                        dataSource={values.dashboardCS2}
                        rowKey={(record: any) =>
                            record._id?.username || record.date
                        }
                        scroll={{
                            x: 500,
                            y: 768
                        }}
                        bordered
                        pagination={false}
                        loading={values.isLoading3}
                        sticky
                        expandable={{
                            childrenColumnName: 'cs_list_time'
                        }}
                        summary={(pageData: any) => {
                            const total = pageData.reduce(
                                (pre, cur) => pre + cur.cs_list_info.length,
                                0
                            )
                            const findE = (arr = []) => {
                                return arr.find(
                                    (e) =>
                                        moment(Date.now()).format('MM/YYYY') ===
                                        e.time
                                )
                            }

                            let totalNormalCustomer = 0
                            let totalNewCustomer = 0
                            let totalWarningCustomer = 0
                            let totalDearCustomer = 0
                            let totalVipCustomer = 0
                            let totalBusinessCustomer = 0
                            let totalCareDone = 0
                            let totalNotCareDone = 0
                            let percent = 0
                            let totalWatchVideo = 0
                            let percentWatchVideo = 0
                            let totalMemoDone = 0
                            let totalMemoNotDone = 0
                            let totalReportHot = 0
                            let totalReportNormal = 0

                            // loop all cs
                            pageData.forEach((e) => {
                                // find data of now month
                                const element = findE(e.cs_list_time)
                                if (element) {
                                    totalNormalCustomer +=
                                        element.listUser.reduce((pre, cur) => {
                                            const add =
                                                cur.customer_care.reduce(
                                                    (prev, curv) => {
                                                        const addv =
                                                            !curv.customer_type
                                                                ? 1
                                                                : 0
                                                        return prev + addv
                                                    },
                                                    0
                                                )
                                            return pre + add
                                        }, 0)
                                    totalNewCustomer += caculatorCustomerType(
                                        element.listUser,
                                        1
                                    )
                                    totalWarningCustomer +=
                                        caculatorCustomerType(
                                            element.listUser,
                                            2
                                        )
                                    totalDearCustomer += caculatorCustomerType(
                                        element.listUser,
                                        3
                                    )
                                    totalVipCustomer += caculatorCustomerType(
                                        element.listUser,
                                        4
                                    )
                                    totalBusinessCustomer +=
                                        caculatorCustomerType(
                                            element.listUser,
                                            5
                                        )
                                    totalCareDone += caculatorCareType(
                                        element.listUser
                                    )

                                    totalWatchVideo += caculatorWatchVideo(
                                        element.listUser
                                    )
                                    totalMemoDone += caculatorMemoDone(
                                        element.listUser
                                    )
                                    totalMemoNotDone += caculatorMemoNotDone(
                                        element.listUser
                                    )
                                    totalReportHot += caculatorReport(
                                        element.listUser,
                                        'hot'
                                    )
                                    totalReportNormal += caculatorReport(
                                        element.listUser,
                                        'normal'
                                    )
                                }
                            })
                            totalNotCareDone = total - totalCareDone
                            percent =
                                total !== 0
                                    ? Math.round((totalCareDone / total) * 100)
                                    : 0
                            percentWatchVideo =
                                total !== 0
                                    ? Math.round(
                                          (totalWatchVideo / total) * 100
                                      )
                                    : 0
                            return (
                                <Table.Summary fixed='top'>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            key='cell-cs-0'
                                            index={0}
                                        >
                                            <p className='text-center '>Tổng</p>
                                        </Table.Summary.Cell>
                                        {(() => {
                                            const arr = []
                                            for (
                                                let index = 1;
                                                index <= 15;
                                                index++
                                            ) {
                                                arr.push(
                                                    <Table.Summary.Cell
                                                        key={`cell-cs-${index}`}
                                                        index={index}
                                                    >
                                                        <p className='text-center'>
                                                            {index === 1
                                                                ? total
                                                                : ''}
                                                            {index === 2
                                                                ? totalCareDone
                                                                : ''}
                                                            {index === 3
                                                                ? totalNotCareDone
                                                                : ''}
                                                            {index === 4
                                                                ? `${totalCareDone}(${percent}%)`
                                                                : ''}
                                                            {index === 5
                                                                ? `${totalWatchVideo}(${percentWatchVideo}%)`
                                                                : ''}

                                                            {index === 6
                                                                ? totalNormalCustomer
                                                                : ''}
                                                            {index === 7
                                                                ? totalNewCustomer
                                                                : ''}
                                                            {index === 8
                                                                ? totalWarningCustomer
                                                                : ''}
                                                            {index === 9
                                                                ? totalDearCustomer
                                                                : ''}
                                                            {index === 10
                                                                ? totalVipCustomer
                                                                : ''}
                                                            {index === 11
                                                                ? totalBusinessCustomer
                                                                : ''}

                                                            {index === 12
                                                                ? totalMemoDone
                                                                : ''}
                                                            {index === 13
                                                                ? totalMemoNotDone
                                                                : ''}
                                                            {index === 14
                                                                ? totalReportHot
                                                                : ''}
                                                            {index === 15
                                                                ? totalReportNormal
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
                            dataIndex='fullname'
                            key='fullname'
                            render={(fullname: any, record: any) => {
                                // render children row
                                if (!record._id) {
                                    return (
                                        <p className='text-center'>
                                            {record.time}
                                        </p>
                                    )
                                }
                                // render main row
                                return (
                                    <div className='max-height text-center'>
                                        <Popover
                                            content={
                                                <>
                                                    <div className='popuplevel'>
                                                        <p>
                                                            <b>Fullname : </b>
                                                            {`${record.fullname}`}
                                                        </p>
                                                        <p>
                                                            <b>username : </b>
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
                                                                Phone number :{' '}
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
                                                {`${record.fullname} (${moment(
                                                    Date.now()
                                                ).format('MM/YYYY')})`}
                                            </a>
                                        </Popover>
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            fixed
                            title='Số học viên quản lý'
                            dataIndex='total'
                            key='total'
                            render={(total: any, record: any) => {
                                // render children row
                                if (!record._id) {
                                    return (
                                        <p className='text-center'>
                                            {' '}
                                            {record.total}
                                        </p>
                                    )
                                }

                                // render main row
                                return (
                                    <div className='max-height text-center'>
                                        {record.cs_list_info.length}
                                    </div>
                                )
                            }}
                        />
                        <ColumnGroup title='Kết quả Customer Care'>
                            <Column
                                width={100}
                                title='Đã Customer care'
                                dataIndex='customer_care_done'
                                key='customer_care_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorCareType(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Chưa Customer care'
                                dataIndex='customer_care_not_done'
                                key='customer_care_not_done'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorCareType(arr)
                                    const total = totalStudent - done
                                    return (
                                        <div className='max-height text-center'>
                                            {total}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Tỉ lệ'
                                dataIndex='customer_care_rate'
                                key='customer_care_rate'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorCareType(arr)
                                    const percent =
                                        totalStudent !== 0
                                            ? Math.round(
                                                  (done / totalStudent) * 100
                                              )
                                            : 0
                                    return (
                                        <div className='max-height text-center'>
                                            {`${done}(${percent}%)`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Xem video'
                                dataIndex='customer_care_video'
                                key='customer_care_video'
                                render={(text: any, record: any) => {
                                    let arr = []
                                    let totalStudent = 0
                                    // children
                                    if (!record._id) {
                                        arr = record.listUser
                                        totalStudent = record.total
                                    } else {
                                        // parent
                                        const temp = record.cs_list_time.find(
                                            (e) =>
                                                moment(Date.now()).format(
                                                    'MM/YYYY'
                                                ) === e.time
                                        )
                                        arr = temp?.listUser || []
                                        totalStudent =
                                            record.cs_list_info.length
                                    }
                                    const done = caculatorWatchVideo(arr)
                                    const percent =
                                        totalStudent !== 0
                                            ? Math.round(
                                                  (done / totalStudent) * 100
                                              )
                                            : 0
                                    return (
                                        <div className='max-height text-center'>
                                            {`${done}(${percent}%)`}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                        <Column
                            width={100}
                            title='KH thông thường'
                            dataIndex='normal_student'
                            key='normal_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = arr.reduce((pre, cur) => {
                                    const add = cur.customer_care.reduce(
                                        (prev, curv) => {
                                            const addv = !curv.customer_type
                                                ? 1
                                                : 0
                                            return prev + addv
                                        },
                                        0
                                    )
                                    return pre + add
                                }, 0)

                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH mới'
                            dataIndex='new_student'
                            key='new_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 1)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH cảnh báo'
                            dataIndex='warning_student'
                            key='warning_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 2)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH thân thiết'
                            dataIndex='dear_student'
                            key='dear_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 3)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH Vip/Ngoại giao'
                            dataIndex='dear_student'
                            key='vip_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 4)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />
                        <Column
                            width={100}
                            title='KH doanh nghiệp'
                            dataIndex='business_student'
                            key='business_student'
                            render={(text: any, record: any) => {
                                const arr = getArr(record)
                                const total = caculatorCustomerType(arr, 5)
                                return (
                                    <div className='max-height text-center'>
                                        {total}
                                    </div>
                                )
                            }}
                        />

                        <ColumnGroup title='Báo cáo cuối khóa'>
                            <Column
                                width={100}
                                title='Done'
                                dataIndex='report_done'
                                key='report_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorMemoDone(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Not done'
                                dataIndex='report_not_done'
                                key='report_not_done'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)

                                    const total = caculatorMemoNotDone(arr)
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                        </ColumnGroup>
                        <ColumnGroup title='Khiếu nại'>
                            <Column
                                width={100}
                                title='Hot'
                                dataIndex='customer_care_hot'
                                key='customer_care_hot'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)

                                    const total = caculatorReport(arr, 'hot')
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
                                        </div>
                                    )
                                }}
                            />
                            <Column
                                width={100}
                                title='Normal'
                                dataIndex='customer_care_normal'
                                key='customer_care_normal'
                                render={(text: any, record: any) => {
                                    const arr = getArr(record)
                                    const total = caculatorReport(arr, 'normal')
                                    return (
                                        <div className='max-height text-center'>
                                            {`${total}`}
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
