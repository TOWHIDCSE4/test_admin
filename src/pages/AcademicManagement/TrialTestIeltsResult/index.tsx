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
    Popover,
    Row,
    Col,
    Select,
    Spin,
    Button,
    notification
} from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { IBooking, IStatisticBooking } from 'types'
import { ColumnsType } from 'antd/lib/table'
import { EnumTrialTestIeltsType } from 'const'
import { notify } from 'utils/notify'
import { exportToTrialBookingExcel } from 'utils/export-xlsx'
import { EditOutlined } from '@ant-design/icons'
import { blue } from '@ant-design/colors'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NameTeacherStudent from 'components/name-teacher-student'
import TrialTestIeltsResultAPI from 'api/TrialTestIeltsResultAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import StudentAPI from 'api/StudentAPI'
import WritingGradingModal from './WritingGradingModal'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const ResultTrialIelts: FunctionComponent = () => {
    const queryUrl = new URLSearchParams(window.location.search)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            results: [],
            isLoading: false
        }
    )

    const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [visibleWritingGradingModal, setShowWritingGradingModal] =
        useState<boolean>(false)
    const [selectedResultData, setSelectedResultData] = useState<any>(null)
    const [queryParams, setQueryParams] = useState({
        test_type: '',
        search: '',
        // min_test_start_time: moment().startOf('month'),
        // max_test_start_time: moment().endOf('month'),
        min_test_start_time: null,
        max_test_start_time: null,
        student_id: '',
        sort: 'prev',
        id: queryUrl.get('id')
    })

    const getTrialTestIeltsResults = (query?: {
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
        TrialTestIeltsResultAPI.getAllTrialTestIeltsResult(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setValues({ results: res.data })
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const toggleWritingGradingModal = useCallback(
        (val: boolean, item?: any) => {
            setShowWritingGradingModal(val)
            setSelectedResultData(item)
        },
        [visibleWritingGradingModal, selectedResultData]
    )

    const fetchStudent = useCallback(
        async (q) => {
            const res = await StudentAPI.searchStudentByString({
                page_number: 1,
                page_size: 100,
                role: 'STUDENT',
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        },
        [values]
    )

    useEffect(() => {
        getTrialTestIeltsResults({
            ...queryParams,
            page_size: pageSize,
            page_number: 1
        })
        setPageNumber(1)
    }, [queryParams])

    const refetchData = () => {
        getTrialTestIeltsResults({
            ...queryParams,
            page_size: pageSize,
            page_number: 1
        })
    }

    const handleChangeSearchStudent = useCallback(
        (value) => {
            setQueryParams({ ...queryParams, student_id: value })
            getTrialTestIeltsResults({
                ...queryParams,
                page_size: pageSize,
                page_number: 1
            })
        },
        [queryParams, pageNumber]
    )

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            getTrialTestIeltsResults({
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
                test_type: queryParams.test_type,
                search: queryParams.search,
                student_id: queryParams.student_id,
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
                await TrialTestIeltsResultAPI.getAllTrialTestIeltsResult(filter)
            if (!response || response?.data.length === 0) {
                setIsExportingExcel(false)

                notification.error({
                    message: 'Error',
                    description: 'No data'
                })
                setIsExportingExcel(false)
                return
            }
            const data = response.data.map((result: any, index: number) => {
                const temp = []
                temp.push(index + 1)
                temp.push(
                    `${result.student?.full_name} - ${result.student?.username}`
                )
                temp.push(
                    getAge(
                        result.test_start_time,
                        result.student?.date_of_birth
                    )
                )
                temp.push(result.student?.phone_number)
                temp.push(result.course?.name)
                temp.push(result.unit?.name)
                // temp.push(result.test_topic_name)
                // temp.push(
                //     result.test_start_time &&
                //         moment
                //             .unix(result.test_start_time / 1000)
                //             .format('DD-MM-YYYY HH:mm')
                // )
                // temp.push(
                //     result.test_result_grammar?.submission_time &&
                //         moment
                //             .unix(
                //                 result.test_result_grammar?.submission_time /
                //                     1000
                //             )
                //             .format('DD-MM-YYYY HH:mm')
                // )
                temp.push(
                    result.test_type === EnumTrialTestIeltsType.IELTS_GRAMMAR &&
                        result.test_result_grammar
                        ? `${result.test_result_grammar?.total_correct_answers}/${result.test_result_grammar?.total_questions} (${result.test_result_grammar?.percent_correct_answers}%)`
                        : ''
                )
                temp.push(
                    result.test_type ===
                        EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        result.test_result_listening
                        ? result.test_result_listening?.score
                        : ''
                )
                temp.push(
                    result.test_type ===
                        EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        result.test_result_speaking
                        ? result.test_result_speaking?.score
                        : ''
                )
                temp.push(
                    result.test_type ===
                        EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        result.test_result_reading
                        ? result.test_result_reading?.score
                        : ''
                )
                temp.push(
                    result.test_type ===
                        EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        result.test_result_writing
                        ? result.test_result_writing?.score
                        : ''
                )
                return temp
            })
            const cols = [
                'STT',
                'Name',
                'Age',
                'Phone number',
                'Course',
                'Unit',
                // 'Topic name',
                // 'Thời gian tham gia làm bài',
                // 'Thời gian nộp bài',
                'Grammar',
                'Listening',
                'Speaking',
                'Reading',
                'Writing'
            ]

            exportToTrialBookingExcel('trial_test_ielts_result', cols, data)
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setIsExportingExcel(false)
    }

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'stt',
            fixed: 'left',
            align: 'center',
            width: 80,
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Name',
            dataIndex: 'student',
            key: 'student_name',
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
            title: 'Age',
            dataIndex: 'student',
            key: 'student_age',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                if (text) {
                    if (
                        record?.test_type ===
                            EnumTrialTestIeltsType.IELTS_GRAMMAR &&
                        record?.test_result_grammar
                    ) {
                        return getAge(
                            record?.test_result_grammar.test_start_time,
                            text.date_of_birth
                        )
                    }
                    if (
                        record?.test_type ===
                            EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        record?.test_result_reading
                    ) {
                        return getAge(
                            record?.test_result_reading.test_start_time,
                            text.date_of_birth
                        )
                    }
                    if (
                        record?.test_type ===
                            EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        record?.test_result_listening
                    ) {
                        return getAge(
                            record?.test_result_listening.test_start_time,
                            text.date_of_birth
                        )
                    }
                    if (
                        record?.test_type ===
                            EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        record?.test_result_writing
                    ) {
                        return getAge(
                            record?.test_result_writing.test_start_time,
                            text.date_of_birth
                        )
                    }
                    if (
                        record?.test_type ===
                            EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        record?.test_result_speaking
                    ) {
                        return getAge(
                            record?.test_result_speaking.test_start_time,
                            text.date_of_birth
                        )
                    }
                }
                return <></>
            }
        },
        {
            title: 'Phone number',
            dataIndex: 'student',
            key: 'student_phone',
            align: 'center',
            width: 140,
            render: (text, record) => text && text.phone_number
        },
        // {
        //     title: 'Course',
        //     dataIndex: 'course',
        //     key: 'course',
        //     align: 'left',
        //     width: 200,
        //     render: (text, record) => text && text.name
        // },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            align: 'left',
            width: 200,
            render: (text, record) => text && text.name
        },
        // {
        //     title: 'Topic name',
        //     dataIndex: 'test_topic_name',
        //     key: 'test_topic_name',
        //     align: 'left',
        //     width: 250,
        //     render: (text, record) => text && text
        // },
        // {
        //     title: 'Thời gian tham gia làm bài',
        //     dataIndex: 'test_result_grammar',
        //     key: 'test_start_time',
        //     align: 'center',
        //     width: 200,
        //     render: (text, record) =>
        //         text &&
        //         moment
        //             .unix(text.test_start_time / 1000)
        //             .format('DD-MM-YYYY HH:mm')
        // },
        // {
        //     title: 'Thời gian nộp bài',
        //     dataIndex: 'test_result_grammar',
        //     key: 'submit_time',
        //     align: 'center',
        //     width: 150,
        //     render: (text, record) =>
        //         text &&
        //         text?.submission_time &&
        //         moment
        //             .unix(text.submission_time / 1000)
        //             .format('DD-MM-YYYY HH:mm')
        // },
        {
            title: 'Grammar',
            dataIndex: 'test_result_grammar',
            key: 'grammar',
            width: 200,
            align: 'center',
            render: (text) => (
                <>
                    {text && text.percent_correct_answers && (
                        <Popover
                            content={
                                <>
                                    <b>Topic Name: </b> {text?.test_topic_name}{' '}
                                    <br />
                                    <b>Test Start Time: </b>
                                    {moment
                                        .unix(text?.test_start_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                    <br />
                                    <b>Test Submission Time: </b>{' '}
                                    {moment
                                        .unix(text?.submission_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                </>
                            }
                        >
                            <div className='clickable'>
                                {`${text.total_correct_answers}/${text.total_questions} (${text.percent_correct_answers}%)`}
                            </div>
                        </Popover>
                    )}
                </>
            )
        },
        {
            title: 'Listening',
            dataIndex: 'test_result_listening',
            key: 'listening',
            width: 200,
            align: 'center',
            render: (text) => (
                <>
                    {text && text.score && (
                        <Popover
                            content={
                                <>
                                    <b>Topic Name: </b> {text?.test_topic_name}{' '}
                                    <br />
                                    <b>Test Start Time: </b>
                                    {moment
                                        .unix(text?.test_start_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                    <br />
                                    <b>Test Submission Time: </b>{' '}
                                    {moment
                                        .unix(text?.submission_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                </>
                            }
                        >
                            <div className='clickable'>
                                {`${text.total_correct_answers}/${text.total_questions} (${text.score})`}
                            </div>
                        </Popover>
                    )}
                </>
            )
        },
        {
            title: 'Speaking',
            dataIndex: 'test_result_speaking',
            key: 'speaking',
            width: 200,
            align: 'center',
            render: (text) => (
                <>
                    {text && text.score && (
                        <div className='clickable'>{text.score}</div>
                    )}
                </>
            )
        },
        {
            title: 'Reading',
            dataIndex: 'test_result_reading',
            key: 'reading',
            width: 200,
            align: 'center',
            render: (text) => (
                <>
                    {text && text.score && (
                        <Popover
                            content={
                                <>
                                    <b>Topic Name: </b> {text?.test_topic_name}{' '}
                                    <br />
                                    <b>Test Start Time: </b>
                                    {moment
                                        .unix(text?.test_start_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                    <br />
                                    <b>Test Submission Time: </b>{' '}
                                    {moment
                                        .unix(text?.submission_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                </>
                            }
                        >
                            <div className='clickable'>
                                {`${text.total_correct_answers}/${text.total_questions} (${text.score})`}
                            </div>
                        </Popover>
                    )}
                </>
            )
        },
        {
            title: 'Writing',
            dataIndex: 'test_result_writing',
            key: 'writing',
            width: 200,
            align: 'center',
            render: (text, record) => (
                <>
                    {text && text.score && (
                        <Popover
                            content={
                                <>
                                    <b>Topic Name: </b> {text?.test_topic_name}{' '}
                                    <br />
                                    <b>Test Start Time: </b>
                                    {moment
                                        .unix(text?.test_start_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                    <br />
                                    <b>Test Submission Time: </b>{' '}
                                    {moment
                                        .unix(text?.submission_time / 1000)
                                        .format('DD-MM-YYYY HH:mm')}
                                </>
                            }
                        >
                            <span className='clickable mr-3'>{text.score}</span>
                        </Popover>
                    )}
                    {record?.test_result_writing?.submission_time &&
                        record.test_type ===
                            EnumTrialTestIeltsType.IELTS_4_SKILLS &&
                        checkPermission(PERMISSIONS.amttir_edit) && (
                            <EditOutlined
                                type='button'
                                style={{ color: blue.primary }}
                                onClick={() =>
                                    toggleWritingGradingModal(true, record)
                                }
                                title='Edit IELTS writing result'
                            />
                        )}
                </>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        // {
        //     label: 'Test start time',
        //     engine: (
        //         <RangePicker
        //             allowClear={false}
        //             onChange={handleRangePicker}
        //             disabledDate={disabledDateTime}
        //             value={[
        //                 queryParams.min_test_start_time,
        //                 queryParams.max_test_start_time
        //             ]}
        //         />
        //     )
        // },
        {
            label: 'Search Student',
            engine: (
                <DebounceSelect
                    placeholder='By name'
                    fetchOptions={fetchStudent}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={handleChangeSearchStudent}
                />
            )
        }
    ]

    return (
        <Card title='Trial Test Ielts Result'>
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
                dataSource={values.results}
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

            <WritingGradingModal
                visible={visibleWritingGradingModal}
                toggleModal={toggleWritingGradingModal}
                data={selectedResultData}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default ResultTrialIelts
