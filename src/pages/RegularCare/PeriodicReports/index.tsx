import { useEffect, useState, useCallback, useReducer } from 'react'
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
    Space,
    Modal,
    Popconfirm
} from 'antd'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentAPI from 'api/StudentAPI'
import { DEPARTMENT } from 'const/department'
import './style.scss'

import { EnumPriority, ORDER_STATUS, EnumPeriodicType } from 'const'
import {
    EditFilled,
    DeleteOutlined,
    HistoryOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import RegularCareAPI from 'api/RegularCareAPI'
import { REGULAR_CARE_STATUS } from 'const/regular-care'
import { notify } from 'utils/notify'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UpdatePeriodicReportsModal from './modals/UpdatePeriodicReportsModal'
import ActionHistoryModal from './modals/ActionHistoryModal'
import AddPeriodicReportsModal from './modals/AddPeriodicReportsModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import StudentLevelAPI from 'api/StudentLevelAPI'
import { EnumPackageType } from 'types'
import StudentLevel from 'pages/Students/Level'
import { getTimestampInWeekToLocal } from 'utils'
import { EnumLAReportType } from 'types/ILearningAssessmentReports'
import axios from 'axios'

const GoogleScriptSyncDataUrl =
    process.env.REACT_APP_GOOGLE_SCRIPT_SYNC_DATA_URL
const { RangePicker } = DatePicker
const { Option } = Select
const { Panel } = Collapse

const PeriodicReports = ({ ...props }) => {
    const [isShownModal, setShowModal] = useState(false)
    const [isShowAddModal, setShowAddModal] = useState(false)
    const [isShowActionHistoryModal, setShowActionHistoryModal] =
        useState(false)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            objectSearch: {
                status: REGULAR_CARE_STATUS.NOT_DONE,
                priority: '',
                student_id: '',
                staff_id: '',
                reporter_id: '',
                fromDate: '',
                toDate: '',
                createTime: '',
                lesson_index_in_course: '',
                report_upload_status: '',
                periodic_type: ''
            },
            students: [],
            listAdmin: [],
            listAcademic: [],
            listReporter: [],
            studentLevels: [],
            reporterChoose: null,
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            },
            sort: 'asc'
        }
    )
    const [form] = Form.useForm()
    const [loadingAssignment, setLoadingAssignment] = useState<boolean>(false)
    const [loadingSyncData, setLoadingSyncData] = useState<boolean>(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }

    const toggleModal = (value) => {
        setShowModal(value)
    }

    const toggleAddModal = (value) => {
        setShowAddModal(value)
    }

    const toggleActionHistoryModal = (value) => {
        setShowActionHistoryModal(value)
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

    const getAllPeriodicReports = ({
        page_size,
        page_number,
        objectSearch
    }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            status: objectSearch.status,
            priority: objectSearch.priority,
            student_user_id: objectSearch.student_id,
            lesson_index_in_course: objectSearch.lesson_index_in_course,
            report_upload_status: objectSearch.report_upload_status,
            staff_id: objectSearch.staff_id,
            reporter_id: objectSearch.reporter_id,
            fromDate: values.objectSearch.fromDate,
            toDate: values.objectSearch.toDate,
            createTime: values.objectSearch.createTime,
            periodic_type: objectSearch.periodic_type,
            sort: values.sort
        }
        if (searchData.fromDate && searchData.toDate) {
            const fromDate = new Date(
                searchData.fromDate.set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                })
            ).getTime()
            const toDate = new Date(
                searchData.toDate.set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 0
                })
            ).getTime()
            searchData.fromDate = fromDate
            searchData.toDate = toDate
        }

        RegularCareAPI.getAllPeriodicReports(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                // eslint-disable-next-line array-callback-return
                res.data.map((value, index) => {
                    if (
                        value.deadline < new Date().getTime() &&
                        value.status === REGULAR_CARE_STATUS.NOT_DONE
                    ) {
                        value.expired = true
                    } else {
                        value.expired = false
                    }
                })
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
        getAllPeriodicReports({
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

    const fetchAcademicOptions = async () => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                idDepartment: DEPARTMENT.hocthuat.id
            })

            setValues({
                listAcademic: res.data.map((i: any) => ({
                    label: `${i.username} - ${i.fullname}`,
                    value: i.id
                })),
                listReporter: res.data.map((i: any) => ({
                    label: `${i.username}`,
                    value: i.id
                }))
            })
        } catch (error) {
            console.error(error)
        }
    }

    const fetchAdminOptions = useCallback(async (search) => {
        // if (_.isEmpty(data) || !idDepartment) return []
        const res = await AdministratorAPI.getAllAdministrators({
            search,
            idDepartment: DEPARTMENT.hocthuat.id
        })
        return res.data.map((i) => ({
            label: i.fullname,
            value: i.id
        }))
    }, [])

    const getRegularStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
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

    const updateData = () => {
        getAllPeriodicReports({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
    }

    const onClickUpdateData = async (item: any) => {
        const data = JSON.parse(JSON.stringify(item))
        const dataPeriodicReports = {
            _id: data._id,
            status: data.status,
            detail_data: data.detail_data,
            note_history: data.note_history,
            username_student: data.user ? data.user.username : null
        }
        setValues({ selectedPeriodicReports: dataPeriodicReports })
        toggleModal(true)
    }

    const onClickAddData = async (item: any) => {
        const data = JSON.parse(JSON.stringify(item))
        const dataPeriodicReports = {
            _id: data._id,
            user: data.user,
            lesson: data.lesson_index_in_course,
            package: data.orderedPackages
        }
        setValues({ selectedPeriodicReports: dataPeriodicReports })
        toggleAddModal(true)
    }

    const showActionHistory = async (data: any) => {
        setValues({ selectedPeriodicReports: data })
        toggleActionHistoryModal(true)
    }

    useEffect(() => {
        fetchAdministrators()
        fetchAcademicOptions()
        getStudentLevels({ page_size: 100, page_number: 1 })
        form.setFieldsValue({
            ...values.objectSearch
        })
        getAllPeriodicReports({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
        getRegularStudents({
            search: ''
        })
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
                getRegularStudents({
                    page_number: filter[key].page_number,
                    search: filter[key].search,
                    page_size
                })
            }
        }
    }
    const onSearch = (valuesForm: any) => {
        setValues({
            page_number: 1,
            objectSearch: { ...values.objectSearch, ...valuesForm }
        })
        getAllPeriodicReports({
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

    const updatePeriodicReports = async (value: any, item: any, type: any) => {
        const dataUpdate: any = {}
        let message = 'Update successfully'
        switch (type) {
            case 'status':
                dataUpdate._id = item._id
                dataUpdate.status = value
                message = 'Update status successfully'
                break
            case 'input_level':
                dataUpdate._id = item._id
                dataUpdate.input_level = value
                message = 'Update input level successfully'
                break
            case 'priority':
                dataUpdate._id = item._id
                dataUpdate.priority = value
                message = 'Update priority successfully'
                break
            case 'assign_manager':
                dataUpdate.type_action = type
                dataUpdate.object_ids = selectedRowKeys.filter((e) => e)
                message = 'Assign successfully'
                break
            case 'assign_academic':
                dataUpdate.type_action = type
                dataUpdate.object_ids = selectedRowKeys.filter((e) => e)
                dataUpdate.reporter_choose = values.reporterChoose
                if (!dataUpdate.reporter_choose) {
                    notify('error', 'Vui lòng chọn nhân viên cần chuyển BC')
                    return
                }
                message = 'Assign successfully'
                break
            case 'periodic_type':
                dataUpdate._id = item._id
                dataUpdate.periodic_type = value
                message = 'Update type successfully'
                break
            case 'status_sync_data':
                dataUpdate.type_action = type
                dataUpdate.object_ids = value
                message = 'Sync data to google sheets successfully'
                break
            default:
                break
        }
        if (
            (type === 'assign_manager' || type === 'assign_academic') &&
            dataUpdate.object_ids &&
            dataUpdate.object_ids.length > 0
        ) {
            let flagCheckNone = false
            await dataUpdate.object_ids.map(async (val: any) => {
                const dtCheck: any = await values.data.find(
                    (x: any) => x._id === val
                )
                if (dtCheck.periodic_type === EnumPeriodicType.NONE) {
                    notify(
                        'error',
                        'Danh sách đã chọn có chứa BC type None không được phép chuyển cho HT'
                    )
                    flagCheckNone = true
                }
            })
            if (flagCheckNone) {
                return
            }
        }
        setValues({ isLoading: true })
        RegularCareAPI.updatePeriodicReports(dataUpdate)
            .then((res) => {
                notify('success', message)
                setSelectedRowKeys([])
                updateData()
            })
            .catch((err) => {
                setLoadingSyncData(false)
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const syncDataToGGdoc = async (typeSync: any) => {
        setLoadingSyncData(true)
        const searchData = {
            page_size: 9999,
            page_number: 1,
            status: form.getFieldValue('status'),
            priority: form.getFieldValue('priority'),
            student_user_id: form.getFieldValue('student_id'),
            lesson_index_in_course: form.getFieldValue(
                'lesson_index_in_course'
            ),
            report_upload_status: form.getFieldValue('report_upload_status'),
            staff_id: form.getFieldValue('staff_id'),
            reporter_id: form.getFieldValue('reporter_id'),
            fromDate: values.objectSearch.fromDate,
            toDate: values.objectSearch.toDate,
            createTime: values.objectSearch.createTime,
            periodic_type: form.getFieldValue('periodic_type'),
            sort: values.sort,
            sync_data: 1
        }
        if (searchData.fromDate && searchData.toDate) {
            const fromDate = new Date(
                searchData.fromDate.set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                })
            ).getTime()
            const toDate = new Date(
                searchData.toDate.set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 0
                })
            ).getTime()
            searchData.fromDate = fromDate
            searchData.toDate = toDate
        }
        let dataPeriodic: any = null
        let dataSync: any = []
        const objIds = []
        await RegularCareAPI.getAllPeriodicReports(searchData)
            .then((res) => {
                dataPeriodic = res.data
            })
            .catch((err) => {
                setLoadingSyncData(false)
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
        if (!GoogleScriptSyncDataUrl) {
            notify('error', 'Lỗi, không lấy được url sync!')
            return
        }
        if (dataPeriodic && dataPeriodic.length > 0) {
            // eslint-disable-next-line array-callback-return
            await dataPeriodic.map(async (item: any) => {
                objIds.push(item._id)
                const teacherList = []
                let teacherName = ''
                // eslint-disable-next-line array-callback-return
                await item?.regular_calendar.map((value: any) => {
                    if (!teacherList.includes(value.teacher_full_name)) {
                        teacherList.push(value.teacher_full_name)
                        if (teacherName) {
                            teacherName += `\n ${value.teacher_full_name}`
                        } else {
                            teacherName = value.teacher_full_name
                        }
                    }
                })
                const inputLevelData = values.studentLevels.find(
                    (v: any) => v.id === Number(item?.input_level)
                )
                const priorityData = Object.keys(EnumPriority).find(
                    (key: any) =>
                        Number(EnumPriority[key]) === Number(item?.priority)
                )

                dataSync.push([
                    '',
                    '',
                    moment().format('DD/MM/YYYY'),
                    item.student?.staff?.fullname ?? '',
                    item.user?.full_name ?? '',
                    item.user?.email ?? '',
                    item.user?.phone_number ?? '',
                    item.user?.date_of_birth
                        ? moment(item?.user?.date_of_birth).format('DD/MM/YYYY')
                        : '',
                    teacherName,
                    inputLevelData
                        ? `${inputLevelData.id} - ${inputLevelData.name}`
                        : 'None',
                    item.orderedPackages?.original_number_class ?? '',
                    item.orderedPackages?.original_number_class ?? '',
                    item.periodic_number_completed ?? '',
                    item.periodic_number_absent ?? '',
                    item.booking?.course?.name ?? '',
                    priorityData ?? '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    typeSync === EnumPeriodicType.PERIODIC
                        ? `Đánh giá định kỳ buổi ${item.lesson_index_in_course}`
                        : `Đánh giá cuối kỳ buổi ${item.lesson_index_in_course}`,
                    item.reporter?.fullname ?? '',
                    item.deadline
                        ? moment(item?.deadline).format('DD/MM/YYYY')
                        : ''
                ])
            })
            dataSync = JSON.stringify(dataSync)

            // sync data vào gg sheet dùng google app script tk: englishplus.edu66@gmail.com/EnglishPlus66
            let url = ''
            if (typeSync === EnumPeriodicType.END_TERM) {
                url = `${GoogleScriptSyncDataUrl}?action=end_term`
            } else if (typeSync === EnumPeriodicType.PERIODIC) {
                url = `${GoogleScriptSyncDataUrl}?action=periodic`
            }
            fetch(url, {
                redirect: 'follow',
                method: 'POST',
                body: dataSync,
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                }
            })
                .then((response) => {
                    updatePeriodicReports(objIds, null, 'status_sync_data')
                })
                .catch((err) => {
                    setLoadingSyncData(false)
                    notify('error', err.message)
                })
                .finally(() => setLoadingSyncData(false))
        } else {
            notify('error', 'Các báo cáo này đã sync rồi!')
            setLoadingSyncData(false)
        }
    }

    const removePeriodicReports = useCallback((obj_id: any) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            async onOk() {
                try {
                    await RegularCareAPI.removePeriodicReports(obj_id)
                    updateData()
                } catch (err) {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                }
            }
        })
    }, [])

    const handleTableChange = (sorter: any, extra: any) => {
        if (extra.action === 'sort') {
            if (values.sort === 'desc') {
                values.sort = 'asc'
                setValues({ sort: 'asc' })
            } else {
                values.sort = 'desc'
                setValues({ sort: 'desc' })
            }
            getAllPeriodicReports({
                page_number: values.page_number,
                page_size: values.page_size,
                objectSearch: form.getFieldsValue()
            })
        }
    }

    const renderLesson = (booking: any, index: any = -1) =>
        booking ? (
            <ul key={`course${index}`} className='list-unstyled'>
                <li>
                    <b>Time: </b>
                    {booking.calendar &&
                        moment(new Date(booking?.calendar?.start_time)).format(
                            'dddd - HH:mm DD/MM/YYYY'
                        )}
                </li>
                <li>
                    <b>GV: </b>
                    {booking?.teacher && (
                        <>
                            {booking?.teacher?.full_name} -{' '}
                            {booking?.teacher?.username}
                        </>
                    )}
                </li>
                <li>
                    <b>Course: </b>
                    {booking?.course && <>{booking?.course.name}</>}
                </li>
            </ul>
        ) : (
            ''
        )

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
                    {item.type === EnumPackageType.STANDARD ? (
                        <Tag color='#108ee9'>STANDARD</Tag>
                    ) : item.type === EnumPackageType.PREMIUM ? (
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
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            align: 'left',
            fixed: true,
            width: 260,
            render: (e, record: any) => {
                return (
                    record &&
                    record?.user && (
                        <div
                            style={record?.expired ? { color: '#E23232' } : {}}
                        >
                            <Popover
                                content={
                                    <>
                                        {record?.user?.date_of_birth && (
                                            <>
                                                <b>Date of birth: </b>
                                                <span>
                                                    {moment(
                                                        record?.user
                                                            ?.date_of_birth
                                                    ).format('DD-MM-YYYY')}
                                                </span>
                                                <br />
                                                <b>Email: </b>
                                                <span>
                                                    {record?.user?.email}
                                                </span>
                                            </>
                                        )}
                                        {record?.user?.email && (
                                            <>
                                                <b>Email: </b>
                                                <span>
                                                    {record?.user?.email}
                                                </span>
                                            </>
                                        )}
                                        {record?.regular_calendar &&
                                            record?.regular_calendar.length >
                                                0 && (
                                                <>
                                                    <b>Regular Calendar: </b>
                                                    {record?.regular_calendar.map(
                                                        (item, index) => (
                                                            <div>
                                                                <span>
                                                                    {moment(
                                                                        getTimestampInWeekToLocal(
                                                                            item.regular_start_time
                                                                        )
                                                                    ).format(
                                                                        'dddd - HH:mm'
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {
                                                                        item.teacher_full_name
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        item.teacher_username
                                                                    }
                                                                </span>
                                                                <br />
                                                            </div>
                                                        )
                                                    )}
                                                </>
                                            )}
                                    </>
                                }
                            >
                                <Link
                                    style={
                                        record?.expired
                                            ? { color: '#E23232' }
                                            : {}
                                    }
                                    to={`/students/all?search=${record?.user?.username}`}
                                    target='_blank'
                                >
                                    {record?.user?.full_name} -{' '}
                                    {record?.user?.username}
                                </Link>
                            </Popover>
                            <br></br>
                            {record?.student?.staff ? (
                                <>
                                    Supporter:{' '}
                                    {record?.student?.staff?.fullname} -{' '}
                                    {record?.student?.staff?.username}
                                </>
                            ) : (
                                <>Supporter: None</>
                            )}
                        </div>
                    )
                )
            }
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return record && record?.user ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {record?.user?.phone_number}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Package',
            dataIndex: 'package',
            key: 'package',
            width: 130,
            render: (e, record: any) => {
                return record && record?.orderedPackages ? (
                    <Popover
                        content={renderOrderedPackage(record?.orderedPackages)}
                    >
                        <a>
                            <div
                                className='text-truncate'
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {record?.orderedPackages.type ===
                                EnumPackageType.STANDARD
                                    ? 'STA'
                                    : record?.orderedPackages.type ===
                                      EnumPackageType.PREMIUM
                                    ? 'PRE'
                                    : 'TRIAL'}{' '}
                                - {record?.orderedPackages?.package_name}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Lesson',
            dataIndex: 'lesson',
            key: 'lesson',
            align: 'center',
            width: 70,
            render: (text: any, record: any, index) => {
                return record ? (
                    <Popover content={renderLesson(record?.booking || null)}>
                        <a>
                            <div
                                className='text-truncate'
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {record.lesson_index_in_course}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Number lesson completed',
            dataIndex: 'periodic_number_completed',
            key: 'periodic_number_completed',
            align: 'center',
            width: 120,
            render: (text: any, record: any, index) => {
                return record ? (
                    <div
                        className='text-truncate'
                        style={record?.expired ? { color: '#E23232' } : {}}
                    >
                        {text}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Number lesson absent',
            dataIndex: 'periodic_number_absent',
            key: 'periodic_number_absent',
            align: 'center',
            width: 120,
            render: (text: any, record: any, index) => {
                return record ? (
                    <div
                        className='text-truncate'
                        style={record?.expired ? { color: '#E23232' } : {}}
                    >
                        {text}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Type',
            dataIndex: 'periodic_type',
            key: 'periodic_type',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        defaultValue={e}
                        onChange={(value) =>
                            updatePeriodicReports(
                                value,
                                record,
                                'periodic_type'
                            )
                        }
                    >
                        <Option
                            key={EnumPeriodicType.PERIODIC}
                            value={EnumPeriodicType.PERIODIC}
                        >
                            BC định kỳ
                        </Option>
                        <Option
                            key={EnumPeriodicType.END_TERM}
                            value={EnumPeriodicType.END_TERM}
                        >
                            BC cuối kỳ
                        </Option>
                        <Option
                            key={EnumPeriodicType.NONE}
                            value={EnumPeriodicType.NONE}
                        >
                            None
                        </Option>
                    </Select>
                )
            }
        },
        {
            title: 'Input level',
            dataIndex: 'input_level',
            key: 'input_level',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return (
                    <Select
                        value={e || 0}
                        style={{ width: '100%' }}
                        onChange={(value) =>
                            updatePeriodicReports(value, record, 'input_level')
                        }
                    >
                        {values.studentLevels &&
                            values.studentLevels.map((item: any, index) => (
                                <Option
                                    key={`student_level${item.id}`}
                                    value={item.id}
                                >
                                    {`${item.id} - ${item.name}`}
                                </Option>
                            ))}
                    </Select>
                )
            }
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 180,
            render: (e, record: any) => {
                const sizeNote = record.note_history.length
                return record && record.note_history[sizeNote - 1] ? (
                    <div
                        className='text-truncate'
                        style={record?.expired ? { color: '#E23232' } : {}}
                    >
                        {record?.note_history[sizeNote - 1].note}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'center',
            width: 140,
            sorter: true,
            render: (e, record: any) => {
                return record && record.deadline ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {moment(record?.deadline).format('HH:mm DD-MM-YYYY')}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        defaultValue={e}
                        onChange={(value) =>
                            updatePeriodicReports(value, record, 'priority')
                        }
                    >
                        {Object.keys(EnumPriority)
                            .filter(
                                (key: any) => !isNaN(Number(EnumPriority[key]))
                            )
                            .map((key: any) => (
                                <Option
                                    value={EnumPriority[key]}
                                    key={EnumPriority[key]}
                                >
                                    {key}
                                </Option>
                            ))}
                    </Select>
                )
            }
        },
        {
            title: 'Reporter',
            dataIndex: 'reporter',
            key: 'reporter',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return e ? <>{e?.username}</> : <>No one</>
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return (
                    <Select
                        defaultValue={record?.status}
                        style={{ width: '100%' }}
                        onChange={(value) =>
                            updatePeriodicReports(value, record, 'status')
                        }
                    >
                        <Option value={REGULAR_CARE_STATUS.NOT_DONE}>
                            Not Done
                        </Option>
                        <Option value={REGULAR_CARE_STATUS.DONE}>Done</Option>
                    </Select>
                )
            }
        },
        {
            title: 'Create Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 140,
            sorter: true,
            render: (e, record: any) => {
                return record && record.created_time ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {moment(record?.created_time).format(
                            'HH:mm DD-MM-YYYY'
                        )}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: '',
            dataIndex: 'learning_report',
            key: 'create_report',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (item, record: any) => {
                return item && record ? (
                    <>
                        <Link
                            to={`/academic-report/learning-assessment?report_id=${
                                item.id
                            }&&type=${Number(item?.type) - 1}`}
                            target='_blank'
                        >
                            Report
                        </Link>
                        {record?.periodic_report_time && (
                            <div
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {moment(record?.periodic_report_time).format(
                                    'HH:mm DD-MM-YYYY'
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {checkPermission(PERMISSIONS.rcpr_add_report) && (
                            <Button
                                type='primary'
                                onClick={() => onClickAddData(record)}
                            >
                                Add Report
                            </Button>
                        )}
                    </>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 90,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.rcpr_update) && (
                        <EditFilled
                            onClick={() => onClickUpdateData(record)}
                            style={{ color: blue.primary }}
                            type='button'
                            title='Edit note'
                        />
                    )}
                    <HistoryOutlined
                        style={{ color: blue.primary }}
                        type='button'
                        onClick={() => showActionHistory(record._id)}
                        title='View action history'
                    />
                    {checkPermission(PERMISSIONS.rcpr_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => removePeriodicReports(record._id)}
                            title='Remove report'
                        />
                    )}
                </Space>
            )
        }
    ]

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

    const onChangeCreateTime = (value) => {
        setValues({
            objectSearch: {
                ...values.objectSearch,
                createTime: value ? new Date(value).getTime() : ''
            },
            page_number: 1
        })
    }

    return (
        <Card title='Periodic Reports'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        className='form-filter'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={6}>Supporter:</Col>
                                    <Col span={18}>
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
                                                <Option value={-1}>
                                                    No one
                                                </Option>
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
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={6}>Deadline:</Col>
                                    <Col span={18}>
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
                                                // disabledDate={disabledDate}
                                                clearIcon={false}
                                                onChange={handleChangeDate}
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
                                    <Col span={6}>Create Time:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='createTime'
                                            className='mb-0 w-100'
                                        >
                                            <DatePicker
                                                className='w-100'
                                                defaultValue={
                                                    values.objectSearch
                                                        .createTime
                                                }
                                                format='DD-MM-YYYY'
                                                allowClear
                                                onChange={onChangeCreateTime}
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
                                    <Col span={6}>Student:</Col>
                                    <Col span={18}>
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
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={6}>Status:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    values.objectSearch.status
                                                }
                                                style={{ width: '100%' }}
                                            >
                                                <Option
                                                    key='-1'
                                                    value={
                                                        REGULAR_CARE_STATUS.ALL
                                                    }
                                                >
                                                    All
                                                </Option>
                                                <Option
                                                    key='1'
                                                    value={
                                                        REGULAR_CARE_STATUS.NOT_DONE
                                                    }
                                                >
                                                    Not Done
                                                </Option>
                                                <Option
                                                    key='2'
                                                    value={
                                                        REGULAR_CARE_STATUS.DONE
                                                    }
                                                >
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
                                    <Col span={6}>Lesson:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='lesson_index_in_course'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value={20}>20</Option>
                                                <Option value={25}>25</Option>
                                                <Option value={40}>40</Option>
                                                <Option value={45}>45</Option>
                                                <Option value={70}>70</Option>
                                                <Option value={75}>75</Option>
                                                <Option value={90}>90</Option>
                                                <Option value={95}>95</Option>
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
                                    <Col span={6}>Reporter:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='reporter_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value={-1}>
                                                    No one
                                                </Option>
                                                {values.listAcademic.map(
                                                    (item, index) => (
                                                        <Option
                                                            key={`reporter_id${index}`}
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
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={6}>Priority:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='priority'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    values.objectSearch.priority
                                                }
                                                style={{ width: '100%' }}
                                            >
                                                <Option value='' key='all'>
                                                    All
                                                </Option>
                                                {Object.keys(EnumPriority)
                                                    .filter(
                                                        (key: any) =>
                                                            !isNaN(
                                                                Number(
                                                                    EnumPriority[
                                                                        key
                                                                    ]
                                                                )
                                                            )
                                                    )
                                                    .map((key: any) => (
                                                        <Option
                                                            value={
                                                                EnumPriority[
                                                                    key
                                                                ]
                                                            }
                                                            key={
                                                                EnumPriority[
                                                                    key
                                                                ]
                                                            }
                                                        >
                                                            {key}
                                                        </Option>
                                                    ))}
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
                                    <Col span={6}>Report file:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='report_upload_status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value={1}>
                                                    Not done
                                                </Option>
                                                <Option value={2}>
                                                    Uploaded
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
                                    <Col span={6}>Type:</Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name='periodic_type'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    values.objectSearch
                                                        .periodic_type
                                                }
                                                style={{ width: '100%' }}
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                <Option
                                                    key={
                                                        EnumPeriodicType.PERIODIC
                                                    }
                                                    value={
                                                        EnumPeriodicType.PERIODIC
                                                    }
                                                >
                                                    BC định kỳ
                                                </Option>
                                                <Option
                                                    key={
                                                        EnumPeriodicType.END_TERM
                                                    }
                                                    value={
                                                        EnumPeriodicType.END_TERM
                                                    }
                                                >
                                                    BC cuối kỳ
                                                </Option>
                                                <Option
                                                    key={EnumPeriodicType.NONE}
                                                    value={
                                                        EnumPeriodicType.NONE
                                                    }
                                                >
                                                    None
                                                </Option>
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
            {/* <div className='mt-1 mr-4'>Total: {values.total || 0}</div> */}
            <Row className='mb-2'>
                <Col span={18} className='d-flex justify-content-start'>
                    {selectedRowKeys.length > 0 && (
                        <>
                            <div className='mt-1'>
                                Chuyển {selectedRowKeys.length} báo cáo cho
                            </div>
                            {checkPermission(
                                PERMISSIONS.rcpr_assign_academic
                            ) && (
                                <>
                                    <div className='ml-4'>
                                        <DebounceSelect
                                            placeholder='Chọn người muốn chuyển BC'
                                            fetchOptions={fetchAdminOptions}
                                            allowClear
                                            onChange={(val) =>
                                                setValues({
                                                    reporterChoose: val
                                                })
                                            }
                                        />
                                    </div>
                                    <div className='ml-3'>
                                        <Popconfirm
                                            placement='top'
                                            title='Bạn chắc chắn muốn chuyển các báo cáo cho nhân viên đã chọn?'
                                            onConfirm={() =>
                                                updatePeriodicReports(
                                                    '',
                                                    '',
                                                    'assign_academic'
                                                )
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
                                                disabled={loadingAssignment}
                                                loading={loadingAssignment}
                                            >
                                                Assign
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </>
                            )}
                            {checkPermission(
                                PERMISSIONS.rcpr_assign_manager
                            ) && (
                                <>
                                    <div className='mt-1 mr-4 ml-1'>
                                        Học Thuật
                                    </div>
                                    <Popconfirm
                                        placement='top'
                                        title='Bạn chắc chắn muốn chuyển các báo cáo này cho trưởng phòng Học Thuật?'
                                        onConfirm={() =>
                                            updatePeriodicReports(
                                                '',
                                                '',
                                                'assign_manager'
                                            )
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
                                            disabled={loadingAssignment}
                                            loading={loadingAssignment}
                                        >
                                            Assign
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                        </>
                    )}
                </Col>
                <Col span={6} className='d-flex justify-content-end'>
                    {values.data.length &&
                        values.data.length > 0 &&
                        values.objectSearch.periodic_type ===
                            EnumPeriodicType.PERIODIC && (
                            <Popconfirm
                                placement='top'
                                title='Bạn chắc chắn muốn sync các báo cáo này sang google sheets?'
                                onConfirm={() =>
                                    syncDataToGGdoc(EnumPeriodicType.PERIODIC)
                                }
                                disabled={loadingSyncData}
                                okText='Ok'
                                cancelText='Cancel'
                            >
                                <Button
                                    style={{
                                        background: '#08BF5A',
                                        color: 'white'
                                    }}
                                    className='ml-4'
                                    disabled={loadingSyncData}
                                    loading={loadingSyncData}
                                >
                                    Sync Data BCĐK
                                </Button>
                            </Popconfirm>
                        )}
                    {values.data.length &&
                        values.data.length > 0 &&
                        values.objectSearch.periodic_type ===
                            EnumPeriodicType.END_TERM && (
                            <Popconfirm
                                placement='top'
                                title='Bạn chắc chắn muốn sync các báo cáo này sang google sheets?'
                                onConfirm={() =>
                                    syncDataToGGdoc(EnumPeriodicType.END_TERM)
                                }
                                okText='Ok'
                                disabled={loadingSyncData}
                                cancelText='Cancel'
                            >
                                <Button
                                    style={{
                                        background: '#08BF5A',
                                        color: 'white'
                                    }}
                                    className='ml-4'
                                    disabled={loadingSyncData}
                                    loading={loadingSyncData}
                                >
                                    Sync Data BCCK
                                </Button>
                            </Popconfirm>
                        )}
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={values.data}
                pagination={{
                    showTotal: (totalData, range) => (
                        <div>
                            Showing {range[0]}-{range[1]} of {totalData}
                        </div>
                    ),
                    showSizeChanger: true,
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowSelection={
                    values.objectSearch.periodic_type !== EnumPeriodicType.NONE
                        ? rowSelection
                        : null
                }
                scroll={{
                    x: 500,
                    y: 400
                }}
                loading={values.isLoading}
                sticky
                rowKey={(record: any) => record._id}
                onChange={(val: any, filter: any, sorter: any, extra: any) => {
                    handleTableChange(sorter, extra)
                }}
            />
            <UpdatePeriodicReportsModal
                visible={isShownModal}
                toggleModal={toggleModal}
                data={values.selectedPeriodicReports}
                updateData={updateData}
            />
            <AddPeriodicReportsModal
                visible={isShowAddModal}
                toggleModal={toggleAddModal}
                data={values.selectedPeriodicReports}
                updateData={updateData}
            />
            <ActionHistoryModal
                visible={isShowActionHistoryModal}
                toggleModal={toggleActionHistoryModal}
                dataObjId={values.selectedPeriodicReports}
                reporters={values.listReporter}
                studentLevel={values.studentLevels}
            />
        </Card>
    )
}

export default PeriodicReports
