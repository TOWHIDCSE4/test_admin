import { useCallback, useEffect, useReducer } from 'react'
import { Table, Card, notification, DatePicker, Row, Col, Tag } from 'antd'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import SearchUser from 'components/search-user-with-lazy-load'
import TeacherAPI from 'api/TeacherAPI'

const AbsenceReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            start_time: moment().startOf('m'),
            days_in_month: [],
            teacher_id: ''
        }
    )

    const fetchScheduleSlotReport = useCallback(
        ({ page_size, page_number, start_time, teacher_id }) => {
            setValues({ isLoading: true })
            ReportAPI.getTeacherAbsenceForAcademyReport({
                page_size,
                page_number,
                month: moment(start_time).get('months') + 1,
                year: moment(start_time).get('years'),
                teacher_id
            })
                .then((res) => {
                    setValues({ data_reports: res })
                    if (res.length > 0) {
                        const sum = new Array(values.start_time.daysInMonth())
                            .fill(0)
                            .map((item, index) => {
                                const total_authorized_leave = res.reduce(
                                    (s, i) =>
                                        (s +=
                                            i.days_in_month[index]
                                                ?.total_authorized_leave),
                                    0
                                )
                                const total_unauthorized_leave = res.reduce(
                                    (s, i) =>
                                        (s +=
                                            i.days_in_month[index]
                                                ?.total_unauthorized_leave),
                                    0
                                )
                                return {
                                    total_authorized_leave,
                                    total_unauthorized_leave
                                }
                            })
                        setValues({ days_in_month: sum })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    useEffect(() => {
        TeacherLevelAPI.getTeacherLevels({}).then((result) => {
            fetchScheduleSlotReport({ ...values })
        })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            fetchScheduleSlotReport({
                page_number: pageNumber,
                page_size: pageSize,
                start_time: values.start_time
            })
        },
        [values]
    )

    const handlerDateFilter = useCallback(
        (v) => {
            setValues({ start_time: v })
            fetchScheduleSlotReport({
                page_number: values.page_number,
                page_size: values.page_size,
                start_time: v
            })
        },
        [values]
    )

    const renderChildCol = () =>
        new Array(values.start_time.daysInMonth())
            .fill(0)
            .map((item, index) => ({
                title: index + 1,
                dataIndex: index,
                key: index,
                children: [
                    {
                        title: (
                            <span style={{ color: '#40a9ff' }}>
                                {values.days_in_month[index]
                                    ? values.days_in_month[index]
                                          .total_authorized_leave
                                    : 0}
                            </span>
                        ),
                        dataIndex: 'none',
                        key: 'none',
                        align: 'center',
                        children: [
                            {
                                title: (
                                    <span style={{ color: '#ff4d4f' }}>
                                        {values.days_in_month[index]
                                            ? values.days_in_month[index]
                                                  .total_unauthorized_leave
                                            : 0}
                                    </span>
                                ),
                                dataIndex: 'days_in_month',
                                key: 'days_in_month',
                                width: 70,
                                align: 'center',
                                render: (text) => (
                                    <>
                                        {text &&
                                            text[index] &&
                                            text[index]
                                                ?.total_unauthorized_leave >
                                                0 && (
                                                <p className='mb-1'>
                                                    <Tag color='#ff4d4f'>
                                                        {
                                                            text[index]
                                                                ?.total_unauthorized_leave
                                                        }{' '}
                                                        X
                                                    </Tag>
                                                </p>
                                            )}
                                        {text &&
                                            text[index] &&
                                            text[index]
                                                ?.total_authorized_leave >
                                                0 && (
                                                <p>
                                                    {' '}
                                                    <Tag color='#40a9ff'>
                                                        {
                                                            text[index]
                                                                ?.total_authorized_leave
                                                        }{' '}
                                                        P
                                                    </Tag>
                                                </p>
                                            )}
                                    </>
                                )
                            }
                        ]
                    }
                ]
            }))

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 80,
            align: 'center',
            render: (text, record: ITeacher, index) => index + 1
        },
        {
            title: 'Mã GV',
            dataIndex: 'teacher_id',
            key: 'teacher_id',
            fixed: true,
            width: 80,
            align: 'center',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Tên GV',
            dataIndex: 'full_name',
            key: 'full_name',
            fixed: true,
            width: 120,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Quản lý',
            width: 80,
            align: 'center',
            children: [
                {
                    title: '',
                    dataIndex: 'none',
                    key: 'none',
                    width: 80,
                    children: [
                        {
                            title: 'P',
                            dataIndex: 'none',
                            key: 'none',
                            width: 80,
                            children: [
                                {
                                    title: 'X',
                                    dataIndex: 'none',
                                    key: 'none',
                                    width: 80,
                                    render: (text, record: any) => (
                                        <Tag color='#f50'>-</Tag>
                                    )
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: `${values.start_time.format('MMM')}`,
            align: 'center',
            children: renderChildCol()
        },
        {
            title: 'Tổng',
            width: 80,
            align: 'center',
            children: [
                {
                    title: 'P',
                    dataIndex: 'none',
                    key: 'none',
                    width: 80,
                    children: [
                        {
                            title: `${values.days_in_month.reduce(
                                (s, i) => (s += i.total_authorized_leave),
                                0
                            )}`,
                            dataIndex: 'days_in_month',
                            key: 'days_in_month',
                            width: 80,
                            render: (text) => (
                                <Tag color='#40a9ff'>
                                    {text
                                        ? text.reduce(
                                              (s, i) =>
                                                  (s +=
                                                      i.total_authorized_leave),
                                              0
                                          )
                                        : 0}
                                </Tag>
                            )
                        }
                    ]
                },
                {
                    title: 'X',
                    dataIndex: 'none',
                    key: 'none',
                    width: 80,
                    children: [
                        {
                            title: `${values.days_in_month.reduce(
                                (s, i) => (s += i.total_unauthorized_leave),
                                0
                            )}`,
                            dataIndex: 'days_in_month',
                            key: 'days_in_month',
                            width: 80,
                            render: (text) => (
                                <Tag color='#ff4d4f'>
                                    {text
                                        ? text.reduce(
                                              (s, i) =>
                                                  (s +=
                                                      i.total_unauthorized_leave),
                                              0
                                          )
                                        : 0}
                                </Tag>
                            )
                        }
                    ]
                }
            ]
        }
    ]
    const searchDataUser = (data) => {
        if (data.selected) {
            const searchText = data.selected.user_id

            setValues({
                page_number: 1,
                search: '',
                total: 1,
                teacher_id: searchText
            })
            fetchScheduleSlotReport({
                ...values,
                page_number: 1,
                search: '',
                total: 1,
                teacher_id: searchText
            })
        }
        if (data.clear) {
            setValues({ page_number: 1, search: '', teacher_id: '' })
            fetchScheduleSlotReport({
                ...values,
                page_number: 1,
                search: '',
                teacher_id: ''
            })
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Choose Teacher',
            engine: (
                <SearchUser
                    api={TeacherAPI.getAllTeachers}
                    placeholder='Search by teacher'
                    searchDataUser={searchDataUser}
                ></SearchUser>
            )
        },
        {
            label: 'Date time',
            engine: (
                <DatePicker
                    format='MM-YYYY'
                    allowClear={false}
                    picker='month'
                    value={values.start_time}
                    onChange={handlerDateFilter}
                    disabledDate={(current) => current > moment()}
                />
            )
        }
    ]

    return (
        <Card title='BÁO CÁO NGHỈ PHÉP'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.data_reports}
                columns={columns}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: ITeacher) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
        </Card>
    )
}

export default AbsenceReport
