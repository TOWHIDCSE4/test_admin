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
    notification,
    Input,
    Tag,
    Popover,
    Row,
    Col,
    Select
} from 'antd'
import { PhoneOutlined, SkypeOutlined } from '@ant-design/icons'
import BookingAPI from 'api/BookingAPI'
import moment from 'moment'
import _ from 'lodash'
import { EnumPackageOrderType, IBooking } from 'types'
import { ColumnsType } from 'antd/lib/table'
import { EnumBookingTypes } from 'const'
import { notify } from 'utils/notify'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const ClassVideos: FunctionComponent = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            bookings: [],
            isLoading: false
        }
    )

    const [queryParams, setQueryParams] = useState({
        type: [EnumBookingTypes.FLEXIBLE, EnumBookingTypes.REGULAR],
        search: '',
        min_start_time: moment().startOf('month'),
        max_end_time: moment().endOf('month'),
        sort: 'prev'
    })
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)

    const getAllBookings = (query?: {
        page_size: number
        page_number: number
        sort?: string
        search?: string
        min_start_time?: any
        max_end_time?: any
        type?: number[]
    }) => {
        setValues({ isLoading: true })
        const filter = {
            ...query,
            recorded: true
        }
        if (filter.min_start_time)
            filter.min_start_time = filter.min_start_time.valueOf()
        if (filter.max_end_time)
            filter.max_end_time = filter.max_end_time.valueOf()
        BookingAPI.getAllBookings(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setValues({ bookings: res.data })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllBookings({ ...queryParams, page_size: pageSize, page_number: 1 })
        setPageNumber(1)
    }, [queryParams])

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
        if (value[0] && value[1] && value[0] < value[1]) {
            setQueryParams({
                ...queryParams,
                min_start_time: value[0],
                max_end_time: value[1]
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

    const columns: ColumnsType<IBooking> = [
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            render: (text) => text
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
                                data={record?.student}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <PhoneOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student && record.student.phone_number}
                            </span>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>
                                {record.student && record.student.skype_account}
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
                <Popover
                    title=''
                    content={
                        <>
                            <br />
                            <b>Course: {text && text.name}</b>
                            <br />
                            <b>Unit: {record.unit && record.unit.name}</b>
                        </>
                    }
                >
                    <span>{text && text.name}</span>
                </Popover>
            )
        },
        {
            title: 'Link Video',
            key: 'record_link',
            dataIndex: 'record_link',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: (text, record) =>
                typeof text === 'string' ? (
                    <a href={text} target='_blank' rel='noreferrer'>
                        Watch video
                    </a>
                ) : (
                    text.map((e, index) => (
                        <a
                            key={index}
                            href={e}
                            target='_blank'
                            rel='noreferrer'
                        >
                            <p> Watch video</p>
                        </a>
                    ))
                )
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
            label: 'Type',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by booking type'
                    mode='tags'
                    value={queryParams.type}
                    onChange={(val) =>
                        setQueryParams({ ...queryParams, type: val })
                    }
                >
                    {Object.keys(EnumBookingTypes)
                        .filter(
                            (key: any) => !isNaN(Number(EnumBookingTypes[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={EnumBookingTypes[key]}
                                key={EnumBookingTypes[key]}
                            >
                                {_.capitalize(key)}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Class Videos Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

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

export default ClassVideos
