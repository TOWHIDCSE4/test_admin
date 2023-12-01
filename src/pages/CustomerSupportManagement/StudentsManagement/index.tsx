import React, { useCallback, useEffect, useReducer, useState } from 'react'
import CustomerSupportManagementAPI from 'api/CustomerSupportManagementAPI'
import moment from 'moment'
import './index.scss'
import {
    Table,
    Card,
    Popover,
    Input,
    notification,
    Row,
    Col,
    Select,
    Tag,
    Tooltip,
    Button,
    Form,
    Collapse,
    Checkbox,
    Spin
} from 'antd'

import { blue } from '@ant-design/colors'
import { EditFilled } from '@ant-design/icons'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { IStudent, EnumUserStatus, EnumRegularCalendarStatus } from 'types'
import { toReadablePrice } from 'utils'
import {
    GENDER,
    ORDER_STATUS,
    POINT_VND_RATE,
    CUSTOMER_TYPE,
    EnumRecommendSection2,
    EnumRecommendStatus2,
    EnumReportType2,
    EnumScheduledMemoType,
    ENUM_BOOKING_STATUS
} from 'const'
import { DEPARTMENT } from 'const/department'
import { TYPE as TYPE_PACKAGE } from 'const/package'
import { EnumAction, EnumRole } from 'const/enum'
import { exportCustomerToXlsx } from 'utils/export-xlsx'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentLevelAPI from 'api/StudentLevelAPI'
import StudentModal from './modals/StudentModal'
import NameTeacherStudent from 'components/name-teacher-student'
import { useAuth } from 'contexts/Authenticate'

const { Option } = Select
const { Search } = Input
const { Panel } = Collapse
const queryUrl = new URLSearchParams(window.location.search)

const StudentsManagement = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [form] = Form.useForm()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            students: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            selectedStudent: null,
            staffs: [],
            studentLevels: [],
            objectSearch: {
                name: '',
                search: queryUrl.get('student_name') || '',
                status: EnumUserStatus.ACTIVE,
                staff_id: '',
                // checking_call: '',
                // greeting_call: '',
                // scheduled: '',
                type: '',
                customer_type: '',
                auto_scheduled: '',
                orderedPackageType: '',
                verified_email: '',
                notification_email: ''
            },
            hiddenColumns: {
                supporter: false,
                orderedPackages: false,
                regular_times: false,
                scheduled_memos: false,
                customer_care: false,
                reports: false,
                referred_by: true
            }
        }
    )
    const [loadingExport, setLoadingExport] = useState(false)
    const [loadingExportStudentList, setloadingExportStudentList] =
        useState(false)
    const { user } = useAuth()

    const getStudents = ({ page_size, page_number, objectSearch }) => {
        setValues({ isLoading: true, students: [] })
        const searchData = {
            page_size,
            page_number,
            ...objectSearch
        }
        if (!searchData.status) {
            searchData.status = EnumUserStatus.ACTIVE
        }
        CustomerSupportManagementAPI.getStudents(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ students: res.data, total })
            })
            .catch((err) => {
                console.log(err)
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const fetchAdminOptions = async (search, idDepartment) => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment,
                leader: user.id
            })
            const dataStaffs = res.data.map((i) => ({
                label: `${i.fullname} - ${i.username}`,
                value: i.id,
                _id: i._id,
                username: i.username,
                fullname: i.fullname,
                phoneNumber: i.phoneNumber
            }))

            setValues({ staffs: dataStaffs })
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }

    const getStudentLevels = ({ page_size = 10, page_number = 1 }) => {
        StudentLevelAPI.getStudentLevels({ page_size, page_number })
            .then((res) => {
                setValues({ studentLevels: res.data })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const exportCustomer = async (type: any) => {
        if (type === 'only_student') {
            setloadingExportStudentList(true)
        } else {
            setLoadingExport(true)
        }
        try {
            const searchData = {
                ...values.objectSearch
            }
            if (!searchData.status) {
                searchData.status = EnumUserStatus.ACTIVE
            }
            searchData.type_export = type
            const data = await CustomerSupportManagementAPI.export(searchData)
            if (data.data) {
                await exportCustomerToXlsx(
                    `customer_${moment().format('DD_MM_YYYY')}`,
                    data.data,
                    type
                )
            }
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setloadingExportStudentList(false)
        setLoadingExport(false)
    }

    const toggleModal = (value) => {
        setValues({
            isShownModal: value
        })
    }

    const onClickUpdateData = async (item: any) => {
        const data = JSON.parse(JSON.stringify(item))
        toggleModal(true)
        if (!data?.cs_info?.customer_care) {
            data.cs_info = {
                ...data.cs_info,
                customer_care: [
                    {
                        customer_type: '',
                        date: Date.now(),
                        parent_opinion: '',
                        teacher_feedback: '',
                        type: '',
                        video_feedback: '',
                        note: '',
                        input_level: '',
                        output_level: ''
                    }
                ]
            }
        } else {
            const monthDiff = (d1, d2) => {
                let months
                months = (d2.getFullYear() - d1.getFullYear()) * 12
                months -= d1.getMonth()
                months += d2.getMonth()
                return months <= 0 ? 0 : months
            }
            const lastList =
                data.cs_info.customer_care[
                    data.cs_info.customer_care.length - 1
                ]
            const now = new Date(Date.now())
            const lastListDate = new Date(lastList.date)
            const diff = monthDiff(lastListDate, now)
            if (diff > 0) {
                const date = new Date(lastList.date)
                for (let index = 0; index < diff; index++) {
                    date.setMonth(date.getMonth() + 1)
                    data.cs_info.customer_care.push({
                        customer_type: '',
                        date: date.getTime(),
                        parent_opinion: '',
                        teacher_feedback: '',
                        type: '',
                        input_level: '',
                        output_level: '',
                        video_feedback: '',
                        note: ''
                    })
                }
            }
        }
        setValues({ selectedStudent: data })
    }

    const updateData = ({ dataPost, staff }) => {
        try {
            const students = JSON.parse(JSON.stringify(values.students))
            const index = students.findIndex((e) => e.id === dataPost.user_id)
            if (index !== -1) {
                if (
                    dataPost.supporter.staff_id !==
                    students[index].student.staff_id
                ) {
                    students[index].student.staff_id = staff.value
                    students[index].student.staff.fullname = staff.fullname
                    students[index].student.staff.username = staff.username
                    students[index].student.staff.phoneNumber =
                        staff.phoneNumber
                    students[index].student.staff.id = staff.value
                }
                students[index].cs_info = JSON.parse(JSON.stringify(dataPost))
                setValues({ students })
            }
        } catch (error) {
            getStudents({
                page_number: values.page_number,
                page_size: values.page_size,
                objectSearch: values.objectSearch
            })
        }
    }

    useEffect(() => {
        if (queryUrl.get('student_name')) {
            form.setFieldValue('search', queryUrl.get('student_name'))
        }
        fetchAdminOptions('', DEPARTMENT.phongcskh.id)
        getStudents({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: values.objectSearch
        })
        getStudentLevels({ page_size: 9999, page_number: 1 })
    }, [])

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getStudents({
            objectSearch: values.objectSearch,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1,
            objectSearch: val
        })
        getStudents({
            page_size: values.page_size,
            page_number: 1,
            objectSearch: val
        })
    }
    const onReset = () => {
        form.resetFields()
        const objectSearch = {
            search: '',
            status: EnumUserStatus.ACTIVE,
            staff_id: '',
            checking_call: '',
            greeting_call: '',
            scheduled: '',
            type: '',
            customer_type: '',
            auto_scheduled: '',
            orderedPackageType: '',
            verified_email: '',
            notification_email: ''
        }
        setValues({
            objectSearch,
            page_number: 1
        })
        getStudents({
            page_size: values.page_size,
            page_number: 1,
            objectSearch
        })
    }

    const renderOrderedPackage = (item: any, index: any = -1) =>
        item ? (
            <ul key={`package${index}`} className='list-unstyled'>
                <li>
                    <b>ID: </b>
                    {item.id}
                </li>
                <li>
                    <b>Order Id: </b>
                    {item.order_id}
                </li>
                <li>
                    <b>Type: </b>
                    {item.type === 1 ? (
                        <Tag color='#108ee9'>STANDARD</Tag>
                    ) : item.type === 2 ? (
                        <Tag color='#f50'>PREMIUM</Tag>
                    ) : (
                        <Tag color='#87d068'>TRIAL</Tag>
                    )}
                </li>
                <li>
                    <b>Package: </b>
                    {item.package_name}
                </li>
                <li>
                    <b>Activation date: </b>
                    {`${
                        item.activation_date
                            ? moment(new Date(item?.activation_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Expired date: </b>
                    {`${
                        item.expired_date
                            ? moment(new Date(item?.expired_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Used: </b>
                    {item.original_number_class - item.number_class}/
                    {item.original_number_class}
                </li>
                <li>
                    <b>Booking support: </b>
                    {item?.package?.is_support ? (
                        <Tag color='success'>Support</Tag>
                    ) : (
                        <Tag color='error'>Not support</Tag>
                    )}
                </li>
                <li>
                    <b>Apply for teacher: </b>
                    {item?.package?.location?.name
                        ? item?.package?.location?.name
                        : 'All teachers'}
                </li>
                <li>
                    <b>Status: </b>
                    {(() => {
                        if (
                            item.order &&
                            item.order?.status === ORDER_STATUS.PAID
                        ) {
                            if (
                                item?.expired_date &&
                                moment(item?.expired_date) < moment()
                            ) {
                                return <Tag color='error'>EXPIRED</Tag>
                            }
                            if (item.activation_date) {
                                return <Tag color='success'>ACTIVE</Tag>
                            }
                            return <Tag color='success'>INACTIVE</Tag>
                        }
                    })()}
                </li>
            </ul>
        ) : (
            ''
        )

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

    const renderRegularCalender = (item: any, index: any = -1) => {
        const convertToLocal = item?.regular_start_time
            ? getTimestampInWeekToLocal(item.regular_start_time)
            : null
        const formatTimeLocal = formatTimestamp(convertToLocal)

        const booking = item.bookingsInWeek?.find((e) => {
            const startTime = e.calendar.start_time
            const startTimeLocal = moment(startTime).format('dddd - HH:mm')
            return startTimeLocal === formatTimeLocal
        })
        return item ? (
            <ul key={`regular${index}`} className='list-unstyled '>
                <li>
                    <b>Time: </b>
                    <span className='mr-1'>{formatTimeLocal} </span>
                </li>
                <li>
                    <b>Course: </b>
                    {`${item?.course?.name}`}
                </li>
                <li>
                    <b>Teacher: </b>
                    <NameTeacherStudent
                        data={item?.teacher}
                        type='teacher'
                    ></NameTeacherStudent>
                </li>
                <li>
                    <b>Email: </b>
                    <a href={`mailto:${item?.teacher?.email}`}>
                        {' '}
                        {`${item?.teacher?.email}`}
                    </a>
                </li>
                <li>
                    <b>Phone: </b>
                    <a href={`tel:${item?.teacher?.phone_number}`}>
                        {' '}
                        {`${item?.teacher?.phone_number}`}
                    </a>
                </li>
                <li>
                    <b>Skype: </b>
                    {`${
                        item?.teacher?.skype_account
                            ? item?.teacher?.skype_account
                            : ''
                    }`}
                </li>
                <li>
                    <b>Booking Id: </b>
                    {booking && booking.id}
                </li>
                <li>
                    <div>
                        <ul>
                            <li>
                                <b>Status: </b>
                                {booking && (
                                    <Tag color={colorStatus(booking.status)}>
                                        {ENUM_BOOKING_STATUS[booking.status]}
                                    </Tag>
                                )}
                            </li>
                            <li>
                                <b>Unit: </b>
                                {booking && booking.unit?.name}
                            </li>
                            <li>
                                <b>Audio: </b>
                                {booking &&
                                    !Array.isArray(booking?.unit?.audio) && (
                                        <a
                                            className='clickable text-primary'
                                            target='_blank'
                                            rel='noreferrer'
                                            href={booking.unit?.audio}
                                        >
                                            {booking.unit?.audio}
                                        </a>
                                    )}
                                {booking &&
                                    Array.isArray(booking?.unit?.audio) &&
                                    booking?.unit?.audio?.length === 1 && (
                                        <a
                                            className='clickable text-primary'
                                            target='_blank'
                                            rel='noreferrer'
                                            href={booking.unit?.audio[0]}
                                        >
                                            {booking.unit?.audio[0]}
                                        </a>
                                    )}
                                {booking &&
                                    Array.isArray(booking?.unit?.audio) &&
                                    booking?.unit?.audio?.length > 1 && (
                                        <Popover
                                            content={
                                                <div>
                                                    {booking?.unit?.audio.map(
                                                        // eslint-disable-next-line @typescript-eslint/no-shadow
                                                        (value, index) => (
                                                            <div>
                                                                <a
                                                                    className='text-primary'
                                                                    target='_blank'
                                                                    rel='noreferrer'
                                                                    href={value}
                                                                >
                                                                    Audio{' '}
                                                                    {index}:{' '}
                                                                    {value}
                                                                </a>
                                                                <br></br>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            }
                                        >
                                            <Tag className='clickable text-primary'>
                                                View
                                            </Tag>
                                        </Popover>
                                    )}
                            </li>

                            <li>
                                <b>Student document: </b>
                                <a
                                    className='text-primary'
                                    target='_blank'
                                    rel='noreferrer'
                                    href={
                                        booking &&
                                        booking.unit?.student_document
                                    }
                                >
                                    {booking && booking.unit?.student_document}
                                </a>
                            </li>
                            <li>
                                <b>Teacher document: </b>
                                <a
                                    className='text-primary'
                                    target='_blank'
                                    rel='noreferrer'
                                    href={
                                        booking &&
                                        booking.unit?.teacher_document
                                    }
                                >
                                    {booking && booking.unit?.teacher_document}
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li>
                    <b>Admin note: </b>
                    {booking && booking.admin_note}
                </li>
                <li>
                    <b>Student note: </b>
                    {booking && booking.student_note}
                </li>
                <li>
                    <b>Note for Teacher: </b>
                    {booking && booking.teacher_note}
                </li>
            </ul>
        ) : (
            <></>
        )
    }
    const renderReports = (item: any, index: any = -1) => (
        <ul key={`report2${index}`} className='list-unstyled max-height'>
            {item.list &&
                item.list.map((e, i) => (
                    <li className='border mb-2 p-1' key={`report3${i}`}>
                        <p>
                            <b>Id report: </b>
                            {e.id}
                        </p>
                        <p>
                            <b>Created: </b>
                            {moment(e.created_time).format('HH:mm DD/MM/YYYY')}
                        </p>
                        <p>
                            <b>Recommend content: </b>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: e.recommend_content
                                }}
                            ></span>
                        </p>
                        <p>
                            <b>Report solution: </b>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: e.report_solution
                                }}
                            ></span>
                        </p>
                        <p>
                            <b>Report teacher feedback: </b>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: e.report_teacher_feedback
                                }}
                            ></span>
                        </p>
                        <p>
                            <b>Resolve user: </b>
                            {e.resolve_user_id}
                        </p>
                        <p>
                            <b>Type: </b>
                            <span
                                style={{
                                    color: e.type === 1 ? '#87d068' : '#ff4d4f'
                                }}
                            >
                                {EnumReportType2[e.type]}
                            </span>
                        </p>
                        <p>
                            <b>recommend_status: </b>
                            <span
                                style={{
                                    color:
                                        e.recommend_status === 3
                                            ? '#87d068'
                                            : '#ff4d4f'
                                }}
                            >
                                {EnumRecommendStatus2[e.recommend_status]}
                            </span>
                        </p>
                    </li>
                ))}
        </ul>
    )

    const renderCSTime = (item) => {
        const inputLevel = values.studentLevels?.find(
            (e) => e.id === item?.input_level
        )
        const outputLevel = values.studentLevels?.find(
            (e) => e.id === item?.output_level
        )
        return (
            <ul className='list-unstyled'>
                <li>
                    <b>Type: </b>
                    {item.type === 0
                        ? 'Call'
                        : item.type === 1
                        ? 'Message'
                        : ''}
                </li>
                <li>
                    <b>Input level: </b>
                    {inputLevel && inputLevel.name}
                </li>
                <li>
                    <b>Output level: </b>
                    {outputLevel && outputLevel.name}
                </li>
                <li>
                    <b>Parent's opinion: </b>
                    {item.parent_opinion}
                </li>
                <li>
                    <b>Teacher feedback: </b>
                    {item.teacher_feedback}
                </li>
                <li>
                    <b>Video feedback: </b>
                    {item.video_feedback}
                </li>
                <li>
                    <b>Note: </b>
                    {item.note}
                </li>
            </ul>
        )
    }
    const renderMemo = (item) => (
        <ul className='list-unstyled max-height max-width'>
            <li>
                <b>Name: </b>
                {item.course?.name || `${item.month} - ${item.year}`}
            </li>
            <li>
                <b>Attendance: </b>
                {`${item.attendance?.point} - ${
                    item.attendance?.comment || '...'
                }`}
            </li>
            <li>
                <b>Attitude: </b>
                {`${item.attitude?.point} - ${item.attitude?.comment || '...'}`}
            </li>
            <li>
                <b>Homework: </b>
                {`${item.homework?.point} - ${item.homework?.comment || '...'}`}
            </li>
            <li>
                <b>Class: </b>
                {`${item.completed_class} / ${item.registered_class}`}
            </li>
            <li>
                <b>Teacher: </b>
                <NameTeacherStudent
                    data={item?.teacher}
                    type='teacher'
                ></NameTeacherStudent>
            </li>
            <li>
                <b>Note for Teacher: </b>
                {`${item.teacher_note || '...'}`}
            </li>
        </ul>
    )
    const renderCustomerType = () => {
        const options = []
        // eslint-disable-next-line guard-for-in
        for (const property in CUSTOMER_TYPE) {
            const value = CUSTOMER_TYPE[property]
            options.push(
                <Option key={property} value={property}>
                    {value}
                </Option>
            )
        }
        return options
    }

    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState(null)
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }
    const hasSelected = selectedRowKeys.length > 0
    const updateStaff = () => {
        const data = {
            staff: selectedStaff,
            list_student: selectedRowKeys
        }
        console.log(data)
        setLoadingUpdate(true)
        CustomerSupportManagementAPI.updateStaffStudents(data)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Update successful'
                })
                setSelectedStaff(null)
                setSelectedRowKeys([])
                getStudents({ ...values })
            })
            .catch((err) => {
                console.log(err)
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => {
                setLoadingUpdate(false)
            })
    }

    const columns: any = [
        {
            title: 'STT',
            key: 'STT',
            width: 50,
            align: 'center',
            hidden: false,
            fixed: true,
            render: (text: any, record: any, index) =>
                index + (values.page_number - 1) * values.page_size + 1
        },
        {
            title: 'User Info',
            key: 'info',
            fixed: true,
            width: 250,
            hidden: false,
            render: (text: any, record: any) => (
                <div className='max-height'>
                    <p>
                        <b>Name: </b>
                        <NameTeacherStudent
                            data={text}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                    {text.skype_account ? (
                        <p>
                            <b>Skype: </b>
                            {`${text.skype_account}`}
                        </p>
                    ) : (
                        ''
                    )}
                    {text.email ? (
                        <p>
                            <b>Email: </b>
                            <a href={`mailto:${text.email}`}> {text.email}</a>
                        </p>
                    ) : (
                        ''
                    )}
                    {text.phone_number ? (
                        <p>
                            <b>Phone: </b>
                            <a href={`tel:${text.phone_number}`}>
                                {' '}
                                {text.phone_number}
                            </a>
                        </p>
                    ) : (
                        ''
                    )}
                    {text?.student?.student_level_id ? (
                        <p>
                            <b>Level: </b>
                            {`${
                                text?.student &&
                                values.studentLevels.find(
                                    (e) =>
                                        e.id === text?.student?.student_level_id
                                )?.name
                            }`}
                        </p>
                    ) : (
                        ''
                    )}
                    <p>
                        <b>Date of birth: </b>
                        {`${
                            text?.date_of_birth
                                ? moment(text?.date_of_birth).format(
                                      'DD/MM/YYYY'
                                  )
                                : ''
                        }`}
                    </p>
                    <p>
                        <b>Register At: </b>
                        {`${
                            text?.created_time
                                ? moment(text?.created_time).format(
                                      'DD/MM/YYYY'
                                  )
                                : ''
                        }`}
                    </p>
                    <p>
                        <b>Biography: </b>
                        {`${text?.intro}`}
                    </p>
                </div>
            )
        },
        {
            title: 'Supporter',
            dataIndex: 'supporter',
            key: 'supporter',
            width: 200,
            hidden: values.hiddenColumns.supporter,
            render: (e, record: any) => {
                if (record?.student?.staff) {
                    return (
                        <ul className='max-height'>
                            <li>
                                <b>Name : </b>{' '}
                                {record?.student?.staff?.fullname} (
                                {record?.student?.staff?.username})
                            </li>
                            {/* <li>
                                <b className='mr-1'>Greeting call: </b>
                                {record?.cs_info?.supporter?.greeting_call
                                    ? 'Done'
                                    : 'Not done'}
                            </li>
                            <li>
                                <b className='mr-1'>Scheduled: </b>
                                {record?.cs_info?.supporter?.scheduled
                                    ? 'Done'
                                    : 'Not done'}
                            </li>
                            <li>
                                <b className='mr-1'>Checking call: </b>
                                {record?.cs_info?.supporter?.checking_call
                                    ? 'Done'
                                    : 'Not done'}
                            </li> */}
                        </ul>
                    )
                }
                return <></>
            }
        },
        {
            title: 'Ordered Packages',
            dataIndex: 'orderedPackages',
            key: 'orderedPackages',
            width: 250,
            hidden: values.hiddenColumns.orderedPackages,
            render: (orderedPackages, record: any) => {
                const listDone = []
                const listProcessing = []
                const listPending = []
                orderedPackages.forEach((element) => {
                    if (
                        !element.activation_date ||
                        element.number_class === element.original_number_class
                    ) {
                        listPending.push(element)
                    } else if (
                        element?.expired_date &&
                        (moment(element?.expired_date) < moment() ||
                            element.number_class === 0)
                    ) {
                        listDone.push(element)
                    } else {
                        listProcessing.push(element)
                    }
                })
                return (
                    <ul className='max-height'>
                        <li>
                            {listProcessing && listProcessing.length ? (
                                <b>Đang học: </b>
                            ) : (
                                ''
                            )}
                            <ul>
                                {listProcessing &&
                                    listProcessing.map((item, index) => (
                                        <li key={`order${index}`}>
                                            <Popover
                                                content={renderOrderedPackage(
                                                    item
                                                )}
                                            >
                                                <a
                                                    href={`/csm/lesson-statistics?student_id=${record.id}&student_name=${record.username}&op_id=${item.id}`}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    style={{
                                                        color:
                                                            item.type === 1
                                                                ? '#108ee9'
                                                                : item.type ===
                                                                  2
                                                                ? '#f50'
                                                                : '#87d068'
                                                    }}
                                                >
                                                    {item.package_name}
                                                </a>
                                            </Popover>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                        <li>
                            {listPending && listPending.length ? (
                                <b>Chưa học: </b>
                            ) : (
                                ''
                            )}
                            <ul>
                                {listPending &&
                                    listPending.map((item, index) => (
                                        <li key={`order${index}`}>
                                            <Popover
                                                content={renderOrderedPackage(
                                                    item
                                                )}
                                            >
                                                <a
                                                    href={`/csm/lesson-statistics?student_id=${record.id}&student_name=${record.username}&op_id=${item.id}`}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    style={{
                                                        color:
                                                            item.type === 1
                                                                ? '#108ee9'
                                                                : item.type ===
                                                                  2
                                                                ? '#f50'
                                                                : '#87d068'
                                                    }}
                                                >
                                                    {item.package_name}
                                                </a>
                                            </Popover>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                        <li>
                            {listDone && listDone.length ? (
                                <b>Đã xong: </b>
                            ) : (
                                ''
                            )}
                            <ul>
                                {listDone &&
                                    listDone.map((item, index) => (
                                        <li key={`order${index}`}>
                                            <Popover
                                                content={renderOrderedPackage(
                                                    item
                                                )}
                                            >
                                                <a
                                                    href={`/csm/lesson-statistics?student_id=${record.id}&student_name=${record.username}&op_id=${item.id}`}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    style={{
                                                        color:
                                                            item.type === 1
                                                                ? '#108ee9'
                                                                : item.type ===
                                                                  2
                                                                ? '#f50'
                                                                : '#87d068'
                                                    }}
                                                >
                                                    {item.package_name}
                                                </a>
                                            </Popover>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                    </ul>
                )
            }
        },
        {
            title: 'Regular Time',
            dataIndex: 'regular_times',
            key: 'regular_times',
            width: 300,
            hidden: values.hiddenColumns.regular_times,
            render: (e, record: any) => (
                <ul className='max-height'>
                    {e &&
                        e.map((item, index) => {
                            const convertToLocal = item
                                ? getTimestampInWeekToLocal(item)
                                : null

                            const regularInfo = record.regular_calendar?.find(
                                (r) => r.regular_start_time === item
                            )
                            return (
                                <li key={`regular_times${index}`}>
                                    {regularInfo ? (
                                        <Popover
                                            content={renderRegularCalender(
                                                regularInfo
                                            )}
                                        >
                                            <a className='text-primary'>
                                                {formatTimestamp(
                                                    convertToLocal
                                                )}
                                                {` - ${regularInfo?.teacher?.full_name} - ${regularInfo?.teacher?.username}`}
                                            </a>
                                        </Popover>
                                    ) : (
                                        <p>{formatTimestamp(convertToLocal)}</p>
                                    )}
                                </li>
                            )
                        })}
                </ul>
            )
        },
        {
            title: 'Scheduled memo',
            dataIndex: 'scheduled_memos',
            key: 'scheduled_memos',
            width: 200,
            hidden: values.hiddenColumns.scheduled_memos,
            render: (e, record: any) => (
                <ul className='max-height'>
                    {e &&
                        e.map((item, index) => (
                            <li key={`scheduled_memos${index}`}>
                                {item._id ===
                                EnumScheduledMemoType.COURSE_MEMO ? (
                                    <b>Course memo: </b>
                                ) : (
                                    <></>
                                )}
                                {item._id ===
                                EnumScheduledMemoType.MONTHLY_MEMO ? (
                                    <b>Monthly memo: </b>
                                ) : (
                                    <></>
                                )}
                                <ul>
                                    {item.list.map((item2, index2) => (
                                        <li key={`scheduled_memos2${index2}`}>
                                            <Popover
                                                content={renderMemo(item2)}
                                            >
                                                <a className='text-primary'>
                                                    {item2.course?.name ||
                                                        `${item2.month} - ${item2.year}`}
                                                </a>
                                            </Popover>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                </ul>
            )
        },
        {
            title: 'Customer care',
            dataIndex: 'customer_care',
            key: 'customer_care',
            width: 200,
            hidden: values.hiddenColumns.customer_care,
            render: (e, record: any) =>
                record?.cs_info?.customer_care ? (
                    <ul className='max-height'>
                        <li>
                            <b>Customer Type : </b>{' '}
                            {
                                CUSTOMER_TYPE[
                                    record?.cs_info?.customer_care[
                                        record?.cs_info?.customer_care.length -
                                            1
                                    ].customer_type
                                ]
                            }
                        </li>
                        {record?.cs_info?.customer_care.map((item, index) => (
                            <li key={`customer_care${index}`}>
                                <Popover content={renderCSTime(item)}>
                                    <a className='text-primary'>
                                        Date:{' '}
                                        {moment(new Date(item?.date)).format(
                                            'MM-YYYY'
                                        )}
                                    </a>
                                </Popover>
                            </li>
                        ))}
                    </ul>
                ) : (
                    ''
                )
        },
        {
            title: 'Feedback',
            dataIndex: 'reports',
            key: 'reports',
            width: 250,
            hidden: values.hiddenColumns.reports,
            render: (e, record: any) => (
                <ul className='max-height'>
                    {e &&
                        e.map((item, index) => (
                            <li key={`reports${index}`}>
                                <Popover content={renderReports(item)}>
                                    <a className='text-primary'>
                                        {`${EnumRecommendSection2[item._id]}(${
                                            item.count
                                        })`}
                                    </a>
                                </Popover>
                            </li>
                        ))}
                </ul>
            )
        },
        {
            title: 'Referred by',
            dataIndex: 'referred_by',
            key: 'referred_by',
            width: 200,
            hidden: values.hiddenColumns.referred_by,
            render: (e, record: any) => {
                if (record?.cs_info?.ref) {
                    return (
                        <ul className='max-height'>
                            {record?.cs_info?.ref?.name ? (
                                <li>
                                    <b>Name : </b> {record?.cs_info?.ref?.name}
                                </li>
                            ) : (
                                ''
                            )}
                            {record?.cs_info?.ref?.phone ? (
                                <li>
                                    <b>Phone : </b>{' '}
                                    <a
                                        href={`tel:${record?.cs_info?.ref?.phone}`}
                                    >
                                        {' '}
                                        {record?.cs_info?.ref?.phone}
                                    </a>
                                </li>
                            ) : (
                                ''
                            )}
                            {record?.cs_info?.ref?.event ? (
                                <li>
                                    <b>Event : </b>{' '}
                                    {record?.cs_info?.ref?.event}
                                </li>
                            ) : (
                                ''
                            )}
                        </ul>
                    )
                }
                return <></>
            }
        },
        {
            title: 'Email Setting',
            dataIndex: 'is_verified_email',
            key: 'is_verified_email',
            width: 250,
            hidden: values.hiddenColumns.reports,
            render: (e, record: any) => (
                <>
                    <div>
                        Verified email:{' '}
                        {e ? (
                            <span style={{ color: '#52C41A' }}>ACTIVE</span>
                        ) : (
                            <span style={{ color: '#FF0D0D' }}>INACTIVE</span>
                        )}
                    </div>
                    <div>
                        {' '}
                        Notification via email:{' '}
                        {record?.is_enable_receive_mail ? (
                            <span style={{ color: '#52C41A' }}>ON</span>
                        ) : (
                            <span style={{ color: '#FF0D0D' }}>OFF</span>
                        )}
                    </div>
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <ul className='max-height'>
                    <li>
                        <Tooltip title='Edit info'>
                            <EditFilled
                                onClick={() => onClickUpdateData(record)}
                                style={{ color: blue.primary }}
                                type='button'
                            />
                        </Tooltip>
                    </li>
                </ul>
            )
        }
    ]

    return (
        <Card title='Students Management'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        autoComplete='off'
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Search By Name:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='name'
                                            className='mb-0 w-100'
                                        >
                                            <Input
                                                placeholder='By name'
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>FullText Search:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='search'
                                            className='mb-0 w-100'
                                        >
                                            <Input
                                                placeholder='By user info'
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Student status:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    EnumUserStatus.ACTIVE
                                                }
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option
                                                    value={
                                                        EnumUserStatus.ACTIVE
                                                    }
                                                >
                                                    {_.capitalize(
                                                        EnumUserStatus.ACTIVE
                                                    )}
                                                </Option>
                                                <Option
                                                    value={
                                                        EnumUserStatus.INACTIVE
                                                    }
                                                >
                                                    {_.capitalize(
                                                        EnumUserStatus.INACTIVE
                                                    )}
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Student Type:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='orderedPackageType'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option
                                                    value={TYPE_PACKAGE.PREMIUM}
                                                >
                                                    {_.capitalize('PREMIUM')}
                                                </Option>
                                                <Option
                                                    value={
                                                        TYPE_PACKAGE.STANDARD
                                                    }
                                                >
                                                    {_.capitalize('STANDARD')}
                                                </Option>
                                                <Option
                                                    value={TYPE_PACKAGE.TRIAL}
                                                >
                                                    {_.capitalize('TRIAL')}
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            {user?.department?.isRole !== EnumRole.Staff ? (
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={8}
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
                                                    <Option value=''>
                                                        All
                                                    </Option>
                                                    <Option value='-1'>
                                                        No one
                                                    </Option>
                                                    {values.staffs.map(
                                                        (item, index) => (
                                                            <Option
                                                                key={`staff_id${index}`}
                                                                value={
                                                                    item.value
                                                                }
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
                            ) : (
                                <></>
                            )}

                            {/* <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Checking call:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='checking_call'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='0' value='0'>
                                                    Not Done
                                                </Option>
                                                <Option key='1' value='1'>
                                                    Done
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Greeting call:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='greeting_call'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='0' value='0'>
                                                    Not Done
                                                </Option>
                                                <Option key='1' value='1'>
                                                    Done
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Scheduled:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='scheduled'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='0' value='0'>
                                                    Not Done
                                                </Option>
                                                <Option key='1' value='1'>
                                                    Done
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col> */}

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Contact by:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='type'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='0' value='0'>
                                                    Call
                                                </Option>
                                                <Option key='1' value='1'>
                                                    Message
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Customer type:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='customer_type'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder='Please select'
                                                defaultValue=''
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                {renderCustomerType()}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Auto scheduled:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='auto_scheduled'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='0' value='0'>
                                                    Not done
                                                </Option>
                                                <Option key='1' value='1'>
                                                    Done
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Verified Email:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='verified_email'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='1' value={true}>
                                                    ACTIVE
                                                </Option>
                                                <Option key='0' value={false}>
                                                    INACTIVE
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Notification Via Email:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='notification_email'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                defaultValue=''
                                                placeholder='Please select'
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option key='1' value={true}>
                                                    ON
                                                </Option>
                                                <Option key='0' value={false}>
                                                    OFF
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            <Col>
                                <Button
                                    type='primary'
                                    danger
                                    onClick={() => onReset()}
                                >
                                    Reset
                                </Button>
                            </Col>
                            <Col>
                                <Button htmlType='submit' type='primary'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
                <Panel header='Show columns' key='2'>
                    <Checkbox
                        className=' ml-2 mb-2'
                        checked={!values.hiddenColumns.supporter}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    supporter: !values.hiddenColumns.supporter
                                }
                            })
                        }
                    >
                        Supporter
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.orderedPackages}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    orderedPackages:
                                        !values.hiddenColumns.orderedPackages
                                }
                            })
                        }
                    >
                        Ordered Packages
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.regular_times}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    regular_times:
                                        !values.hiddenColumns.regular_times
                                }
                            })
                        }
                    >
                        Regular Time
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.scheduled_memos}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    scheduled_memos:
                                        !values.hiddenColumns.scheduled_memos
                                }
                            })
                        }
                    >
                        Scheduled memo
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.customer_care}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    customer_care:
                                        !values.hiddenColumns.customer_care
                                }
                            })
                        }
                    >
                        Customer care
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.reports}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    reports: !values.hiddenColumns.reports
                                }
                            })
                        }
                    >
                        Feedback
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.referred_by}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    referred_by:
                                        !values.hiddenColumns.referred_by
                                }
                            })
                        }
                    >
                        Referred by
                    </Checkbox>
                </Panel>
            </Collapse>

            <div className='d-flex align-items-center justify-content-end '>
                {checkPermission(PERMISSIONS.csmsm_update_supporter) &&
                    hasSelected && (
                        <>
                            <p>Apply {selectedRowKeys.length} students for </p>
                            <Select
                                defaultValue=''
                                style={{ width: '200px' }}
                                className='ml-1'
                                loading={values.isLoading}
                                value={selectedStaff}
                                onSelect={(val) => {
                                    setSelectedStaff(val)
                                }}
                            >
                                {values.staffs.map((item, index) => (
                                    <Option
                                        key={`staff_id${index}`}
                                        value={item.value}
                                    >
                                        {_.capitalize(item.label)}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                className='my-3 ml-2'
                                type='primary'
                                disabled={
                                    loadingUpdate ||
                                    !hasSelected ||
                                    !selectedStaff
                                }
                                onClick={updateStaff}
                            >
                                <Spin
                                    size='small'
                                    className='mr-2'
                                    spinning={loadingUpdate}
                                />
                                Update Supporter
                            </Button>
                        </>
                    )}
                {checkPermission(PERMISSIONS.csmsm_export_student_list) && (
                    <Button
                        onClick={() => exportCustomer('only_student')}
                        disabled={loadingExportStudentList}
                        className='my-3 ml-2'
                    >
                        <Spin
                            size='small'
                            className='mr-2'
                            spinning={loadingExportStudentList}
                        />
                        Export Student List
                    </Button>
                )}
                {checkPermission(PERMISSIONS.csmsm_export_excel) && (
                    <Button
                        onClick={() => exportCustomer('regular')}
                        disabled={loadingExport}
                        className='my-3 ml-2'
                    >
                        <Spin
                            size='small'
                            className='mr-2'
                            spinning={loadingExport}
                        />
                        Export Excel
                    </Button>
                )}
            </div>

            <Table
                className='student-management-table'
                size='small'
                dataSource={values.students}
                columns={columns.filter((e) => !e.hidden)}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowSelection={rowSelection}
                rowKey={(record: IStudent) => record.id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                loading={values.isLoading}
                sticky
            />
            <StudentModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                staffs={values.staffs}
                data={values.selectedStudent}
                studentLevels={values.studentLevels}
                updateData={updateData}
            />
        </Card>
    )
}

export default StudentsManagement
