/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback, useReducer } from 'react'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    DatePicker,
    Popover,
    Select,
    Tag,
    Collapse,
    Checkbox,
    Form,
    Button,
    Input,
    Spin,
    Tooltip,
    Popconfirm
} from 'antd'
import _ from 'lodash'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import UserAPI from 'api/UserAPI'
import { EditFilled, SkypeOutlined } from '@ant-design/icons'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import sanitizeHtml from 'sanitize-html'
import { EnumAction } from 'const/enum'
import { DEPARTMENT } from 'const/department'
import { blue } from '@ant-design/colors'
import { IBooking } from 'types'
import './index.scss'
import {
    exportReportToXlsx,
    exportToLessonStatisticsExcel
} from 'utils/export-xlsx'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import SearchUser from 'components/search-user-with-lazy-load'
import StudentAPI from 'api/StudentAPI'
import { notify } from 'utils/notify'
import { Link } from 'react-router-dom'
import {
    EnumRecommendSection,
    EnumRecommendStatus,
    EnumClassify,
    EnumLevel,
    EnumReportType
} from 'const/reports'
import OrderAPI from 'api/OrderAPI'
import { ENUM_BOOKING_STATUS, EnumOrderType } from 'const'
import BookingAPI from 'api/BookingAPI'
import NameTeacherStudent from 'components/name-teacher-student'
import PackageAPI from 'api/PackageAPI'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Option } = Select
const { Panel } = Collapse
const queryUrl = new URLSearchParams(window.location.search)

const LessonStatistics = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isLoadingStatistic: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            bookings: [],
            students: [],
            studentPackages: [],
            student_id: '',
            ordered_package_choose: null,
            ordered_package_id: '',
            statistic: {
                total: 0,
                completed: 0,
                student_absent: 0,
                upcoming: 0,
                teaching: 0,
                teacher_confirm: 0,
                change_time: 0,
                cancel_by_student: 0,
                cancel_by_teacher: 0,
                teacher_absent: 0
            },
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                package: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            }
        }
    )

    const [loadingExport, setLoadingExport] = useState(false)
    const [isShowPublish, setShowPublish] = useState(false)
    const [loadingSendHistoryToStudent, setLoadingSendHistoryToStudent] =
        useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [form] = Form.useForm()
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

    const getBooking = async ({
        page_size,
        page_number,
        student_id,
        ordered_package_id,
        type
    }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            student_id,
            ordered_package_id
        }
        await BookingAPI.getAllBookings(searchData)
            .then(async (res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setValues({ total: res.pagination.total })
                }
                setValues({ bookings: res.data, isLoadingStatistic: true })
                if (type === 'all') {
                    let completed_statistics = 0
                    let student_absent_statistics = 0
                    let upcoming_statistics = 0
                    let teaching_statistics = 0
                    let teacher_confirm_statistics = 0
                    let change_time_statistics = 0
                    let cancel_by_student_statistics = 0
                    let cancel_by_teacher_statistics = 0
                    let teacher_absent_statistics = 0
                    await res.data.map((value: any) => {
                        switch (value.status) {
                            case ENUM_BOOKING_STATUS.COMPLETED:
                                return completed_statistics++
                                break
                            case ENUM_BOOKING_STATUS.STUDENT_ABSENT:
                                return student_absent_statistics++
                                break
                            case ENUM_BOOKING_STATUS.UPCOMING:
                                return upcoming_statistics++
                                break
                            case ENUM_BOOKING_STATUS.TEACHING:
                                return teaching_statistics++
                                break
                            case ENUM_BOOKING_STATUS.TEACHER_CONFIRM:
                                return teacher_confirm_statistics++
                                break
                            case ENUM_BOOKING_STATUS.CHANGE_TIME:
                                return change_time_statistics++
                                break
                            case ENUM_BOOKING_STATUS.CANCEL_BY_STUDENT:
                                return cancel_by_student_statistics++
                                break
                            case ENUM_BOOKING_STATUS.CANCEL_BY_TEACHER:
                                return cancel_by_teacher_statistics++
                                break
                            case ENUM_BOOKING_STATUS.TEACHER_ABSENT:
                                return teacher_absent_statistics++
                                break
                            default:
                                return null
                                break
                        }
                    })
                    setValues({
                        statistic: {
                            total: res.data.length,
                            completed: completed_statistics,
                            student_absent: student_absent_statistics,
                            upcoming: upcoming_statistics,
                            teaching: teaching_statistics,
                            teacher_confirm: teacher_confirm_statistics,
                            change_time: change_time_statistics,
                            cancel_by_student: cancel_by_student_statistics,
                            cancel_by_teacher: cancel_by_teacher_statistics,
                            teacher_absent: teacher_absent_statistics
                        },
                        isLoadingStatistic: false
                    })
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() =>
                setValues({ isLoading: false, isLoadingStatistic: false })
            )
    }

    const refetchData = useCallback(() => {
        getBooking({
            page_number: 1,
            page_size: values.page_size,
            student_id: values.student_id,
            ordered_package_id: values.ordered_package_id,
            type: 'normal'
        })
    }, [values])

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getBooking({
            page_number,
            page_size,
            student_id: values.student_id,
            ordered_package_id: values.ordered_package_id,
            type: 'normal'
        })
    }

    const toggleModal = useCallback(
        (value) => {
            setValues({
                isShownModal: value
            })
        },
        [values]
    )

    const sendHistoryToStudent = async (type: any) => {
        setLoadingSendHistoryToStudent(true)
        let flagShow = false
        if (type === 'publish') {
            flagShow = true
        }
        await PackageAPI.editOrderedPackages(values.ordered_package_id, {
            flag_show_history: flagShow
        })
            .then((res) => {
                notify('success', 'Update successfully')
                if (type === 'publish') {
                    setShowPublish(false)
                } else {
                    setShowPublish(true)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoadingSendHistoryToStudent(false))
    }

    const getAllStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
            setValues({ isSearching: true })
            StudentAPI.getStudentsOfSupported({
                status: 'active',
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    filter.student.total = res.pagination.total
                    if (res?.data && res?.data?.length > 0) {
                        let newStudents = [...res.data]
                        if (query.page_number > 1) {
                            newStudents = [...students, ...res.data]
                        }
                        setValues({
                            students: newStudents,
                            filter
                        })
                    } else {
                        setValues({
                            students: res.data,
                            filter
                        })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isSearching: false }))
        },
        [values]
    )

    const getOrderedPackagesByStudentId = useCallback(
        (query: {
            student_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, studentPackages } = values
            setValues({ isLoading: true })
            OrderAPI.getAllOrderedPackagesByUserId(query.student_id, {
                ...query
            })
                .then((res) => {
                    filter.package.total = res.pagination.total
                    let newPackages = [...res.data]
                    if (query.page_number > 1) {
                        newPackages = [...studentPackages, ...res.data]
                    }
                    setValues({
                        studentPackages: newPackages,
                        filter
                    })
                    // if (_.isEmpty(res.data))
                    //     notification.error({
                    //         message: 'Error',
                    //         description:
                    //             "Student has no package active. Can't create anything"
                    //     })
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

    const onChangeOrderedPackage = useCallback(
        async (changedValues, type?: any) => {
            if (_.isEmpty(changedValues) && changedValues) {
                PackageAPI.getOrderedPackageById(changedValues, {})
                    .then((res) => {
                        setValues({
                            ...values,
                            ordered_package_id: changedValues,
                            ordered_package_choose: res
                        })
                        if (type === 'url_search') {
                            if (res?.is_show_history) {
                                setShowPublish(false)
                            } else {
                                setShowPublish(true)
                            }
                        }
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
                    .finally()
            }
        },
        [form, values]
    )

    useEffect(() => {
        getAllStudents({
            page_number: values.filter.student.page_number,
            page_size: values.page_size
        })
        if (queryUrl.get('student_id') && queryUrl.get('op_id')) {
            onChangeOrderedPackage(queryUrl.get('op_id'), 'url_search')
            getBooking({
                page_number: 1,
                page_size: values.page_size,
                student_id: queryUrl.get('student_id'),
                ordered_package_id: queryUrl.get('op_id'),
                type: 'normal'
            })
            getBooking({
                page_number: 1,
                page_size: 10000,
                student_id: queryUrl.get('student_id'),
                ordered_package_id: queryUrl.get('op_id'),
                type: 'all'
            })
        }
    }, [])

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
                switch (key) {
                    case 'student':
                        getAllStudents({
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'package':
                        getOrderedPackagesByStudentId({
                            student_id: values.getFieldValue('student_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    default:
                        break
                }
            }
        }
    }

    const onSearchFilter = (key) => (value: string) => {
        const { filter, page_size } = values

        filter[key].search = value

        switch (key) {
            case 'student':
                filter[key].page_number = 1
                getAllStudents({
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'package':
                filter[key].page_number = 1
                getOrderedPackagesByStudentId({
                    student_id: form.getFieldValue('student_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            default:
                break
        }
        setValues({ filter })
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                if (key === 'students') {
                    return (
                        <Option key={index} value={item.id}>
                            {item && `${item?.full_name} - ${item?.username}`}
                        </Option>
                    )
                }
                return (
                    <Option key={index} value={item.id}>
                        {`${item?.id} - ${item?.package_name}` ||
                            `${item?.id} - ${item?.name}` ||
                            `${item?.full_name} - ${item?.username}`}
                    </Option>
                )
            })
        }
    }

    const showStatistic = () => {
        if (values.isLoadingStatistic) {
            return <Spin spinning={values.isLoadingStatistic} />
        }

        if (values.bookings.length > 0) {
            return (
                <>
                    <Row className='statistic'>
                        <Col xs={24} sm={12} md={12} lg={12} xl={5}>
                            <p>Tổng số lớp: {values.statistic.total}</p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={5} />
                    </Row>
                    <Row className='statistic'>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                COMPLETED: {values.statistic.completed}
                            </p>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                TEACHING: {values.statistic.teaching}
                            </p>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                CANCEL BY STUDENT:{' '}
                                {values.statistic.cancel_by_student}
                            </p>
                        </Col>
                    </Row>
                    <Row className='statistic'>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                STUDENT ABSENT:{' '}
                                {values.statistic.student_absent}
                            </p>
                        </Col>

                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                TEACHER CONFIRM:{' '}
                                {values.statistic.teacher_confirm}
                            </p>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                CANCEL BY TEACHER:{' '}
                                {values.statistic.cancel_by_teacher}
                            </p>
                        </Col>
                    </Row>
                    <Row className='statistic'>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                UPCOMING: {values.statistic.upcoming}
                            </p>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                CHANGE TIME: {values.statistic.change_time}
                            </p>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={5}>
                            <p className='cancel'>
                                TEACHER ABSENT:{' '}
                                {values.statistic.teacher_absent}
                            </p>
                        </Col>
                    </Row>
                </>
            )
        }

        return <></>
    }

    const onChangeStudent = useCallback(
        (changedValues) => {
            if (_.isEmpty(changedValues)) {
                getOrderedPackagesByStudentId({
                    student_id: changedValues,
                    page_number: 1,
                    page_size: values.page_size
                })
                form.resetFields()
                setValues({
                    ...values,
                    ordered_package_id: '',
                    student_id: changedValues
                })
                form.setFieldsValue({
                    ordered_package_id: '',
                    student_id: changedValues
                })
            }
        },
        [form, values]
    )

    const onClickUpdateData = (record) => {
        toggleModal(true)
        setSelectedReport(record)
    }

    const exportCustomer = async (e) => {
        e.preventDefault()
        if (values.isLoading || loadingExport) {
            notification.error({
                message: 'Error',
                description: 'No data'
            })
            return
        }

        setLoadingExport(true)
        try {
            const filter = {
                page_size: values.total,
                page_number: 1,
                status: [
                    ENUM_BOOKING_STATUS.COMPLETED,
                    ENUM_BOOKING_STATUS.UPCOMING,
                    ENUM_BOOKING_STATUS.STUDENT_ABSENT
                ],
                student_id: values.student_id,
                ordered_package_id: values.ordered_package_id
            }
            const response = await BookingAPI.getAllBookings(filter)
            if (!response || response?.data.length === 0) {
                setLoadingExport(false)

                notification.error({
                    message: 'Error',
                    description: 'No data'
                })
                setLoadingExport(false)
                return
            }
            let fileName = 'thong_ke_so_buoi_hoc'
            let studentMain = null
            let countBookingCompleted = 0
            let countBookingUpcoming = 0
            let countBookingStudentAbsent = 0
            const dataCol = response.data.map((booking: any, index: number) => {
                if (index === 0 && booking?.student?.username) {
                    const currentTimeStamp = Date.now()
                    studentMain = booking?.student
                    fileName = `${booking?.student?.username}_thong_ke_so_buoi_hoc_${currentTimeStamp}`
                }
                if (booking?.status === ENUM_BOOKING_STATUS.COMPLETED) {
                    countBookingCompleted++
                } else if (booking?.status === ENUM_BOOKING_STATUS.UPCOMING) {
                    countBookingUpcoming++
                } else if (
                    booking?.status === ENUM_BOOKING_STATUS.STUDENT_ABSENT
                ) {
                    countBookingStudentAbsent++
                }
                const temp = []
                temp.push(index + 1)
                temp.push(
                    moment(booking.calendar.start_time).format(
                        'DD/MM/YYYY HH:mm '
                    )
                )
                temp.push(`${booking?.teacher?.full_name}`)
                temp.push(ENUM_BOOKING_STATUS[booking.status])
                return temp
            })
            const dataStatistics = []
            dataStatistics[0] = ['', 'THỐNG KÊ SỐ BUỔI HỌC', '']
            dataStatistics[1] = ['']
            dataStatistics[2] = ['Học viên: ', studentMain?.full_name]
            dataStatistics[3] = ['Username: ', studentMain?.username]
            dataStatistics[4] = ['Email: ', studentMain?.email]
            dataStatistics[5] = [
                'Gói học: ',
                values.ordered_package_choose?.package_name
            ]
            dataStatistics[6] = ['']
            dataStatistics[7] = ['Tổng số buổi học', '', response.data?.length]
            dataStatistics[8] = [
                'Số buổi học đã hoàn thành:',
                'COMPLETED',
                countBookingCompleted
            ]
            dataStatistics[9] = [
                'Số buổi học viên vắng:',
                'STUDENT ABSENT',
                countBookingStudentAbsent
            ]
            dataStatistics[10] = [
                'Số buổi chưa học:',
                'UPCOMING',
                countBookingUpcoming
            ]
            dataStatistics[11] = [
                'Số buổi học còn lại:',
                '',
                values.ordered_package_choose?.number_class
            ]
            dataStatistics[12] = ['']
            dataStatistics[13] = ['']
            const cols = ['No', 'Start Time', 'Teacher', 'Status']
            exportToLessonStatisticsExcel(
                fileName,
                dataStatistics,
                cols,
                dataCol
            )
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setLoadingExport(false)
    }

    const columns: any = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'stt',
            fixed: 'left',
            align: 'center',
            width: 70,
            render: (text, record, index) =>
                values.page_size * (values.page_number - 1) + index + 1
        },
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            render: (text, record) => (
                <Link to={`/teaching/overview/?id=${text}`} target='_blank'>
                    {text}
                </Link>
            )
        },
        {
            title: 'Time',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <>
                    <p>
                        {text &&
                            moment(text.start_time).format('HH:mm DD/MM/YYYY')}
                    </p>
                    {/* {record?.ordered_package?.type ===
                    EnumPackageOrderType.TRIAL ? (
                        <Tag color='#87d068'>TRIAL</Tag>
                    ) : record?.is_regular_booking ? (
                        <Tag color='#f50'>REGULAR</Tag>
                    ) : (
                        <Tag color='#108ee9'>FLEXIBLE</Tag>
                    )} */}
                </>
            )
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Teacher:</b>
                            <Link
                                to={`/teachers/all?search=${text?.username}`}
                                target='_blank'
                            >
                                {text && `${text.full_name} - ${text.username}`}
                            </Link>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>{text?.skype_account}</span>
                            <br />
                        </>
                    }
                >
                    <div>
                        <p className='mb-2'>
                            <b>Teacher:</b>{' '}
                            <Link
                                to={`/teachers/all?search=${text?.username}`}
                                target='_blank'
                            >
                                {text && `${text.full_name} - ${text.username}`}
                            </Link>
                        </p>
                    </div>
                </Popover>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <>
                    <p>
                        <b> Package Name({record?.ordered_package_id}): </b>
                        {record && record?.ordered_package?.package_name}
                    </p>
                    <p>
                        <b>Course({record?.course_id}): </b> {text && text.name}
                    </p>
                    {record.unit_id !== -1 && (
                        <p>
                            <b>
                                Unit({record?.unit_id})
                                {record?.admin_unit_lock && '(Locked)'}:
                            </b>{' '}
                            {record.unit && record.unit.name}
                        </p>
                    )}
                    <p className='text-truncate'>
                        <b>Audio: </b>
                        {record && !Array.isArray(record?.unit?.audio) && (
                            <a
                                className='text-primary'
                                target='_blank'
                                rel='noreferrer'
                                href={record.unit?.audio}
                            >
                                {record.unit?.audio}
                            </a>
                        )}
                        {record &&
                            Array.isArray(record?.unit?.audio) &&
                            record?.unit?.audio?.length === 1 && (
                                <a
                                    className='text-primary'
                                    target='_blank'
                                    rel='noreferrer'
                                    href={record.unit?.audio[0]}
                                >
                                    {record.unit?.audio[0]}
                                </a>
                            )}
                        {record &&
                            Array.isArray(record?.unit?.audio) &&
                            record?.unit?.audio?.length > 1 && (
                                <Popover
                                    // eslint-disable-next-line func-names
                                    content={record?.unit?.audio.map(
                                        // eslint-disable-next-line array-callback-return
                                        (value, index) => {
                                            return (
                                                <>
                                                    <a
                                                        className='text-primary'
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        href={value}
                                                    >
                                                        Audio {index}: {value}
                                                    </a>
                                                    <br></br>
                                                </>
                                            )
                                        }
                                    )}
                                >
                                    <a className='text-primary'>View</a>
                                </Popover>
                            )}
                    </p>

                    <p className='text-truncate'>
                        <b>Student document: </b>
                        <a
                            className='text-primary'
                            target='_blank'
                            rel='noreferrer'
                            href={record && record.unit?.student_document}
                        >
                            {record && record.unit?.student_document}
                        </a>
                    </p>
                    <p className='text-truncate'>
                        <b>Teacher document: </b>
                        <a
                            className='text-primary '
                            target='_blank'
                            rel='noreferrer'
                            href={record && record.unit?.teacher_document}
                        >
                            {record && record.unit?.teacher_document}
                        </a>
                    </p>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 180,
            render: (text, record) => (
                <Tag color={colorStatus(text)}>{ENUM_BOOKING_STATUS[text]}</Tag>
            )
        }
    ]

    const onSearch = (valuesForm) => {
        setValues({
            student_id: valuesForm.student_id,
            ordered_package_id: valuesForm.ordered_package_id,
            page_number: 1
        })
        if (values.ordered_package_choose?.is_show_history) {
            setShowPublish(false)
        } else {
            setShowPublish(true)
        }
        getBooking({
            page_number: 1,
            page_size: values.page_size,
            student_id: valuesForm.student_id,
            ordered_package_id: valuesForm.ordered_package_id,
            type: 'normal'
        })
        getBooking({
            page_number: 1,
            page_size: 10000,
            student_id: valuesForm.student_id,
            ordered_package_id: valuesForm.ordered_package_id,
            type: 'all'
        })
    }

    return (
        <Card title='Lesson Statistics'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 24 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={32}>
                            <Col className='mt-1' span={3}>
                                Student
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={16}
                            >
                                <Row className='d-flex align-items-center'>
                                    <Form.Item
                                        name='student_id'
                                        className='mb-0 w-100'
                                    >
                                        <Select
                                            placeholder='Choose student'
                                            className='filter-lesson-statistics'
                                            // style={{ width: '100%' }}
                                            showSearch
                                            filterOption={false}
                                            loading={values.isLoading}
                                            onPopupScroll={loadMore('student')}
                                            onSearch={_.debounce(
                                                onSearchFilter('student'),
                                                300
                                            )}
                                            onChange={onChangeStudent}
                                        >
                                            {renderSelect('students')}
                                            {values.isLoading && (
                                                <Option key='loading' value=''>
                                                    <Spin size='small' />
                                                </Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Row>
                            </Col>
                            <Col
                                span={3}
                                className='desktop-button-view-all justify-content-end'
                            >
                                <Button type='primary' htmlType='submit'>
                                    View all lesson
                                </Button>
                            </Col>
                        </Row>
                        <Row className='mb-4 justify-content-start' gutter={32}>
                            <Col className='mt-1' span={3}>
                                Package
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={16}
                            >
                                <Row className='d-flex align-items-center'>
                                    <Form.Item
                                        name='ordered_package_id'
                                        className='mb-0 w-100'
                                    >
                                        <Select
                                            placeholder='Choose package'
                                            showSearch
                                            className='filter-lesson-statistics'
                                            // style={{ width: '100%' }}
                                            filterOption={false}
                                            // defaultValue={
                                            //     values.ordered_package_id
                                            // }
                                            loading={values.isLoading}
                                            onPopupScroll={loadMore('package')}
                                            onChange={onChangeOrderedPackage}
                                            onSearch={_.debounce(
                                                onSearchFilter('package'),
                                                300
                                            )}
                                        >
                                            {values.studentPackages?.length >
                                                0 && (
                                                <Option key='all' value=''>
                                                    ALL
                                                </Option>
                                            )}
                                            {renderSelect('studentPackages')}
                                            {/* {values.isLoading && (
                                                <Option key='loading' value=''>
                                                    <Spin size='small' />
                                                </Option>
                                            )} */}
                                        </Select>
                                    </Form.Item>
                                </Row>
                            </Col>
                        </Row>
                        <Row
                            className='justify-content-end mobile-button-view-all'
                            gutter={10}
                        >
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
                                    View all lesson
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>
            <Row className='mb-2'>
                <Col span={24} className='d-flex justify-content-end'>
                    {!isShowPublish &&
                        values?.total > 0 &&
                        values.ordered_package_id && (
                            <Popconfirm
                                placement='top'
                                title='Are you sure want to private history?'
                                onConfirm={() =>
                                    sendHistoryToStudent('private')
                                }
                                okText='Ok'
                                cancelText='Cancel'
                            >
                                <Button
                                    style={{
                                        background: '#7D9195',
                                        color: 'white'
                                    }}
                                    className='mr-4'
                                    disabled={loadingSendHistoryToStudent}
                                    loading={loadingSendHistoryToStudent}
                                >
                                    Private
                                </Button>
                            </Popconfirm>
                        )}

                    {isShowPublish &&
                        values?.total > 0 &&
                        values.ordered_package_id && (
                            <Popconfirm
                                placement='top'
                                title='Are you sure want to public history?'
                                onConfirm={() =>
                                    sendHistoryToStudent('publish')
                                }
                                okText='Ok'
                                cancelText='Cancel'
                            >
                                <Button
                                    style={{
                                        background: '#08BF5A',
                                        color: 'white'
                                    }}
                                    className='mr-4'
                                    disabled={loadingSendHistoryToStudent}
                                    loading={loadingSendHistoryToStudent}
                                >
                                    Publish
                                </Button>
                            </Popconfirm>
                        )}

                    {values?.total > 0 &&
                        values.statistic.completed +
                            values.statistic.upcoming +
                            values.statistic.student_absent >
                            0 &&
                        checkPermission(PERMISSIONS.csmls_export_excel) && (
                            <Button
                                onClick={exportCustomer}
                                disabled={loadingExport}
                                className='mr-2'
                            >
                                <Spin
                                    size='small'
                                    className='mr-2'
                                    spinning={loadingExport}
                                />
                                Export Excel
                            </Button>
                        )}
                </Col>
            </Row>
            {queryUrl.get('student_name') && (
                <div>Student: {queryUrl.get('student_name')}</div>
            )}
            {showStatistic()}
            <Table
                columns={columns}
                dataSource={values.bookings}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                scroll={{
                    x: 500,
                    y: 750
                }}
                loading={values.isLoading}
                bordered
                sticky
                rowKey={(record: any) => record.id}
            />
        </Card>
    )
}

export default LessonStatistics
