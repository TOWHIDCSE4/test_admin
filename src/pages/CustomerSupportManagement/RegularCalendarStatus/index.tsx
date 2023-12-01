import React, { useEffect, useState, useCallback, useReducer } from 'react'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Select,
    Tag,
    Collapse,
    Form,
    Button,
    Spin,
    DatePicker,
    Popover,
    Timeline
} from 'antd'
import { Route, Link } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentAPI from 'api/StudentAPI'
import CustomerSupportManagementAPI from 'api/CustomerSupportManagementAPI'

import { DEPARTMENT } from 'const/department'
import {
    formatTimestamp,
    formatTimestamp2,
    getTimestampInWeekToLocal
} from 'utils'
import { DAY_TO_MS, ENUM_BOOKING_STATUS, HOUR_TO_MS, MINUTE_TO_MS } from 'const'
import { RangePickerProps } from 'antd/es/date-picker'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import CreateBookingModel from './ModalsCreateBooking'
import CreateBookingModel2 from './ModalsCreateBooking2'
import NameTeacherStudent from 'components/name-teacher-student'

const { RangePicker } = DatePicker
const { Option } = Select
const { Panel } = Collapse

const errorMessage = [
    'The teacher is not active',
    'Ordered package has expired',
    'Calendar not found',
    'This package is unavailable for this type of booking',
    'Number class <= 0',
    'Teacher unavailable at this time',
    'Updated a booking with unit id',
    'Created a booking.',
    'The automatic system changed the teacher for student',
    'Booking has been locked unit',
    'Next course'
]

const UserReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            objectSearch: {
                status: '',
                student_id: '',
                staff_id: '',
                fromDate: moment(),
                toDate: moment(),
                messageSchedule: ''
            },
            students: [],
            teachers: [],
            listAdmin: [],
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            }
        }
    )
    const [form] = Form.useForm()

    const getAllRegularCalendar = ({
        page_size,
        page_number,
        objectSearch
    }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            ...objectSearch,
            fromDate: values.objectSearch.fromDate,
            toDate: values.objectSearch.toDate
        }
        if (searchData.fromDate && searchData.toDate) {
            const fromDate =
                searchData.fromDate.day() * DAY_TO_MS +
                0 * HOUR_TO_MS +
                0 * MINUTE_TO_MS

            const toDate =
                searchData.toDate.day() * DAY_TO_MS +
                23 * HOUR_TO_MS +
                59 * MINUTE_TO_MS

            searchData.fromDate = fromDate
            searchData.toDate = toDate
        }

        CustomerSupportManagementAPI.getAllRegularCalendar(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ data: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getAllRegularCalendar({
            page_number,
            page_size,
            objectSearch: values.objectSearch
        })
    }

    const fetchAdministrators = async () => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                idDepartment: DEPARTMENT.phongcskh.id
            })
            setValues({
                listAdmin: res.data.map((i: any) => ({
                    label: i.fullname,
                    value: i.id
                }))
            })
        } catch (error) {
            console.error(error)
        }
    }
    const getRegularStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
            const _time1 = 0 * DAY_TO_MS + 0 * HOUR_TO_MS + 0 * MINUTE_TO_MS
            StudentAPI.getRegularStudents({
                status: 'active',
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    filter.student.total = res.pagination.total
                    let newStudents = [...res.data]
                    if (query.page_number > 1) {
                        newStudents = [...students, ...res.data]
                    }
                    setValues({
                        students: newStudents,
                        filter
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [values]
    )
    const [isShownModalBooking, setShownModalBooking] = useState(false)
    const [isShownModalBooking2, setShownModalBooking2] = useState(false)
    const [selectedCalendar, setSelectedCalendar] = useState(null)

    const toggleModalBooking = (value) => {
        setShownModalBooking(value)
    }

    const toggleModalBooking2 = (value) => {
        setShownModalBooking2(value)
    }

    useEffect(() => {
        fetchAdministrators()
        form.setFieldsValue({
            ...values.objectSearch
        })
        getAllRegularCalendar({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
        getRegularStudents({
            search: ''
        })
    }, [])
    const colorStatus = (_status) => {
        switch (_status) {
            case ENUM_BOOKING_STATUS.COMPLETED:
                return 'success'
            case ENUM_BOOKING_STATUS.PENDING:
                return 'warning'
            case ENUM_BOOKING_STATUS.UPCOMING:
                return 'cyan'
            case ENUM_BOOKING_STATUS.TEACHING:
                return 'processing'
            case ENUM_BOOKING_STATUS.STUDENT_ABSENT:
                return 'error'
            case ENUM_BOOKING_STATUS.TEACHER_ABSENT:
                return 'error'
            case ENUM_BOOKING_STATUS.CANCEL_BY_STUDENT:
                return 'error'
            case ENUM_BOOKING_STATUS.CANCEL_BY_TEACHER:
                return 'error'
            default:
                break
        }
    }

    const onReset = () => {
        const objectSearch = {
            status: '',
            student_id: '',
            staff_id: ''
        }
        form.setFieldsValue({
            ...objectSearch
        })
        setValues({
            objectSearch,
            page_number: 1
        })
        getAllRegularCalendar({
            page_size: values.page_size,
            page_number: 1,
            objectSearch
        })
    }

    const loadMore = (key) => (event) => {
        const { target } = event
        if (
            !values.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { filter, page_size } = values
            if (filter[key].total > page_size * filter[key].page_number) {
                filter[key].page_number += 1
                setValues({ filter })
                getRegularStudents({
                    page_number: filter[key].page_number,
                    search: filter[key].search,
                    page_size
                })
            }
        }
    }
    const onSearch = (valuesForm: any) => {
        console.log(valuesForm)
        setValues({
            page_number: 1,
            objectSearch: { ...values.objectSearch, ...valuesForm }
        })
        getAllRegularCalendar({
            page_number: 1,
            page_size: values.page_size,
            objectSearch: valuesForm
        })
    }

    const reload = () => {
        onSearch(form.getFieldsValue())
    }
    const onSearchStudent = (key) => (value: string) => {
        const { filter, page_size } = values
        filter[key].search = value
        filter[key].page_number = 1
        getRegularStudents({
            page_number: filter[key].page_number,
            page_size,
            search: value
        })
        setValues({ filter })
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                if (key === 'teachers') {
                    return (
                        <Option key={index} value={item.user_id || item.id}>
                            {item.user
                                ? item.user.full_name
                                : `${item.full_name} | ${item.username}`}
                        </Option>
                    )
                }
                return (
                    <Option key={index} value={item.id}>
                        {item.package_name ||
                            item.name ||
                            `${item.full_name} | ${item.username}`}
                    </Option>
                )
            })
        }
    }

    const columns: any = [
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                return (
                    <NameTeacherStudent
                        data={e}
                        type='student'
                    ></NameTeacherStudent>
                )
            }
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                const teacher =
                    record?.booking && record?.booking[0]?.teacher[0]

                return record.auto_schedule &&
                    record.auto_schedule.message.includes(
                        'The automatic system changed the teacher for student'
                    ) ? (
                    <>
                        <p>
                            Old :{' '}
                            <NameTeacherStudent
                                data={e}
                                type='teacher'
                            ></NameTeacherStudent>
                        </p>
                        {teacher ? (
                            <p>
                                New :{' '}
                                <NameTeacherStudent
                                    data={teacher}
                                    type='teacher'
                                ></NameTeacherStudent>
                            </p>
                        ) : (
                            ''
                        )}
                    </>
                ) : (
                    <NameTeacherStudent
                        data={e}
                        type='teacher'
                    ></NameTeacherStudent>
                )
            }
        },
        {
            title: 'Regular time',
            dataIndex: 'regular_start_time',
            key: 'teacher',
            align: 'left',
            width: 150,
            render: (item, record: any) => {
                const convertToLocal = item
                    ? getTimestampInWeekToLocal(item)
                    : null
                return formatTimestamp(convertToLocal)
            }
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                return `${e.name} `
            }
        },
        {
            title: 'Auto Schedule',
            dataIndex: 'auto_schedule',
            key: 'auto_schedule',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                if (e) {
                    const element = (
                        <>
                            <p>
                                Time :{' '}
                                {moment(e.time).format('HH:mm DD/MM/YYYY')}
                            </p>
                            <p>Status : {e.success ? 'Success' : 'Failed'}</p>
                            {e.message ? (
                                <p
                                    style={{
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    Message: {e.message}
                                </p>
                            ) : (
                                ''
                            )}
                            {e.booking_id ? (
                                <p>Booking Id : {e.booking_id}</p>
                            ) : (
                                ''
                            )}
                        </>
                    )
                    if (record?.auto_schedule_history?.length) {
                        return (
                            <Popover
                                content={
                                    <Timeline>
                                        {record.auto_schedule_history.map(
                                            (item) => {
                                                return (
                                                    <Timeline.Item color='green'>
                                                        <b>
                                                            {`${moment(
                                                                item.time
                                                            ).format(
                                                                'HH:mm DD/MM/YYYY'
                                                            )}`}
                                                        </b>
                                                        <p
                                                            style={{
                                                                whiteSpace:
                                                                    'pre-line'
                                                            }}
                                                        >{` ${item.message}`}</p>
                                                    </Timeline.Item>
                                                )
                                            }
                                        )}
                                    </Timeline>
                                }
                            >
                                {element}
                            </Popover>
                        )
                    }
                    return element
                }
                return <></>
            }
        },
        {
            title: 'Last Booking',
            dataIndex: 'booking',
            key: 'booking',
            align: 'left',
            width: 200,
            render: (item, record: any) => {
                const booking = item ? item[0] : null
                return booking ? (
                    <ul
                        key={`regular${booking._id}`}
                        className='list-unstyled '
                    >
                        <li>
                            <b>Time: </b>
                            <span className='mr-1'>
                                {moment(booking.calendar.start_time).format(
                                    'HH:mm DD/MM/yyyy'
                                )}
                            </span>
                        </li>
                        <li>
                            <b>Booking Id: </b>
                            <Link to={`/teaching/overview?id=${booking.id}`}>
                                {booking && booking.id}
                            </Link>
                        </li>
                        <li>
                            <b>Status: </b>
                            {booking && (
                                <Tag color={colorStatus(booking.status)}>
                                    {ENUM_BOOKING_STATUS[booking.status]}
                                </Tag>
                            )}
                        </li>
                    </ul>
                ) : (
                    ''
                )
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'booking',
            align: 'left',
            width: 200,
            render: (item, record: any) => {
                if (
                    checkPermission(PERMISSIONS.csmrcs_create_booking) &&
                    (record?.auto_schedule?.message?.includes(
                        'unavailable at'
                    ) ||
                        record?.auto_schedule?.message?.includes(
                            'Calendar not found'
                        ))
                ) {
                    return (
                        <Button
                            type='primary'
                            onClick={() => {
                                setSelectedCalendar(record)
                                toggleModalBooking(true)
                            }}
                        >
                            Add Booking
                        </Button>
                    )
                }
                let checkBooking = false
                if (record?.booking?.length === 0) {
                    checkBooking = true
                } else {
                    record?.booking?.forEach((element) => {
                        const tempDate = moment(element?.calendar?.start_time)
                        if (tempDate.valueOf() < moment().valueOf()) {
                            checkBooking = true
                        }
                    })
                }
                if (
                    moment().valueOf() <
                        formatTimestamp2(
                            getTimestampInWeekToLocal(record.regular_start_time)
                        ).valueOf() &&
                    checkPermission(PERMISSIONS.csmrcs_create_booking) &&
                    checkBooking
                ) {
                    return (
                        <Button
                            type='primary'
                            onClick={() => {
                                setSelectedCalendar(record)
                                toggleModalBooking2(true)
                            }}
                        >
                            Create Booking
                        </Button>
                    )
                }
                return <></>
            }
        }
    ]
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        // Can not select days before today and today
        return (
            current &&
            (current < moment().startOf('day') ||
                current >
                    moment().endOf('day').add({
                        day: 2
                    }))
        )
    }
    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                objectSearch: {
                    ...values.objectSearch,
                    fromDate: value[0],
                    toDate: value[1]
                },
                page_number: 1
            })
        }
    }

    return (
        <Card title='Regular Calendar Status'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Student:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='student_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                showSearch
                                                placeholder='By name , username'
                                                defaultValue=''
                                                allowClear
                                                filterOption={false}
                                                loading={
                                                    values.isLoadingSearchStudent
                                                }
                                                onPopupScroll={loadMore(
                                                    'student'
                                                )}
                                                onSearch={_.debounce(
                                                    onSearchStudent('student'),
                                                    500
                                                )}
                                            >
                                                {renderSelect('students')}
                                                {values.isLoadingSearchStudent && (
                                                    <Option
                                                        key='loading'
                                                        value=''
                                                    >
                                                        <Spin size='small' />
                                                    </Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            {/* <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Teacher:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            className='mb-0 w-100'
                                            name='teacher'
                                        >
                                            <Select placeholder='Choose teacher'>
                                                {renderSelect('teachers')}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col> */}
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Supporter:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='staff_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                {values.listAdmin.map(
                                                    (item, index) => (
                                                        <Option
                                                            key={`staff_id${index}`}
                                                            value={item.value}
                                                        >
                                                            {_.capitalize(
                                                                item.label
                                                            )}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Status:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value='1'>
                                                    Success
                                                </Option>
                                                <Option value='0'>
                                                    Failed
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Range Date:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='rangeDate'
                                            className='mb-0 w-100'
                                        >
                                            <RangePicker
                                                allowClear={false}
                                                defaultValue={[
                                                    values.objectSearch
                                                        .fromDate,
                                                    values.objectSearch.toDate
                                                ]}
                                                style={{ width: '100%' }}
                                                disabledDate={disabledDate}
                                                clearIcon={false}
                                                onChange={handleChangeDate}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Schedule message:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='messageSchedule'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                showSearch
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                {errorMessage.map(
                                                    (e, index) => {
                                                        return (
                                                            <Option
                                                                value={e}
                                                                key={index}
                                                            >
                                                                {e}
                                                            </Option>
                                                        )
                                                    }
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            {/* <Col>
                                <Button
                                    type='primary'
                                    danger
                                    onClick={() => onReset()}
                                >
                                    Reset
                                </Button>
                            </Col> */}
                            <Col>
                                <Button type='primary' htmlType='submit'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>

            <Table
                columns={columns}
                dataSource={values.data}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                scroll={{
                    x: 500,
                    y: 400
                }}
                loading={values.isLoading}
                sticky
                rowKey={(record: any) => record._id}
            />
            <CreateBookingModel
                reload={reload}
                toggleModal={toggleModalBooking}
                visible={isShownModalBooking}
                data={selectedCalendar}
            />
            <CreateBookingModel2
                reload={reload}
                toggleModal={toggleModalBooking2}
                visible={isShownModalBooking2}
                data={selectedCalendar}
            />
        </Card>
    )
}

export default UserReport
