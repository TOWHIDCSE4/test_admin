import {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
import {
    Table,
    Card,
    DatePicker,
    Menu,
    Dropdown,
    Input,
    Tag,
    Popover,
    Row,
    Col,
    Select,
    Spin,
    Button,
    Collapse,
    Form,
    notification
} from 'antd'
import {
    EllipsisOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    SkypeOutlined,
    PlusOutlined,
    VideoCameraOutlined,
    UnlockOutlined,
    LockOutlined
} from '@ant-design/icons'
import BookingAPI from 'api/BookingAPI'
import moment from 'moment'
import _ from 'lodash'
import { EnumPackageOrderType, IBooking, IStatisticBooking } from 'types'
import { ColumnsType } from 'antd/lib/table'
import {
    EnumBookingTypes,
    ENUM_BOOKING_STATUS,
    IELTS_TEACHER_FAKE_ID,
    EnumBookingMediumType
} from 'const'
import { notify } from 'utils/notify'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import cn from 'classnames'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import RedirectButton from 'components/redirect-button'
import UpdateStatusModal from './update-status-modal'
import UpdateUnitModal from './update-unit-modal'
import ViewAllModal from './view-all-modal'
import UpdateNoteModal from './update-note-modal'
import styles from './index.module.scss'
import UpdateTimeModal from '../../AutomaticScheduling/CreateScheduling/update-time-modal'
import AdministratorAPI from 'api/AdministratorAPI'
import { DEPARTMENT } from 'const/department'
import NameTeacherStudent from 'components/name-teacher-student'
import SearchUser from 'components/search-user-with-lazy-load'
import TeacherAPI from 'api/TeacherAPI'
import StudentAPI from 'api/StudentAPI'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Panel } = Collapse

const Overview: FunctionComponent = () => {
    const [form] = Form.useForm()
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            bookings: [],
            isLoading: false,
            visibleUpdateStatus: false,
            visibleUpdateUnit: false,
            visibleUpdateNote: false,
            visibleViewAll: false,
            visibleMeeting: false,
            selected_booking: {}
        }
    )

    const [isShownModalChangeTime, setShownModalChangeTime] =
        useState<boolean>(false)
    const [selectedBooking2, setSelectedBooking2] = useState(null)
    const [queryParams, setQueryParams] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type: !queryUrl.get('id')
                ? [EnumBookingTypes.FLEXIBLE, EnumBookingTypes.REGULAR]
                : [],
            status: '',
            search: '',
            staff_id: '',
            min_start_time: !queryUrl.get('id')
                ? moment().startOf('month')
                : undefined,
            max_end_time: !queryUrl.get('id')
                ? moment().endOf('month')
                : undefined,
            sort: 'prev',
            id: queryUrl.get('id'),
            student_id: queryUrl.get('student_id') || '',
            teacher_id: ''
        }
    )
    const [statistic, setStatistic] = useState<IStatisticBooking>()
    const [isLoadingStatistic, setLoadingStatistic] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)

    const [staffs, setStaffs] = useState([])

    const fetchStatisticBooking = (query?: {
        status?: number | string
        search?: string
        staff_id?: string
        min_start_time?: any
        max_end_time?: any
        type?: number[]
    }) => {
        setLoadingStatistic(true)
        const filter = {
            ...query
        }
        if (filter.min_start_time)
            filter.min_start_time = moment(filter.min_start_time)
                .startOf('d')
                .valueOf()
        if (filter.max_end_time)
            filter.max_end_time = moment(filter.max_end_time)
                .endOf('d')
                .valueOf()
        BookingAPI.getStatisticBookings(filter)
            .then((res) => {
                setStatistic(res)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoadingStatistic(false))
    }

    const getAllBookings = (query?: {
        page_size: number
        page_number: number
        sort?: string
        status?: number | string
        search?: string
        staff_id?: string
        min_start_time?: any
        max_end_time?: any
        type?: number[]
    }) => {
        setValues({ isLoading: true })
        const filter = {
            ...query
        }
        if (filter.min_start_time)
            filter.min_start_time = moment(filter.min_start_time)
                .startOf('d')
                .valueOf()
        if (filter.max_end_time)
            filter.max_end_time = moment(filter.max_end_time)
                .endOf('d')
                .valueOf()
        BookingAPI.getAllBookings(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setValues({ bookings: res.data })
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const fetchAdminOptions = async (search, idDepartment) => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment
            })
            const dataStaffs = res.data.map((i) => ({
                label: `${i.fullname} - ${i.username}`,
                value: i.id,
                username: i.username,
                fullname: i.fullname,
                phoneNumber: i.phoneNumber
            }))
            setStaffs(dataStaffs)
        } catch (error) {
            notify('error', error.message)
        }
    }

    useEffect(() => {
        getAllBookings({ ...queryParams, page_size: pageSize, page_number: 1 })
        fetchStatisticBooking({ ...queryParams })
        setPageNumber(1)
        fetchAdminOptions('', DEPARTMENT.phongcskh.id)
    }, [])

    const toggleUpdateStatusModal = useCallback(
        (visible: boolean, selectedBooking?: IBooking) => {
            setValues({ visibleUpdateStatus: visible })
            setValues({ selected_booking: selectedBooking || {} })
        },
        [values.selected_booking]
    )

    const toggleUpdateUnitModal = useCallback(
        (visible: boolean, selectedBooking?: IBooking) => {
            setValues({ visibleUpdateUnit: visible })
            setValues({ selected_booking: selectedBooking || {} })
        },
        [values.selected_booking]
    )

    const toggleUpdateNoteModal = useCallback(
        (visible: boolean, selectedBooking?: IBooking) => {
            setValues({ visibleUpdateNote: visible })
            setValues({ selected_booking: selectedBooking || {} })
        },
        [values.selected_booking]
    )

    const toggleViewAllModal = useCallback(
        (visible: boolean, selectedBooking?: IBooking) => {
            setValues({ visibleViewAll: visible })
            setValues({ selected_booking: selectedBooking || {} })
        },
        [values.selected_booking]
    )

    const openMeetingPage = useCallback((selectedBooking?: IBooking) => {
        if (
            [
                ENUM_BOOKING_STATUS.UPCOMING,
                ENUM_BOOKING_STATUS.TEACHING
            ].includes(selectedBooking.status)
        ) {
            const win = window.open(
                `/meet?room=${selectedBooking.id}`,
                '_blank'
            )
            win.focus()
        } else {
            notify('error', 'Booking have completed or cancel')
        }
    }, [])

    const onWatchVideo = useCallback(
        (selectedBooking?: IBooking) => {
            if (selectedBooking?.record_link) {
                if (typeof selectedBooking?.record_link === 'string') {
                    const win = window.open(
                        selectedBooking?.record_link,
                        '_blank'
                    )
                    win.focus()
                } else {
                    for (const iterator of selectedBooking?.record_link as any) {
                        window.open(iterator, '_blank')
                    }
                }
            }
        },
        [values.selected_booking]
    )

    const refetchData = useCallback(() => {
        getAllBookings({
            ...queryParams,
            page_number: pageNumber,
            page_size: pageSize
        })
    }, [queryParams, pageNumber, pageSize])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            getAllBookings({
                ...queryParams,
                page_number: _pageNumber,
                page_size: _pageSize
            })
            setPageNumber(_pageNumber)
            setPageSize(_pageSize)
        },
        [queryParams, pageNumber, pageSize]
    )
    const handleRangePicker = (value) => {
        if (value[0] && value[1] && value[0] <= value[1]) {
            setQueryParams({
                ...queryParams,
                min_start_time: value[0],
                max_end_time: value[1],
                id: ''
            })
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const onSearch = (value) => {
        setQueryParams({
            ...queryParams,
            search: value,
            id: ''
        })
    }

    const onSearchStaff = (value) => {
        setQueryParams({ ...queryParams, staff_id: value, id: '' })
    }

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

    const addLinkHMP = (selected) => {
        setValues({ isLoading: true })
        BookingAPI.addLinkHMP(selected.id)
            .then((data) => {
                setValues({ isLoading: false })
                refetchData()
                notification.success({
                    message: 'Add link Hamia Meet Plus success'
                })
            })
            .catch((err) => {
                setValues({ isLoading: false })
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const toggleLockUnit = (flagLock: boolean, selected: any) => {
        setValues({ isLoading: true })
        BookingAPI.editBooking(selected.id, {
            admin_unit_lock: flagLock
        })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: flagLock
                        ? 'Lock unit Successfully'
                        : 'Unlock unit Successfully'
                })
                refetchData()
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().add(6, 'month'))

    const toggleModalChangeTime = (value) => {
        setShownModalChangeTime(value)
    }
    const menuActions = (record: IBooking) => (
        <Menu>
            {checkPermission(PERMISSIONS.tmo_update_status) && (
                <Menu.Item
                    key='0'
                    onClick={() => toggleUpdateStatusModal(true, record)}
                >
                    <EditOutlined className='mr-2' />
                    Update status
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tmo_update_unit) && (
                <Menu.Item
                    key='1'
                    onClick={() => toggleUpdateUnitModal(true, record)}
                >
                    <EditOutlined className='mr-2' />
                    Update unit
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tmo_toggle_lock_unit) &&
                record?.admin_unit_lock && (
                    <Menu.Item
                        key='8'
                        onClick={() => toggleLockUnit(false, record)}
                    >
                        <UnlockOutlined className='mr-2' />
                        Unlock unit
                    </Menu.Item>
                )}
            {checkPermission(PERMISSIONS.tmo_toggle_lock_unit) &&
                !record?.admin_unit_lock && (
                    <Menu.Item
                        key='9'
                        onClick={() => toggleLockUnit(true, record)}
                    >
                        <LockOutlined className='mr-2' />
                        Lock unit
                    </Menu.Item>
                )}
            {checkPermission(PERMISSIONS.tmo_update_time) &&
                record?.teacher_id !== IELTS_TEACHER_FAKE_ID && (
                    <Menu.Item
                        key='6'
                        onClick={() => {
                            setSelectedBooking2(record)
                            toggleModalChangeTime(true)
                        }}
                    >
                        <EditOutlined className='mr-2' />
                        Update Time/Teacher
                    </Menu.Item>
                )}
            {checkPermission(PERMISSIONS.tmo_update_note) && (
                <Menu.Item
                    key='3'
                    onClick={() => toggleUpdateNoteModal(true, record)}
                >
                    <EditOutlined className='mr-2' />
                    Update note
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tmo_add_link_hmp) &&
                record?.status === ENUM_BOOKING_STATUS.UPCOMING &&
                record?.learning_medium?.medium_type ===
                    EnumBookingMediumType.HAMIA_MEET &&
                !record?.learning_medium?.info?.student_link && (
                    <Menu.Item key='7' onClick={() => addLinkHMP(record)}>
                        <PlusOutlined className='mr-2' />
                        Add link HMP
                    </Menu.Item>
                )}
            {checkPermission(PERMISSIONS.tmo_view_detail) && (
                <Menu.Item
                    key='2'
                    onClick={() => toggleViewAllModal(true, record)}
                >
                    <EyeOutlined className='mr-2' />
                    View all
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tmo_join_meeting) && (
                <Menu.Item key='4' onClick={() => openMeetingPage(record)}>
                    <EyeOutlined className='mr-2' />
                    Join Meeting
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tmo_watch_video) && (
                <Menu.Item
                    key='5'
                    onClick={() => onWatchVideo(record)}
                    disabled={!record?.record_link}
                >
                    <EyeOutlined className='mr-2' />
                    Watch video
                </Menu.Item>
            )}
        </Menu>
    )

    const columns: ColumnsType<IBooking> = [
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            render: (text, record) => text
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
                    {record?.ordered_package?.type ===
                    EnumPackageOrderType.TRIAL ? (
                        <Tag color='#87d068'>TRIAL</Tag>
                    ) : record?.is_regular_booking ? (
                        <Tag color='#f50'>REGULAR</Tag>
                    ) : (
                        <Tag color='#108ee9'>FLEXIBLE</Tag>
                    )}
                </>
            )
        },
        {
            title: 'Class',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Teacher:</b>
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1 mt-1'>
                                {text?.skype_account}
                            </span>
                            <br />
                            {record?.learning_medium.medium_type ===
                                EnumBookingMediumType.HAMIA_MEET &&
                                record?.learning_medium?.info?.teacher_link && (
                                    <>
                                        <VideoCameraOutlined className='mr-2' />
                                        <span className='ml-1 mt-1'>
                                            {
                                                record?.learning_medium?.info
                                                    ?.teacher_link
                                            }
                                        </span>
                                        <br />
                                    </>
                                )}
                            <b>Student:</b>
                            <NameTeacherStudent
                                data={record?.student}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <PhoneOutlined className='mr-2' />
                            <span className='ml-1 mt-1'>
                                {record.student && record.student.phone_number}
                            </span>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1 mt-1'>
                                {record.student && record.student.skype_account}
                            </span>
                            {record?.learning_medium.medium_type ===
                                EnumBookingMediumType.HAMIA_MEET &&
                                record?.learning_medium?.info?.student_link && (
                                    <>
                                        <br />
                                        <VideoCameraOutlined className='mr-2' />
                                        <span className='ml-1 pt-2 mt-2'>
                                            {
                                                record?.learning_medium?.info
                                                    ?.student_link
                                            }
                                        </span>
                                    </>
                                )}
                        </>
                    }
                >
                    <div>
                        <p className='mb-2'>
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                        </p>
                    </div>
                    <p>
                        <b>Student:</b>{' '}
                        <NameTeacherStudent
                            data={record?.student}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
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
            title: 'Note',
            dataIndex: 'teacher_note',
            key: 'teacher_note',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    title=''
                    content={
                        <div style={{ width: '400px' }}>
                            <b>Note for Teacher: </b>
                            {text}
                            <br />
                            <b>CS note: </b>
                            {record && record.cskh_note}
                            <br />
                            <b>HT & QTGV note: </b>
                            {record && record.admin_note}
                        </div>
                    }
                >
                    <p className='mb-0'>
                        <b>Note for Teacher: </b>
                        {text && text.length > 50
                            ? `${text.substring(0, 50)}...`
                            : text}
                    </p>
                    <p className='mb-0'>
                        <b>CS note: </b>
                        {record.cskh_note && record.cskh_note.length > 50
                            ? `${record.cskh_note.substring(0, 50)}...`
                            : record.cskh_note}
                    </p>
                    <p className='mb-0'>
                        <b>HT & QTGV note: </b>
                        {record.admin_note && record.admin_note.length > 50
                            ? `${record.admin_note.substring(0, 50)}...`
                            : record.admin_note}
                    </p>
                </Popover>
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
        },
        {
            title: 'Created Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <>
                    <p>{text && moment(text).format('HH:mm DD/MM/YYYY')}</p>
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: (text, record) => {
                return record.status !== ENUM_BOOKING_STATUS.CHANGE_TIME ? (
                    <Dropdown overlay={menuActions(record)} trigger={['click']}>
                        <EllipsisOutlined />
                    </Dropdown>
                ) : (
                    <></>
                )
            }
        }
    ]

    const searchDataUserTeacher = (data) => {
        if (data.selected) {
            const searchText = data.selected.user_id
            setQueryParams({
                ...queryParams,
                id: '',
                teacher_id: searchText
            })
        }
        if (data.clear) {
            setQueryParams({
                ...queryParams,
                id: '',
                teacher_id: ''
            })
        }
    }
    const searchDataUserStudent = (data) => {
        if (data.selected) {
            const searchText = data.selected.id
            setQueryParams({
                ...queryParams,
                id: '',
                student_id: searchText
            })
        }
        if (data.clear) {
            setQueryParams({
                ...queryParams,
                id: '',
                student_id: ''
            })
        }
    }

    const onSearchAll = () => {
        if (queryUrl.get('id')) {
            setQueryParams({
                ...queryParams,
                id: '',
                student_id: ''
            })
        }
        getAllBookings({ ...queryParams, page_size: pageSize, page_number: 1 })
        fetchStatisticBooking({ ...queryParams })
        setPageNumber(1)
    }

    // const filterEngines: IFilterEngine[] = [
    //     {
    //         label: 'Date time',
    //         engine: (
    //             <RangePicker
    //                 allowClear={false}
    //                 showTime={{ format: 'HH:mm' }}
    //                 format='YYYY-MM-DD HH:mm'
    //                 onChange={handleRangePicker}
    //                 disabledDate={disabledDateTime}
    //                 value={[
    //                     queryParams.min_start_time,
    //                     queryParams.max_end_time
    //                 ]}
    //             />
    //         )
    //     },
    //     {
    //         label: 'Type',
    //         engine: (
    //             <Select
    //                 allowClear
    //                 showArrow
    //                 placeholder='Filter by booking type'
    //                 mode='tags'
    //                 value={queryParams.type}
    //                 onChange={(val) =>
    //                     setQueryParams({
    //                         ...queryParams,
    //                         id: '',
    //                         type: val
    //                     })
    //                 }
    //             >
    //                 {Object.keys(EnumBookingTypes)
    //                     .filter(
    //                         (key: any) => !isNaN(Number(EnumBookingTypes[key]))
    //                     )
    //                     .map((key: any) => (
    //                         <Option
    //                             value={EnumBookingTypes[key]}
    //                             key={EnumBookingTypes[key]}
    //                         >
    //                             {_.capitalize(key)}
    //                         </Option>
    //                     ))}
    //             </Select>
    //         )
    //     },
    //     {
    //         label: 'Status',
    //         engine: (
    //             <Select
    //                 allowClear
    //                 showArrow
    //                 placeholder='Filter by status'
    //                 value={queryParams.status}
    //                 onChange={(val) =>
    //                     setQueryParams({
    //                         ...queryParams,
    //                         status: val,
    //                         id: ''
    //                     })
    //                 }
    //             >
    //                 <Option value='' key={-1}>
    //                     ALL STATUS
    //                 </Option>
    //                 {Object.keys(ENUM_BOOKING_STATUS)
    //                     .filter(
    //                         (key: any) =>
    //                             !isNaN(Number(ENUM_BOOKING_STATUS[key]))
    //                     )
    //                     .map((key: any) => (
    //                         <Option
    //                             value={ENUM_BOOKING_STATUS[key]}
    //                             key={ENUM_BOOKING_STATUS[key]}
    //                         >
    //                             {_.upperCase(_.startCase(key))}
    //                         </Option>
    //                     ))}
    //             </Select>
    //         )
    //     },
    //     {
    //         label: 'Staff',
    //         engine: (
    //             <Select
    //                 defaultValue={queryParams.staff_id}
    //                 style={{ width: '100%' }}
    //                 onChange={_.debounce(onSearchStaff, 250)}
    //             >
    //                 <Select.Option value=''>All</Select.Option>
    //                 {staffs.map((item, index) => (
    //                     <Select.Option
    //                         key={`staff_id${index}`}
    //                         value={item.value}
    //                     >
    //                         {_.capitalize(item.label)}
    //                     </Select.Option>
    //                 ))}
    //             </Select>
    //         )
    //     },
    //     {
    //         label: 'Teacher',
    //         engine: (
    //             <SearchUser
    //                 api={TeacherAPI.getAllTeachers}
    //                 placeholder='Search by teacher'
    //                 searchDataUser={searchDataUserTeacher}
    //             ></SearchUser>
    //         )
    //     },
    //     {
    //         label: 'Student',
    //         engine: (
    //             <SearchUser
    //                 api={StudentAPI.getAllStudents}
    //                 placeholder='Search by student'
    //                 searchDataUser={searchDataUserStudent}
    //             ></SearchUser>
    //         )
    //     },
    //     {
    //         label: '',
    //         engine: (
    //             <Button
    //                 type='primary'
    //                 style={{ width: 50 }}
    //                 disabled={values.isLoading}
    //                 onClick={() => onSearchAll()}
    //             >
    //                 Search
    //             </Button>
    //         )
    //     }
    // ]

    const showStatistic = () => {
        if (isLoadingStatistic) {
            return <Spin spinning={isLoadingStatistic} />
        }

        if (values.bookings.length > 0) {
            return (
                <>
                    <Row className={cn(styles.statistic)}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p>Tổng số lớp: {statistic?.total_class}</p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6} />
                    </Row>
                    <Row className={cn(styles.statistic)}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.completed)}>
                                Tổng số lớp đã hoàn thành:{' '}
                                {statistic?.total_completed}
                            </p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6} />
                    </Row>
                    <Row className={cn(styles.statistic)}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp bị hủy: {statistic?.total_cancel}
                            </p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp vắng: {statistic?.total_absent}
                            </p>
                        </Col>
                    </Row>
                    <Row className={cn(styles.statistic)}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp bị hủy bởi giáo viên:{' '}
                                {statistic?.total_cancel_by_teacher}
                            </p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp báo vắng bởi giáo viên:{' '}
                                {statistic?.total_absent_by_teacher}
                            </p>
                        </Col>
                    </Row>
                    <Row className={cn(styles.statistic)}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp bị hủy bởi học viên:{' '}
                                {statistic?.total_cancel_by_student}
                            </p>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                            <p className={cn(styles.cancel)}>
                                Tổng số lớp báo vắng bởi học viên:{' '}
                                {statistic?.total_absent_by_student}
                            </p>
                        </Col>
                    </Row>
                </>
            )
        }

        return <></>
    }

    return (
        <Card title='Bookings Management'>
            {/* <FilterDataWrapper
                extensionOut={[]}
                engines={filterEngines}
            ></FilterDataWrapper> */}
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearchAll}
                    >
                        <Row className='mb-2 justify-content-start' gutter={12}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Date time</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='range_date'
                                            className='mb-0 w-100'
                                        >
                                            <RangePicker
                                                allowClear={false}
                                                showTime={{ format: 'HH:mm' }}
                                                format='YYYY-MM-DD HH:mm'
                                                onChange={handleRangePicker}
                                                disabledDate={disabledDateTime}
                                                defaultValue={[
                                                    moment().startOf('month'),
                                                    moment().endOf('month')
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Type</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='type'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                allowClear
                                                showArrow
                                                placeholder='Filter by booking type'
                                                mode='tags'
                                                defaultValue={[
                                                    EnumBookingTypes.FLEXIBLE,
                                                    EnumBookingTypes.REGULAR
                                                ]}
                                                onChange={(val) =>
                                                    setQueryParams({
                                                        ...queryParams,
                                                        id: '',
                                                        type: val
                                                    })
                                                }
                                            >
                                                {Object.keys(EnumBookingTypes)
                                                    .filter(
                                                        (key: any) =>
                                                            !isNaN(
                                                                Number(
                                                                    EnumBookingTypes[
                                                                        key
                                                                    ]
                                                                )
                                                            )
                                                    )
                                                    .map((key: any) => (
                                                        <Option
                                                            value={
                                                                EnumBookingTypes[
                                                                    key
                                                                ]
                                                            }
                                                            key={
                                                                EnumBookingTypes[
                                                                    key
                                                                ]
                                                            }
                                                        >
                                                            {_.capitalize(key)}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Status</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                allowClear
                                                showArrow
                                                placeholder='Filter by status'
                                                defaultValue={
                                                    queryParams.status
                                                }
                                                onChange={(val) =>
                                                    setQueryParams({
                                                        ...queryParams,
                                                        status: val,
                                                        id: ''
                                                    })
                                                }
                                            >
                                                <Option value='' key={-1}>
                                                    ALL STATUS
                                                </Option>
                                                {Object.keys(
                                                    ENUM_BOOKING_STATUS
                                                )
                                                    .filter(
                                                        (key: any) =>
                                                            !isNaN(
                                                                Number(
                                                                    ENUM_BOOKING_STATUS[
                                                                        key
                                                                    ]
                                                                )
                                                            )
                                                    )
                                                    .map((key: any) => (
                                                        <Option
                                                            value={
                                                                ENUM_BOOKING_STATUS[
                                                                    key
                                                                ]
                                                            }
                                                            key={
                                                                ENUM_BOOKING_STATUS[
                                                                    key
                                                                ]
                                                            }
                                                        >
                                                            {_.upperCase(
                                                                _.startCase(key)
                                                            )}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Staff</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='staff'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    queryParams.staff_id
                                                }
                                                style={{ width: '100%' }}
                                                onChange={_.debounce(
                                                    onSearchStaff,
                                                    250
                                                )}
                                            >
                                                <Select.Option value=''>
                                                    All
                                                </Select.Option>
                                                {staffs.map((item, index) => (
                                                    <Select.Option
                                                        key={`staff_id${index}`}
                                                        value={item.value}
                                                    >
                                                        {_.capitalize(
                                                            item.label
                                                        )}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Teacher</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='teacher'
                                            className='mb-0 w-100'
                                        >
                                            <SearchUser
                                                api={TeacherAPI.getAllTeachers}
                                                placeholder='Search by teacher'
                                                searchDataUser={
                                                    searchDataUserTeacher
                                                }
                                            ></SearchUser>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={7}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={22}>Student</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            name='student'
                                            className='mb-0 w-100'
                                        >
                                            <SearchUser
                                                api={StudentAPI.getAllStudents}
                                                placeholder='Search by student'
                                                searchDataUser={
                                                    searchDataUserStudent
                                                }
                                            ></SearchUser>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col style={{ marginTop: 21 }}>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    disabled={values.isLoading}
                                >
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>

            {showStatistic()}

            <Table
                dataSource={values.bookings}
                loading={values.isLoading}
                columns={columns}
                scroll={{
                    x: 500,
                    y: 700
                }}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: IBooking) => record?._id}
                bordered
                sticky
            />

            <UpdateStatusModal
                visible={values.visibleUpdateStatus}
                toggleModal={toggleUpdateStatusModal}
                booking={values.selected_booking}
                refetchData={refetchData}
            />

            <UpdateUnitModal
                visible={values.visibleUpdateUnit}
                toggleModal={toggleUpdateUnitModal}
                booking={values.selected_booking}
                refetchData={refetchData}
            />

            <UpdateNoteModal
                visible={values.visibleUpdateNote}
                toggleModal={toggleUpdateNoteModal}
                booking={values.selected_booking}
                refetchData={refetchData}
            />

            <ViewAllModal
                visible={values.visibleViewAll}
                toggleModal={toggleViewAllModal}
                booking={values.selected_booking}
            />

            <UpdateTimeModal
                visible={isShownModalChangeTime}
                toggleModal={toggleModalChangeTime}
                data={selectedBooking2}
                reload={refetchData}
            ></UpdateTimeModal>
        </Card>
    )
}

export default Overview
