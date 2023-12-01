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
import {
    EllipsisOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    SkypeOutlined
} from '@ant-design/icons'
import BookingAPI from 'api/BookingAPI'
import moment from 'moment'
import _ from 'lodash'
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
import NameTeacherStudent from 'components/name-teacher-student'
import { Link } from 'react-router-dom'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const TestResultReport: FunctionComponent = () => {
    const queryUrl = new URLSearchParams(window.location.search)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            bookings: [],
            isLoading: false
        }
    )

    const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [queryParams, setQueryParams] = useState({
        type: [EnumBookingTypes.TRIAL],
        search: '',
        // min_test_start_time: moment().startOf('month'),
        // max_test_start_time: moment().endOf('month'),
        min_test_start_time: null,
        max_test_start_time: null,
        sort: 'prev',
        id: queryUrl.get('id')
    })

    const getAllTrialBookingsWithTestResults = (query?: {
        page_size: number
        page_number: number
        sort?: string
        search?: string
        min_test_start_time?: any
        max_test_start_time?: any
    }) => {
        setValues({ isLoading: true })

        const filter = {
            ...query
        }
        if (filter.min_test_start_time)
            filter.min_test_start_time = moment(filter.min_test_start_time)
                .startOf('d')
                .valueOf()
        if (filter.max_test_start_time)
            filter.max_test_start_time = moment(filter.max_test_start_time)
                .endOf('d')
                .valueOf()
        BookingAPI.getAllTrialBookingsWithTestResults(filter)
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
        getAllTrialBookingsWithTestResults({
            ...queryParams,
            page_size: pageSize,
            page_number: 1
        })
        setPageNumber(1)
    }, [queryParams])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            getAllTrialBookingsWithTestResults({
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
                min_test_start_time: value[0],
                max_test_start_time: value[1]
            })
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const onSearch = (value) => {
        setQueryParams({ ...queryParams, search: value })
    }

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().add(6, 'month'))

    const getAge = (testStartTime, dateOfBirth) => {
        if (!testStartTime || !dateOfBirth) {
            return null
        }

        // const today = new Date()
        // const birthDate = new Date(dateString)
        // let age = today.getFullYear() - birthDate.getFullYear()
        // const m = today.getMonth() - birthDate.getMonth()
        // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        //     age--
        // }
        // return age
        return moment
            .unix(testStartTime / 1000)
            .diff(moment(dateOfBirth, 'YYYY'), 'years')
    }

    const floorAfterDecimal = (value, precision) => {
        if (!value) {
            return value
        }

        // eslint-disable-next-line no-restricted-properties
        const multiplier = Math.pow(10, precision || 0)
        return Math.floor(value * multiplier) / multiplier
    }

    const calculateScore = (score_1, score_2, precision) => {
        if (!score_1) {
            score_1 = 0
        }

        if (!score_2) {
            score_2 = 0
        }

        return floorAfterDecimal((score_1 + score_2) / 2, precision)
    }

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
                search: queryParams.search,
                min_test_start_time: queryParams.min_test_start_time
                    ? moment(queryParams.min_test_start_time)
                          .startOf('d')
                          .valueOf()
                    : null,
                max_test_start_time: queryParams.max_test_start_time
                    ? moment(queryParams.max_test_start_time)
                          .endOf('d')
                          .valueOf()
                    : null
            }
            const response =
                await BookingAPI.getAllTrialBookingsWithTestResults(filter)
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
                    const temp = []
                    temp.push(index + 1)
                    temp.push(
                        `${booking.student?.full_name} - ${booking.student?.username}`
                    )
                    temp.push(
                        getAge(
                            booking.test_start_time,
                            booking.student?.date_of_birth
                        )
                    )
                    temp.push(
                        `${booking.teacher?.full_name} - ${booking.teacher?.username}`
                    )
                    temp.push(booking.student?.phone_number)
                    temp.push(booking.id)
                    temp.push(booking.test_topic_name)
                    temp.push(
                        booking.test_start_time &&
                            moment
                                .unix(booking.test_start_time / 1000)
                                .format('DD-MM-YYYY HH:mm')
                    )
                    temp.push(
                        booking.test_result?.submission_time &&
                            moment
                                .unix(
                                    booking.test_result?.submission_time / 1000
                                )
                                .format('DD-MM-YYYY HH:mm')
                    )
                    temp.push(booking.test_result?.vocabulary)
                    temp.push(booking.test_result?.reading)
                    temp.push(booking.test_result?.writing)
                    temp.push(booking.test_result?.grammar)
                    temp.push(booking.test_result?.listening)
                    temp.push(booking.test_result?.speaking)
                    temp.push(
                        calculateScore(
                            booking.test_result?.vocabulary,
                            booking.test_result?.reading,
                            1
                        )
                    )
                    temp.push(
                        calculateScore(
                            booking.test_result?.writing,
                            booking.test_result?.grammar,
                            1
                        )
                    )
                    return temp
                }
            )
            const cols = [
                'STT',
                'Họ tên',
                'Tuổi',
                'Giáo viên',
                'SĐT',
                'Booking ID',
                'Topic name',
                'Thời gian tham gia làm bài',
                'Thời gian nộp bài',
                'Từ vựng',
                'Đọc',
                'Viết',
                'Ngữ pháp',
                'Listening',
                'Speaking',
                'Reading\n[* = (Từ vựng + Đọc) /2]',
                'Writing\n[* = (Viết + Ngữ pháp) /2]'
            ]

            exportToTrialBookingExcel('test_result', cols, data)
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setIsExportingExcel(false)
    }

    const columns: ColumnsType<IBooking> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: 'left',
            align: 'center',
            width: 80,
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Họ tên',
            dataIndex: 'student',
            key: 'student',
            fixed: 'left',
            align: 'left',
            width: 250,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Tuổi',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: 80,
            render: (text, record, index) =>
                getAge(
                    values.bookings[index].test_start_time,
                    text.date_of_birth
                )
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 250,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'SĐT',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: 120,
            render: (text, record) => text.phone_number
        },
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 150,
            render: (text, record) =>
                text && (
                    <Link to={`/teaching/overview/?id=${text}`}>{text}</Link>
                )
        },
        {
            title: 'Topic name',
            dataIndex: 'test_topic_name',
            key: 'test_topic_name',
            align: 'left',
            width: 250,
            render: (text, record) => text
        },
        {
            title: 'Thời gian tham gia làm bài',
            dataIndex: 'test_start_time',
            key: 'test_start_time',
            align: 'center',
            width: 150,
            render: (text, record) =>
                text && moment.unix(text / 1000).format('DD-MM-YYYY HH:mm')
        },
        {
            title: 'Thời gian nộp bài',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'center',
            width: 150,
            render: (text, record) =>
                text?.submission_time &&
                moment
                    .unix(text.submission_time / 1000)
                    .format('DD-MM-YYYY HH:mm')
        },
        {
            title: 'Từ vựng',
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) => text?.vocabulary
        },
        {
            title: 'Đọc',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'center',
            width: 100,
            render: (text, record) => text?.reading
        },
        {
            title: 'Viết',
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) => text?.writing
        },
        {
            title: 'Ngữ pháp',
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) => text?.grammar
        },
        {
            title: 'Listening',
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) => text?.listening
        },
        {
            title: 'Speaking',
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) => text?.speaking
        },
        {
            title: (
                <Popover content={<>* = (Từ vựng + Đọc) /2</>}>Reading</Popover>
            ),
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) =>
                calculateScore(text?.vocabulary, text?.reading, 1)
        },
        {
            title: (
                <Popover content={<>* = (Viết + Ngữ pháp) /2</>}>
                    Writing
                </Popover>
            ),
            dataIndex: 'test_result',
            key: 'test_result',
            width: 100,
            align: 'center',
            render: (text, record) =>
                calculateScore(text?.writing, text?.grammar, 1)
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Test start time',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    disabledDate={disabledDateTime}
                    value={[
                        queryParams.min_test_start_time,
                        queryParams.max_test_start_time
                    ]}
                />
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
        <Card title='Test Result Report'>
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
        </Card>
    )
}

export default TestResultReport
