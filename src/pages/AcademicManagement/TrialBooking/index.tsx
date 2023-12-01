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
    Input,
    Tag,
    Popover,
    Row,
    Col,
    Select,
    Spin,
    Button,
    notification
} from 'antd'
import { Link } from 'react-router-dom'
import {
    EllipsisOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    SkypeOutlined
} from '@ant-design/icons'
import BookingAPI from 'api/BookingAPI'
import moment from 'moment'
import _, { update } from 'lodash'
import { EnumPackageOrderType, IBooking, IStatisticBooking } from 'types'
import { ColumnsType } from 'antd/lib/table'
import {
    EnumBookingTypes,
    ENUM_BOOKING_STATUS,
    ENUM_MEMO_NOTE_FIELD,
    ENUM_MEMO_OTHER_NOTE_FIELD
} from 'const'
import { notify } from 'utils/notify'
import cn from 'classnames'
import { exportToTrialBookingExcel } from 'utils/export-xlsx'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import styles from './index.module.scss'
import NameTeacherStudent from 'components/name-teacher-student'
import { render } from '@testing-library/react'
import AddAdviceLetterModel from '../../AdviceLetter/AllAdviceLetter/modals/AddAdviceLetterModalWithBooking'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const Overview: FunctionComponent = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [isShowAddModal, setShowAddModal] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            bookings: [],
            isLoading: false
        }
    )

    const toggleAddModal = (value) => {
        setShowAddModal(value)
    }

    const [statistic, setStatistic] = useState<IStatisticBooking>()
    const [isLoadingStatistic, setLoadingStatistic] = useState<boolean>(false)
    const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [total, setTotal] = useState<number>(0)
    const [queryParams, setQueryParams] = useState({
        type: [EnumBookingTypes.TRIAL],
        status: '',
        search: '',
        min_start_time: moment().startOf('month'),
        max_end_time: moment().endOf('month'),
        sort: 'prev',
        id: queryUrl.get('id')
    })

    const fetchStatisticBooking = (query?: {
        status?: number | string
        search?: string
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

    useEffect(() => {
        getAllBookings({ ...queryParams, page_size: pageSize, page_number: 1 })
        fetchStatisticBooking({ ...queryParams })
        setPageNumber(1)
        setSubmitSuccess(false)
    }, [queryParams, submitSuccess])

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
                max_end_time: value[1]
            })
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const handleAddTTV = (item) => {
        const data = JSON.parse(JSON.stringify(item))
        const selectedTrialData = {
            _id: data.id,
            user: data.student
        }
        setValues({ selectedTrialReport: selectedTrialData })
        toggleAddModal(true)
    }

    const handleViewTTV = (item) => {
        const data = JSON.parse(JSON.stringify(item))
    }

    const onSearch = (value) => {
        setQueryParams({ ...queryParams, search: value })
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

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().add(6, 'month'))

    const handleExportExcel = async (e) => {
        e.preventDefault()

        if (values.isLoading || isExportingExcel) {
            notification.error({
                message: 'Error',
                description: 'No data'
            })
            return
        }

        setIsExportingExcel(true)
        try {
            const filter = {
                page_size: total,
                page_number: 1,
                type: [EnumBookingTypes.TRIAL],
                status: queryParams.status,
                search: queryParams.search,
                min_start_time: moment(queryParams.min_start_time)
                    .startOf('d')
                    .valueOf(),
                max_end_time: moment(queryParams.max_end_time)
                    .endOf('d')
                    .valueOf()
            }
            const response = await BookingAPI.getAllBookings(filter)
            if (!response || response?.data.length === 0) {
                setIsExportingExcel(false)

                notification.error({
                    message: 'Error',
                    description: 'No data'
                })
                setIsExportingExcel(false)
                return
            }
            const data = response.data.map(
                (booking: IBooking, index: number) => {
                    let record_link = ''
                    if (booking?.record_link) {
                        if (typeof booking.record_link !== 'string') {
                            record_link = booking.record_link.join('\n')
                        } else {
                            record_link = booking.record_link
                        }
                    }

                    const age = booking.student?.date_of_birth
                        ? moment().diff(
                              moment(booking.student.date_of_birth, 'YYYY'),
                              'years'
                          )
                        : 0

                    let saleName = ''
                    if (booking.student?.crm?.sale_name) {
                        saleName = `${booking.student.crm.sale_name} (${booking.student.crm.source} -${booking.student.crm.sale_user_id})`
                    }

                    const studentLevel = booking?.memo?.student_starting_level
                        ? `${booking.memo.student_starting_level.id} - ${
                              booking.memo.student_starting_level.name || ''
                          }`
                        : ''

                    let strength = ''
                    let weakness = ''
                    if (booking?.memo?.other) {
                        const strengthAssessment = booking.memo.other.find(
                            (i: any) =>
                                i.keyword ===
                                ENUM_MEMO_OTHER_NOTE_FIELD.strength
                        )
                        if (strengthAssessment) {
                            strength = strengthAssessment.comment
                        }
                        const weaknessAssessment = booking.memo.other.find(
                            (i: any) =>
                                i.keyword ===
                                ENUM_MEMO_OTHER_NOTE_FIELD.weakness
                        )
                        if (weaknessAssessment) {
                            weakness = weaknessAssessment.comment
                        }
                    }

                    const temp = []
                    temp.push(index + 1)
                    temp.push(booking.id)
                    temp.push(
                        moment(booking.calendar.start_time).format(
                            'DD/MM/YYYY HH:mm '
                        )
                    )
                    temp.push(`${booking?.student?.full_name}`)
                    temp.push(age)
                    temp.push(`${booking.student?.phone_number || ''}`)
                    temp.push(`${booking.student.email}`)
                    temp.push(`${booking.student?.skype_account || ''}`)
                    temp.push(`${booking?.teacher?.full_name}`)
                    temp.push(booking.teacher_note)
                    temp.push(booking.teacher?.skype_account || '')
                    temp.push(ENUM_BOOKING_STATUS[booking.status])
                    temp.push(record_link)
                    temp.push(booking.admin_note)
                    temp.push(studentLevel)
                    temp.push(strength)
                    temp.push(weakness)
                    temp.push(saleName)
                    temp.push(`${booking.unit.name} (${booking.unit.id})`)
                    return temp
                }
            )
            const cols = [
                'STT',
                'Booking ID',
                'Ngày',
                'Tên học viên',
                'Tuổi',
                'Điện thoại',
                'Email',
                'Skype học viên',
                'Tên giáo viên',
                'Giáo viên Note',
                'Skype giáo viên',
                'Trạng thái',
                'Link video',
                'Note',
                'Trình độ',
                'Điểm mạnh',
                'Điểm yếu',
                'Nhân viên Sale',
                'Unit'
            ]
            exportToTrialBookingExcel('list_trial_booking', cols, data)
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setIsExportingExcel(false)
    }

    const hasHTTPUrl = (url: string) => {
        if (url.indexOf('http') !== -1) {
            return true
        }
        return false
    }
    const handleViewVideo = (record: string) => {
        if (hasHTTPUrl(record)) {
            window.open(record, '_blank')
        }
    }

    const columns: ColumnsType<IBooking> = [
        {
            title: 'No',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record, index) => index + 1
        },
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
            title: 'Sale',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: 120,
            render: (text, record) => text?.crm?.sale_name || ''
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
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>{text?.skype_account}</span>
                            <br />
                            <b>Student:</b>
                            <NameTeacherStudent
                                data={record.student}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <PhoneOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student && record.student?.phone_number}
                            </span>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student &&
                                    record.student?.skype_account}
                            </span>
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
                            data={record.student}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                </Popover>
            )
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    title=''
                    content={
                        <>
                            <b>
                                Course: {record.course && record.course?.name}
                            </b>
                            <br />
                            <b>Unit: {record.unit && record.unit?.name}</b>
                        </>
                    }
                >
                    <span>{text && text.name}</span>
                </Popover>
            )
        },
        {
            title: 'Video',
            dataIndex: 'record_link',
            key: 'record_link',
            align: 'center',
            width: 120,
            render: (text, record) => {
                if (Array.isArray(text)) {
                    if (text.length > 0) {
                        return (
                            <div>
                                {text.map((link, index) => (
                                    <div key={index} className='mt-2'>
                                        <Button
                                            onClick={() =>
                                                handleViewVideo(link)
                                            }
                                            type='primary'
                                        >
                                            Video {index + 1}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    return <></>
                }

                if (typeof text === 'string') {
                    return (
                        <div>
                            <Button
                                onClick={() => handleViewVideo(text)}
                                type='primary'
                            >
                                Video
                            </Button>
                        </div>
                    )
                }

                return <></>
            }
        },
        {
            title: 'Test Result',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'left',
            width: 300,
            render: (text, record) => {
                if (record?.test_result) {
                    const vocabularyScore =
                        (record.test_result?.vocabulary ||
                            record.test_result?.vocabulary === 0) &&
                        record.test_result?.vocabulary !== 'undefined'
                            ? record.test_result?.vocabulary
                            : null
                    const readingScore =
                        (record.test_result?.reading ||
                            record.test_result?.reading === 0) &&
                        record.test_result?.reading !== 'undefined'
                            ? record.test_result?.reading
                            : null
                    const writingScore =
                        (record.test_result?.writing ||
                            record.test_result?.writing === 0) &&
                        record.test_result?.writing !== 'undefined'
                            ? record.test_result?.writing
                            : null
                    const grammarScore =
                        (record.test_result?.grammar ||
                            record.test_result?.grammar === 0) &&
                        record.test_result?.grammar !== 'undefined'
                            ? record.test_result?.grammar
                            : null
                    const listeningScore =
                        (record.test_result?.listening ||
                            record.test_result?.listening === 0) &&
                        record.test_result?.listening !== 'undefined'
                            ? record.test_result?.listening
                            : null
                    const speakingScore =
                        (record.test_result?.speaking ||
                            record.test_result?.speaking === 0) &&
                        record.test_result?.speaking !== 'undefined'
                            ? record.test_result?.speaking
                            : null
                    let totalScore = null

                    if (vocabularyScore !== null) {
                        totalScore = 0
                        totalScore += vocabularyScore
                    }
                    if (readingScore !== null) {
                        if (totalScore === null) {
                            totalScore = 0
                        }

                        totalScore += readingScore
                    }
                    if (writingScore !== null) {
                        if (totalScore === null) {
                            totalScore = 0
                        }

                        totalScore += writingScore
                    }
                    if (grammarScore !== null) {
                        if (totalScore === null) {
                            totalScore = 0
                        }

                        totalScore += grammarScore
                    }
                    if (listeningScore !== null) {
                        if (totalScore === null) {
                            totalScore = 0
                        }

                        totalScore += listeningScore
                    }
                    if (speakingScore !== null) {
                        if (totalScore === null) {
                            totalScore = 0
                        }

                        totalScore += speakingScore
                    }

                    return (
                        <div className='text-left'>
                            {vocabularyScore !== null && (
                                <p>
                                    <b>Vocabulary: </b> {vocabularyScore}
                                </p>
                            )}
                            {readingScore !== null && (
                                <p>
                                    <b>Reading: </b> {readingScore}
                                </p>
                            )}
                            {writingScore !== null && (
                                <p>
                                    <b>Writing: </b> {writingScore}
                                </p>
                            )}
                            {grammarScore !== null && (
                                <p>
                                    <b>Grammar: </b> {grammarScore}
                                </p>
                            )}
                            {listeningScore !== null && (
                                <p>
                                    <b>Listening: </b> {listeningScore}
                                </p>
                            )}
                            {speakingScore !== null && (
                                <p>
                                    <b>Speaking: </b> {speakingScore}
                                </p>
                            )}

                            {totalScore !== null && (
                                <p>
                                    <b>Total: </b> {totalScore}
                                </p>
                            )}
                        </div>
                    )
                }

                return <></>
            }
        },
        {
            title: 'Memo',
            dataIndex: 'memo',
            key: 'memo',
            align: 'left',
            width: 120,
            render: (text, record: any) => {
                const memo = record?.memo?.note
                if (Array.isArray(memo) && memo.length > 0) {
                    const totalPoint = memo.reduce((prev, cur) => {
                        return prev + cur?.point
                    }, 0)

                    return (
                        <Popover
                            title=''
                            content={
                                <div style={{ width: '400px' }}>
                                    {memo.map((item) => (
                                        <>
                                            <b>{item?.keyword}</b>
                                            {item?.comment} ({item?.point})
                                            <br />
                                        </>
                                    ))}
                                </div>
                            }
                        >
                            <p className='mb-0'>
                                <b>Điểm: </b>
                                {(totalPoint / memo.length).toFixed(2)}
                            </p>
                        </Popover>
                    )
                }
                return <></>
            }
        },
        {
            title: 'Note',
            dataIndex: 'teacher_note',
            key: 'teacher_note',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <div style={{ overflow: 'hidden' }}>
                    <Popover
                        title=''
                        content={
                            <div style={{ width: '400px' }}>
                                <b>Note for Teacher: </b>
                                {record && record.teacher_note}
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
                </div>
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
            title: 'Advice letter',
            dataIndex: 'advice_letter',
            key: 'advice_letter',
            align: 'center',
            width: 180,
            render: (text, record) => {
                const hasAdviceLetters = record.advice_letters

                if (record.status === 1) {
                    if (hasAdviceLetters) {
                        return (
                            <Link
                                to={`/al/all-advice-letter?search=${record?.student?.username}`}
                            >
                                View TTV
                            </Link>
                        )
                    }
                    return (
                        <Button
                            type='primary'
                            onClick={() => handleAddTTV(record)}
                        >
                            Add TTV
                        </Button>
                    )
                }

                return null
            }
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    disabledDate={disabledDateTime}
                    value={[
                        queryParams.min_start_time,
                        queryParams.max_end_time
                    ]}
                />
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={queryParams.status}
                    onChange={(val) =>
                        setQueryParams({ ...queryParams, status: val })
                    }
                >
                    <Option value='' key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(ENUM_BOOKING_STATUS)
                        .filter(
                            (key: any) =>
                                !isNaN(Number(ENUM_BOOKING_STATUS[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={ENUM_BOOKING_STATUS[key]}
                                key={ENUM_BOOKING_STATUS[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='Enter text to search'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Trial Booking'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.amtb_export_excel) ? (
                        <Button
                            style={{ width: '100%' }}
                            type='primary'
                            onClick={handleExportExcel}
                            disabled={values.isLoading || isExportingExcel}
                        >
                            <Spin
                                size='small'
                                className='mr-2'
                                spinning={values.isLoading || isExportingExcel}
                            />
                            Export Excel
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            {isLoadingStatistic ? (
                <Spin spinning={isLoadingStatistic} />
            ) : (
                values.bookings.length > 0 && (
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
                                    Tổng số lớp bị hủy:{' '}
                                    {statistic?.total_cancel}
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
            )}
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
            <AddAdviceLetterModel
                visible={isShowAddModal}
                toggleModal={toggleAddModal}
                data={values.selectedTrialReport}
                updateData={() => setSubmitSuccess(true)}
            />
        </Card>
    )
}

export default Overview
