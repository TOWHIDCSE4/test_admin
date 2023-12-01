import { useCallback, useEffect, useReducer, useState } from 'react'
import BookingAPI from 'api/BookingAPI'
import {
    Table,
    Card,
    Space,
    Switch,
    Select,
    Input,
    DatePicker,
    Form,
    Spin,
    Popover,
    Row,
    Col,
    Popconfirm,
    Button,
    notification
} from 'antd'
import { EditOutlined, EyeOutlined } from '@ant-design/icons'
import { blue } from '@ant-design/colors'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table'
import { notify } from 'utils/notify'
import { PAGINATION_CONFIG } from 'const/common'
import ScheduledMemoAPI from 'api/ScheduledMemo'
import {
    DATE_FORMAT,
    ENUM_BOOKING_STATUS,
    EnumBookingTypes,
    EnumOrderType,
    EnumTemplateAIStatus
} from 'const'
import { EnumScheduledMemoType, IBooking, IScheduledMemo } from 'types'
import CourseAPI from 'api/CourseAPI'

import FilterFormDataWrapper, {
    IFilterFormEngine
} from 'components/filter-form-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ScheduledMemoModal from './scheduled-memo-modal'
import MemoModal from './memo-modal'
import AutoRateModel from './auto-rate-modal'
import 'antd/dist/antd.css'
import _ from 'lodash'
import { Link, useLocation } from 'react-router-dom'
import NameTeacherStudent from 'components/name-teacher-student'
import PromptViewModel from './prompt-modal'
import PromptTemplateAiAPI from 'api/PromptTemplateAiAPI'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const AllMemo = () => {
    const [form] = Form.useForm()
    const queryUrl = new URLSearchParams(window.location.search)
    const [courses, setCourses] = useReducer(
        (prev, newState) => ({ ...prev, ...newState }),
        {
            page_size: 20,
            page_number: 1,
            total: 0,
            data: [],
            search: '',
            isFetching: false
        }
    )

    const [promptTemplate, setPromptTemplate] = useReducer(
        (prev, newState) => ({ ...prev, ...newState }),
        {
            page_size: 20,
            page_number: 1,
            total: 0,
            data: [],
            dataChoose: null,
            search: '',
            isFetching: false
        }
    )

    const [selectedItem, setSelectedItem] = useState<IBooking>(null)
    const [visibleModal, setVisible] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const [bookings, setBookings] = useState<IBooking[]>([])
    const [memoType, setMemoType] = useState<string>(
        queryUrl.get('search') ? 'NORMAL_MEMO' : ''
    )
    const [selectedScheduledMemo, setSelectedScheduledMemo] =
        useState<IScheduledMemo>(null)
    const [visibleScheduledMemo, setVisibleScheduledMemo] =
        useState<boolean>(false)
    const [visibleTrialMemo, setVisibleTrialMemo] = useState<boolean>(false)
    const [isLoadingAutoRate, setLoadingAutoRate] = useState<boolean>(false)
    // eslint-disable-next-line prefer-const
    const [dataAutoRateMemo, setDataAutoRateMemo] = useState<any>(null)
    const [visibleAutoRateMemo, setVisibleAutoRateMemo] =
        useState<boolean>(false)
    const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
    const [visiblePromptModal, setVisiblePromptModal] = useState<boolean>(false)
    const [onEditPromptModal, setOnEditPromptModal] = useState<boolean>(true)
    const startTime = form.getFieldValue('time')
        ? form.getFieldValue('time')[0].startOf('day').valueOf()
        : null
    const endTime = form.getFieldValue('time')
        ? form.getFieldValue('time')[1].endOf('day').valueOf()
        : null

    const getAllCompleteBookings = (query: {
        page_size: number
        page_number: number
        search?: string
        best_memo?: number
        range_search?: any
        memo_status?: any
        memo_type?: string
    }) => {
        setLoading(true)
        BookingAPI.getAllCompleteBookings(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setBookings(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const getCourses = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        CourseAPI.getCourses({
            page_size: query?.page_size,
            page_number: query?.page_number,
            search: query?.search
        })
            .then((res) => {
                let newCourses = [...res.data]
                if (query.page_number > 1) {
                    newCourses = [...courses.data, ...res.data]
                }
                setCourses({ data: newCourses, total: res.pagination.total })
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getPromptTemplates = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        PromptTemplateAiAPI.getAllPromptTemplate({
            page_size: query?.page_size,
            page_number: query?.page_number,
            search: query?.search,
            status: EnumTemplateAIStatus.ACTIVE
        })
            .then((res) => {
                let newPromptTemplate = [...res.data]
                if (query.page_number > 1) {
                    newPromptTemplate = [...promptTemplate.data, ...res.data]
                }
                setPromptTemplate({
                    data: newPromptTemplate,
                    total: res.pagination.total
                })
                promptTemplate.data = newPromptTemplate
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getAllCompleteBookings({
            page_number: pageNumber,
            page_size: pageSize,
            // best_memo: form.getFieldValue('best_memo'),
            best_memo: null,
            range_search: [
                form.getFieldValue('time')[0].startOf('day').valueOf(),
                form.getFieldValue('time')[1].endOf('day').valueOf()
            ],
            memo_type: memoType,
            memo_status: queryUrl.get('search') ? 1 : '',
            search: queryUrl.get('search') || ''
        })
        getCourses({
            page_number: courses.page_number,
            page_size: courses.page_size
        })

        getPromptTemplates({
            page_number: promptTemplate.page_number,
            page_size: promptTemplate.page_size
        })
    }, [])

    const getAllCompleteTrialBookings = (query: {
        page_size: number
        page_number: number
        search?: string
        best_memo?: number
        range_search?: any
        status?: number
        type?: number[]
        min_start_time?: any
        max_end_time?: any
        memo_status?: number
    }) => {
        setLoading(true)
        const filter = {
            ...query
        }
        filter.status = ENUM_BOOKING_STATUS.COMPLETED
        filter.type = [EnumBookingTypes.TRIAL]
        BookingAPI.getTrialBookings(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setBookings(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
                setLoading(false)
            })
            .finally(() => setLoading(false))
    }

    const getScheduledMemo = (query: {
        page_size: number
        page_number: number
        search?: string
        month?: number
        year?: number
        type: EnumScheduledMemoType
        course_id?: number
    }) => {
        setLoading(true)
        ScheduledMemoAPI.getScheduledMemo(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setBookings(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const loadMore = () => {
        if (courses.page_number * courses.page_size < courses.total) {
            getCourses({
                page_size: courses.page_size,
                page_number: courses.page_number + 1,
                search: courses.search
            })
            setCourses({ page_number: courses.page_number + 1 })
        }
    }

    const loadMorePrompt = () => {
        if (
            promptTemplate.page_number * promptTemplate.page_size <
            promptTemplate.total
        ) {
            getPromptTemplates({
                page_number: promptTemplate.page_number,
                page_size: promptTemplate.page_size,
                search: promptTemplate.search
            })
            setPromptTemplate({ page_number: promptTemplate.page_number + 1 })
        }
    }

    const onSearchCourse = (val) => {
        getCourses({
            page_size: courses.page_size,
            page_number: 1,
            search: val
        })
        setCourses({ page_number: 1, search: val })
    }

    const onSearchPromptTemplate = (val) => {
        getPromptTemplates({
            page_size: promptTemplate.page_size,
            page_number: 1,
            search: val
        })
        setPromptTemplate({ page_number: 1, search: val })
    }

    const toggleAutoRateModal = useCallback(
        (val: boolean, type: any, item?: any) => {
            if (type === 'rate') {
                setOnEditPromptModal(true)
            }
            setVisibleAutoRateMemo(val)
            if (item) {
                setDataAutoRateMemo(item)
            }
        },
        [visibleAutoRateMemo, dataAutoRateMemo]
    )

    const togglePromptModal = useCallback(
        (val: boolean, item?: any) => {
            setVisiblePromptModal(val)
            if (item) {
                setPromptTemplate({ ...promptTemplate, dataChoose: item })
            }
        },
        [visiblePromptModal, promptTemplate]
    )

    const handlerClose = useCallback(
        (dataRate: any) => {
            toggleAutoRateModal(false, 'view')
            setOnEditPromptModal(false)
            if (dataRate) {
                setDataAutoRateMemo(dataRate)
            }
        },
        [visibleAutoRateMemo, onEditPromptModal, dataAutoRateMemo]
    )

    const handlerPrompt = useCallback(
        async (value) => {
            setSelectedPrompt(value)
            if (promptTemplate.data && promptTemplate.data.length > 0) {
                const data = await promptTemplate.data.find(
                    (item: any) => item._id === value
                )
                if (data) {
                    setPromptTemplate({ ...promptTemplate, dataChoose: data })
                }
            }
        },
        [selectedPrompt, promptTemplate]
    )

    const autoRateMemo = async () => {
        setLoadingAutoRate(true)
        if (selectedPrompt) {
            const dataFilterMemo = {
                best_memo: null,
                range_search: [
                    form.getFieldValue('time')[0].startOf('day').valueOf(),
                    form.getFieldValue('time')[1].endOf('day').valueOf()
                ],
                memo_type: memoType,
                search: queryUrl.get('search') || ''
            }
            await ScheduledMemoAPI.getAutoRateMemo({
                dataFilterMemo,
                promptObjId: selectedPrompt
            })
                .then((res) => {
                    console.log(res)
                    notify('success', 'Create successfully')
                    toggleAutoRateModal(true, 'rate', res.data)
                })
                .catch((err) => {
                    console.log(err)
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoadingAutoRate(false))
        } else {
            notification.error({
                message: 'Error',
                description: 'Prompt template is not exists'
            })
        }
    }

    const renderCourses = () =>
        courses.data.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.name}
            </Option>
        ))

    const renderPromptTemplate = () =>
        promptTemplate.data.map((item, index) => (
            <Option value={item._id} key={item._id}>
                {item.title}
            </Option>
        ))

    const onSearch = (value) => {
        setPageNumber(1)
        setDataAutoRateMemo(null)
        if (memoType === '' || memoType === 'NORMAL_MEMO') {
            getAllCompleteBookings({
                page_number: 1,
                page_size: pageSize,
                search: value,
                // best_memo: form.getFieldValue('best_memo'),
                best_memo: null,
                memo_status: form.getFieldValue('memo_status'),
                memo_type: memoType,
                range_search: [
                    form.getFieldValue('time')[0].startOf('day').valueOf(),
                    form.getFieldValue('time')[1].endOf('day').valueOf()
                ]
            })
        } else if (memoType === 'TRIAL_MEMO') {
            getAllCompleteTrialBookings({
                page_number: 1,
                page_size: pageSize,
                search: value,
                // best_memo: form.getFieldValue('best_memo'),
                best_memo: null,
                memo_status: form.getFieldValue('memo_status'),
                min_start_time: form
                    .getFieldValue('time')[0]
                    .startOf('day')
                    .valueOf(),
                max_end_time: form
                    .getFieldValue('time')[1]
                    .endOf('day')
                    .valueOf()
            })
        } else {
            const filterScheduled: any = {
                page_number: 1,
                page_size: pageSize,
                search: value,
                type: form.getFieldValue('type')
            }
            if (
                _.toInteger(form.getFieldValue('type')) ===
                EnumScheduledMemoType.MONTHLY
            ) {
                filterScheduled.month = form.getFieldValue('month')
                    ? form.getFieldValue('month').get('month') + 1
                    : moment().get('month') + 1
                filterScheduled.year = form.getFieldValue('month')
                    ? form.getFieldValue('month').get('year')
                    : moment().get('year')
            } else {
                filterScheduled.course_id = form.getFieldValue('course_id')
            }
            getScheduledMemo(filterScheduled)
        }
    }

    const refetchData = () => {
        if (memoType === '' || memoType === 'NORMAL_MEMO') {
            getAllCompleteBookings({
                page_number: pageNumber,
                page_size: pageSize,
                search: form.getFieldValue('search'),
                // best_memo: form.getFieldValue('best_memo'),
                best_memo: null,
                memo_type: memoType,
                memo_status: queryUrl.get('search') ? 1 : '',
                range_search: [
                    form.getFieldValue('time')[0].startOf('day').valueOf(),
                    form.getFieldValue('time')[1].endOf('day').valueOf()
                ]
            })
        } else if (memoType === 'TRIAL_MEMO') {
            getAllCompleteTrialBookings({
                page_number: pageNumber,
                page_size: pageSize,
                search: form.getFieldValue('search'),
                // best_memo: form.getFieldValue('best_memo'),
                best_memo: null,
                min_start_time: form
                    .getFieldValue('time')[0]
                    .startOf('day')
                    .valueOf(),
                max_end_time: form
                    .getFieldValue('time')[1]
                    .endOf('day')
                    .valueOf()
            })
        } else {
            const filterScheduled: any = {
                page_number: pageNumber,
                page_size: pageSize,
                search: form.getFieldValue('search'),
                type: form.getFieldValue('type')
            }
            if (
                _.toInteger(form.getFieldValue('type')) ===
                EnumScheduledMemoType.MONTHLY
            ) {
                filterScheduled.month = form.getFieldValue('month')
                    ? form.getFieldValue('month').get('month') + 1
                    : moment().get('month') + 1
                filterScheduled.year = form.getFieldValue('month')
                    ? form.getFieldValue('month').get('year')
                    : moment().get('year')
            } else {
                filterScheduled.course_id = form.getFieldValue('course_id')
            }
            getScheduledMemo(filterScheduled)
        }
    }

    const toggleModal = useCallback(
        (value: boolean, item?: IBooking) => {
            setVisible(value)
            setSelectedItem(item)
        },
        [visibleModal, selectedItem]
    )

    const toggleScheduledModal = useCallback(
        (val: boolean, item?: IScheduledMemo) => {
            setVisibleScheduledMemo(val)
            setSelectedScheduledMemo(item)
        },
        [visibleScheduledMemo, selectedScheduledMemo]
    )

    const toggleTrialMemoModal = useCallback(
        (val: boolean, item?: IBooking) => {
            setSelectedItem(item)
            setVisibleTrialMemo(val)
        },
        [visibleTrialMemo, selectedItem]
    )

    const onEdit = useCallback(
        (item) => {
            if (memoType === '' || memoType === 'NORMAL_MEMO') {
                if (
                    item?.ordered_package &&
                    item?.ordered_package.type === EnumOrderType.TRIAL
                ) {
                    toggleTrialMemoModal(true, item)
                } else {
                    toggleModal(true, item)
                }
            } else if (memoType === 'TRIAL_MEMO') {
                toggleTrialMemoModal(true, item?.booking)
            } else {
                toggleScheduledModal(true, item)
            }
        },
        [
            visibleModal,
            selectedItem,
            visibleScheduledMemo,
            selectedScheduledMemo,
            memoType
        ]
    )

    const editMemo = async (e, item) => {
        try {
            setLoading(true)
            const payload = {
                best_memo: e
            }
            await BookingAPI.editBooking(item.id, payload)
            await refetchData()
        } catch (err) {
            notify('error', err.message)
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnsType<IBooking> = [
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 150,
            render: (text, record: any) => {
                if (memoType === '' || memoType === 'NORMAL_MEMO') {
                    return (
                        <Link to={`/teaching/overview/?id=${text}`}>
                            {text}
                        </Link>
                    )
                }
                if (memoType === 'TRIAL_MEMO') {
                    return (
                        <Link
                            to={`/teaching/overview/?id=${record?.booking_id}`}
                        >
                            {record?.booking_id}
                        </Link>
                    )
                }
            }
        },
        // {
        //     title: 'Best memo',
        //     dataIndex: 'calendar',
        //     key: 'calendar',
        //     align: 'center',
        //     width: 100,
        //     render: (text, record: any) => {
        //         if (!checkPermission(PERMISSIONS.tmmm_best_memo)) {
        //             return <></>
        //         }
        //         if (memoType === '') {
        //             return (
        //                 <div>
        //                     <Switch
        //                         checkedChildren={<CheckOutlined />}
        //                         unCheckedChildren={<CloseOutlined />}
        //                         checked={record.best_memo}
        //                         onChange={(e) => editMemo(e, record)}
        //                     />
        //                 </div>
        //             )
        //         }
        //         if (memoType === 'TRIAL_MEMO') {
        //             return (
        //                 <div>
        //                     <Switch
        //                         checkedChildren={<CheckOutlined />}
        //                         unCheckedChildren={<CloseOutlined />}
        //                         checked={record?.booking?.best_memo}
        //                         onChange={(e) => editMemo(e, record?.booking)}
        //                     />
        //                 </div>
        //             )
        //         }
        //     }
        // },

        {
            title: 'Giáo viên/Học viên',
            dataIndex: 'Giáo viên/Học viên',
            key: 'teacher',
            align: 'center',
            width: 250,
            render: (text, record: any) => {
                let teacher = record?.teacher
                let student = record?.student

                if (memoType === 'TRIAL_MEMO') {
                    teacher = record?.booking?.teacher
                    student = record?.booking?.student
                }

                return (
                    <div>
                        <p>
                            GV:{' '}
                            <NameTeacherStudent
                                data={teacher}
                                type='teacher'
                            ></NameTeacherStudent>
                        </p>
                        <p>
                            HV:{' '}
                            <NameTeacherStudent
                                data={student}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                    </div>
                )
            }
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            align: 'center',
            width: 250,
            render: (text, record: any) => {
                if (memoType === '' || memoType === 'NORMAL_MEMO') {
                    return (
                        <div>
                            <p>Course: {record?.course?.name}</p>
                            <p>Unit: {record?.unit?.name}</p>
                        </div>
                    )
                }
                if (memoType === 'TRIAL_MEMO') {
                    return (
                        <div>
                            <p>Course: {record?.booking?.course?.name}</p>
                            <p>Unit: {record?.booking?.unit?.name}</p>
                        </div>
                    )
                }
                if (_.toInteger(memoType) === EnumScheduledMemoType.COURSE) {
                    return (
                        <div>
                            <p>Course: {record?.course?.name}</p>
                            <p>Registered class: {record?.registered_class}</p>
                            <p>Completed class: {record?.completed_class}</p>
                        </div>
                    )
                }
                if (_.toInteger(memoType) === EnumScheduledMemoType.MONTHLY) {
                    return (
                        <div>
                            <p>Registered class: {record?.registered_class}</p>
                            <p>Completed class: {record?.completed_class}</p>
                        </div>
                    )
                }
            }
        },
        {
            title: 'Điểm',
            dataIndex: 'memo',
            key: 'score',
            align: 'left',
            width: 200,
            render: (text, record: any) => {
                if (memoType === '' || memoType === 'TRIAL_MEMO') {
                    const note = text?.note
                    if (note?.length) {
                        return (
                            <>
                                {note.map((item, index) => (
                                    <p key={item.keyword}>
                                        {_.startCase(item?.keyword)} :{' '}
                                        {item.point != null ? item.point : ''}
                                    </p>
                                ))}
                            </>
                        )
                    }
                }

                if (
                    [
                        EnumScheduledMemoType.COURSE,
                        EnumScheduledMemoType.MONTHLY
                    ].includes(_.toInteger(memoType))
                ) {
                    const attendance = _.get(record, 'attendance')?.point
                    const attitude = _.get(record, 'attitude')?.point
                    const homework = _.get(record, 'homework')?.point
                    const exam_result = _.get(record, 'exam_result')
                    const avg =
                        (attendance + attitude + homework + exam_result) / 4
                    return (
                        <div>
                            <p>
                                Attendance: <span>{attendance}</span>
                            </p>
                            <p>
                                Attitude: <span>{attitude}</span>
                            </p>
                            <p>
                                Homework: <span>{homework}</span>
                            </p>
                            <p>
                                Exam result: <span>{exam_result}</span>
                            </p>
                            <p>
                                Avg: <span>{_.round(avg, 2).toFixed(2)}</span>
                            </p>
                        </div>
                    )
                }
            }
        },
        {
            title: 'Nhận xét',
            dataIndex: 'memo',
            key: 'comment',
            align: 'left',
            width: 250,
            render: (text, record: any) => {
                if (
                    memoType === '' ||
                    memoType === 'TRIAL_MEMO' ||
                    memoType === 'NORMAL_MEMO'
                ) {
                    return (
                        <div>
                            {record?.memo?.other &&
                                record.memo.other.map((item, index) => (
                                    <p key={item.keyword}>
                                        {_.startCase(item?.keyword)} :{' '}
                                        {item.comment}
                                    </p>
                                ))}
                        </div>
                    )
                }
                if (
                    [
                        EnumScheduledMemoType.COURSE,
                        EnumScheduledMemoType.MONTHLY
                    ].includes(_.toInteger(memoType))
                ) {
                    const attendance = _.get(record, 'attendance')?.comment
                    const attitude = _.get(record, 'attitude')?.comment
                    const homework = _.get(record, 'homework')?.comment
                    return (
                        <Popover
                            title=''
                            content={
                                <div
                                    style={{
                                        width: '350px',
                                        maxHeight: '450px',
                                        overflow: 'auto'
                                    }}
                                >
                                    <p>
                                        Attendance: <span>{attendance}</span>
                                    </p>
                                    <p>
                                        Attitude: <span>{attitude}</span>
                                    </p>
                                    <p>
                                        Homework: <span>{homework}</span>
                                    </p>
                                    <p>
                                        Teacher Note:{' '}
                                        <span>{record?.teacher_note}</span>
                                    </p>
                                    <p>
                                        Admin Note:{' '}
                                        <span>{record?.admin_note}</span>
                                    </p>
                                </div>
                            }
                        >
                            <div>
                                <p>
                                    Attendance:{' '}
                                    <span>
                                        {attendance && attendance.length > 50
                                            ? `${attendance.substring(
                                                  0,
                                                  50
                                              )}...`
                                            : attendance}
                                    </span>
                                </p>
                                <p>
                                    Attitude:{' '}
                                    <span>
                                        {attitude && attitude.length > 50
                                            ? `${attitude.substring(0, 50)}...`
                                            : attitude}
                                    </span>
                                </p>
                                <p>
                                    Homework:{' '}
                                    <span>
                                        {homework && homework.length > 50
                                            ? `${homework.substring(0, 50)}...`
                                            : homework}
                                    </span>
                                </p>
                                <p>
                                    Teacher Note:{' '}
                                    <span>
                                        {record?.teacher_note &&
                                        record?.teacher_note.length > 50
                                            ? `${record?.teacher_note.substring(
                                                  0,
                                                  50
                                              )}...`
                                            : record?.teacher_note}
                                    </span>
                                </p>
                                <p>
                                    Admin Note:{' '}
                                    <span>
                                        {record?.admin_note &&
                                        record?.admin_note.length > 50
                                            ? `${record?.admin_note.substring(
                                                  0,
                                                  50
                                              )}...`
                                            : record?.admin_note}
                                    </span>
                                </p>
                            </div>
                        </Popover>
                    )
                }
            }
        },
        {
            title: 'Thời gian viết memo',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'center',
            width: 120,
            render: (text, record: any) => {
                if (
                    (memoType === '' || memoType === 'NORMAL_MEMO') &&
                    record?.memo?.created_time
                ) {
                    return (
                        <span>
                            {moment(record?.memo?.created_time).format(
                                'DD/MM/YYYY  HH:mm'
                            )}
                        </span>
                    )
                }
                if (
                    memoType === 'TRIAL_MEMO' &&
                    record?.booking?.memo?.created_time
                ) {
                    return (
                        <span>
                            {moment(record?.booking?.memo?.created_time).format(
                                'DD/MM/YYYY  HH:mm'
                            )}
                        </span>
                    )
                }
            }
        },

        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (text, record: any) =>
                checkPermission(PERMISSIONS.tmmm_update) && (
                    <Space size='middle'>
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit Memo'
                        />
                    </Space>
                )
        }
    ]

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            if (memoType === '' || memoType === 'NORMAL_MEMO') {
                getAllCompleteBookings({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search: form.getFieldValue('search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    memo_status: form.getFieldValue('memo_status'),
                    memo_type: memoType,
                    range_search: [
                        form.getFieldValue('time')[0].startOf('day').valueOf(),
                        form.getFieldValue('time')[1].endOf('day').valueOf()
                    ]
                })
            } else if (memoType === 'TRIAL_MEMO') {
                getAllCompleteTrialBookings({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search: form.getFieldValue('search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    memo_status: form.getFieldValue('memo_status'),
                    min_start_time: form
                        .getFieldValue('time')[0]
                        .startOf('day')
                        .valueOf(),
                    max_end_time: form
                        .getFieldValue('time')[1]
                        .endOf('day')
                        .valueOf()
                })
            } else {
                getScheduledMemo({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search: form.getFieldValue('search'),
                    month: form.getFieldValue('month')
                        ? form.getFieldValue('month').get('month') + 1
                        : moment().get('month') + 1,
                    year: form.getFieldValue('month')
                        ? form.getFieldValue('month').get('year')
                        : moment().get('year'),
                    type: form.getFieldValue('type')
                })
            }
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            if (memoType === '' || memoType === 'NORMAL_MEMO') {
                getAllCompleteBookings({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search: form.getFieldValue('search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    memo_status: form.getFieldValue('memo_status'),
                    memo_type: memoType,
                    range_search: [
                        form.getFieldValue('time')[0].startOf('day').valueOf(),
                        form.getFieldValue('time')[1].endOf('day').valueOf()
                    ]
                })
            } else if (memoType === 'TRIAL_MEMO') {
                getAllCompleteTrialBookings({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search: form.getFieldValue('search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    memo_status: form.getFieldValue('memo_status'),
                    min_start_time: form
                        .getFieldValue('time')[0]
                        .startOf('day')
                        .valueOf(),
                    max_end_time: form
                        .getFieldValue('time')[1]
                        .endOf('day')
                        .valueOf()
                })
            } else {
                getScheduledMemo({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search: form.getFieldValue('search'),
                    month: form.getFieldValue('month')
                        ? form.getFieldValue('month').get('month') + 1
                        : moment().get('month') + 1,
                    year: form.getFieldValue('month')
                        ? form.getFieldValue('month').get('year')
                        : moment().get('year'),
                    type: form.getFieldValue('type')
                })
            }
        }
    }

    const onFormChange = (changedValues, allValues) => {
        setMemoType(_.get(allValues, 'type'))
        setDataAutoRateMemo(null)
        if (!_.keys(changedValues).includes('search')) {
            if (
                !_.get(allValues, 'type') ||
                _.get(allValues, 'type') === 'NORMAL_MEMO'
            ) {
                console.log(_.get(allValues, 'type'))
                getAllCompleteBookings({
                    page_number: 1,
                    page_size: pageSize,
                    search: _.get(allValues, 'search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    memo_type: _.get(allValues, 'type'),
                    range_search: [
                        form.getFieldValue('time')[0].startOf('day').valueOf(),
                        form.getFieldValue('time')[1].endOf('day').valueOf()
                    ],
                    memo_status: _.get(allValues, 'memo_status')
                })
                setPageNumber(1)
            } else if (_.get(allValues, 'type') === 'TRIAL_MEMO') {
                getAllCompleteTrialBookings({
                    page_number: 1,
                    page_size: pageSize,
                    search: _.get(allValues, 'search'),
                    // best_memo: form.getFieldValue('best_memo'),
                    best_memo: null,
                    min_start_time: form
                        .getFieldValue('time')[0]
                        .startOf('day')
                        .valueOf(),
                    max_end_time: form
                        .getFieldValue('time')[1]
                        .endOf('day')
                        .valueOf(),
                    memo_status: _.get(allValues, 'memo_status')
                })
                setPageNumber(1)
            } else {
                const filterScheduled: any = {
                    page_number: 1,
                    page_size: pageSize,
                    search: _.get(allValues, 'search'),
                    type: _.get(allValues, 'type')
                }
                if (
                    _.toInteger(_.get(allValues, 'type')) ===
                    EnumScheduledMemoType.MONTHLY
                ) {
                    filterScheduled.month = _.get(allValues, 'month')
                        ? _.get(allValues, 'month').get('month') + 1
                        : moment().get('month') + 1
                    filterScheduled.year = _.get(allValues, 'month')
                        ? _.get(allValues, 'month').get('year')
                        : moment().get('year')
                } else {
                    filterScheduled.course_id = _.get(allValues, 'course_id')
                }
                getScheduledMemo(filterScheduled)
            }
        }
    }

    const filterFormEngines: IFilterFormEngine[] = [
        {
            label: 'Type',
            name: 'type',
            engine: (
                <Select placeholder='Choose memo type'>
                    <Select.Option value=''>ALL MEMO</Select.Option>
                    <Select.Option value='NORMAL_MEMO'>
                        NOT TRIAL MEMO
                    </Select.Option>
                    <Select.Option value='TRIAL_MEMO'>TRIAL MEMO</Select.Option>
                    <Select.Option value={EnumScheduledMemoType.MONTHLY}>
                        MONTHLY MEMO
                    </Select.Option>
                    <Select.Option value={EnumScheduledMemoType.COURSE}>
                        COURSE MEMO
                    </Select.Option>
                </Select>
            )
        },
        {
            label: 'Date time',
            name: 'time',
            isDisplayed:
                memoType === '' ||
                memoType === 'TRIAL_MEMO' ||
                memoType === 'NORMAL_MEMO',
            engine: <RangePicker format={DATE_FORMAT} allowClear={false} />
        },
        // {
        //     label: 'Best memo',
        //     name: 'best_memo',
        //     isDisplayed: memoType === '' || memoType === 'TRIAL_MEMO',
        //     engine: (
        //         <Select
        //             allowClear
        //             style={{ minWidth: 150, width: 'auto' }}
        //             placeholder='Choose Condition'
        //         >
        //             <Select.Option value={null}>All</Select.Option>
        //             <Select.Option value={1}>Best Memo</Select.Option>
        //             <Select.Option value={0}>Not Best Memo</Select.Option>
        //         </Select>
        //     )
        // },
        {
            label: 'Memo status',
            name: 'memo_status',
            isDisplayed:
                memoType === '' ||
                memoType === 'TRIAL_MEMO' ||
                memoType === 'NORMAL_MEMO',
            engine: (
                <Select
                    allowClear
                    style={{ minWidth: 150, width: 'auto' }}
                    placeholder='Choose Condition'
                >
                    <Select.Option value=''>Tất cả</Select.Option>
                    <Select.Option value={1}>Đã viết memo</Select.Option>
                    <Select.Option value={2}>Chưa viết memo</Select.Option>
                </Select>
            )
        },
        {
            label: 'Month',
            name: 'month',
            isDisplayed:
                _.toInteger(memoType) === EnumScheduledMemoType.MONTHLY,
            engine: (
                <DatePicker
                    format={DATE_FORMAT}
                    allowClear={false}
                    picker='month'
                />
            )
        },
        {
            label: 'Course',
            name: 'course_id',
            isDisplayed: _.toInteger(memoType) === EnumScheduledMemoType.COURSE,
            engine: (
                <Select
                    style={{
                        width: '250px',
                        borderRadius: '10px'
                    }}
                    placeholder='Filter by course'
                    showSearch
                    autoClearSearchValue
                    allowClear
                    filterOption={false}
                    loading={courses.isFetching}
                    onPopupScroll={loadMore}
                    onSearch={_.debounce(onSearchCourse, 300)}
                >
                    {renderCourses()}
                    {courses.isFetching && (
                        <Select.Option key='loading' value=''>
                            <Spin size='small' />
                        </Select.Option>
                    )}
                </Select>
            )
        },
        {
            label: 'Search',
            name: 'search',
            engine: (
                <Search
                    placeholder='By Teacher , Student , Course'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Memo Management'>
            <FilterFormDataWrapper
                configs={{
                    name: 'MemoManagement',
                    form,
                    layout: 'inline',
                    onValuesChange: onFormChange,
                    initialValues: {
                        time: [
                            moment().subtract(1, 'months').startOf('month'),
                            moment().endOf('month')
                        ],
                        type: memoType,
                        month: moment(),
                        memo_status: queryUrl.get('search') ? 1 : '',
                        search: queryUrl.get('search') || ''
                    }
                }}
                engines={filterFormEngines}
            ></FilterFormDataWrapper>
            <Row className='mb-4'>
                <Col span={24} className='d-flex justify-content-start'>
                    {memoType === 'NORMAL_MEMO' &&
                        checkPermission(PERMISSIONS.tmmm_create_memo_ai) &&
                        form.getFieldValue('search') &&
                        form.getFieldValue('memo_status') === 1 &&
                        !dataAutoRateMemo &&
                        total >= 3 && (
                            <>
                                <Select
                                    style={{
                                        width: '250px',
                                        borderRadius: '10px',
                                        marginRight: '15px'
                                    }}
                                    placeholder='Choose Prompt Template'
                                    showSearch
                                    autoClearSearchValue
                                    allowClear
                                    filterOption={false}
                                    loading={promptTemplate.isFetching}
                                    onPopupScroll={loadMorePrompt}
                                    onSearch={_.debounce(
                                        onSearchPromptTemplate,
                                        300
                                    )}
                                    onChange={(val) => {
                                        handlerPrompt(val)
                                    }}
                                >
                                    {renderPromptTemplate()}
                                    {promptTemplate.isFetching && (
                                        <Select.Option key='loading' value=''>
                                            <Spin size='small' />
                                        </Select.Option>
                                    )}
                                </Select>
                                <Popover
                                    content={
                                        <>
                                            <b>Xem Prompt đang chọn</b>
                                        </>
                                    }
                                >
                                    <span
                                        className='mt-1 mr-4'
                                        style={{ width: 20 }}
                                        onClick={() => togglePromptModal(true)}
                                    >
                                        {selectedPrompt && (
                                            <EyeOutlined
                                                style={{
                                                    fontSize: 20,
                                                    color: '#1890FF',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        )}
                                    </span>
                                </Popover>
                                <Popconfirm
                                    placement='top'
                                    title='Bạn chắc chắn muốn tạo đánh giá tổng hợp Memo bằng AI?'
                                    onConfirm={() => autoRateMemo()}
                                    okText='Ok'
                                    disabled={
                                        isLoadingAutoRate || !selectedPrompt
                                    }
                                    cancelText='Cancel'
                                >
                                    <Popover
                                        content={
                                            <>
                                                <b>
                                                    Đánh giá tổng hợp danh sách
                                                    memo phía dưới bằng AI
                                                </b>
                                            </>
                                        }
                                    >
                                        <Button
                                            type='primary'
                                            className='mr-4'
                                            disabled={
                                                isLoadingAutoRate ||
                                                !selectedPrompt
                                            }
                                            loading={isLoadingAutoRate}
                                        >
                                            Đánh giá bằng AI
                                        </Button>
                                    </Popover>
                                </Popconfirm>
                            </>
                        )}
                    {dataAutoRateMemo && visibleAutoRateMemo === false && (
                        <Button
                            style={{
                                background: '#08BF5A',
                                color: 'white'
                            }}
                            className='mr-4'
                            onClick={() => toggleAutoRateModal(true, 'view')}
                        >
                            Xem đánh giá
                        </Button>
                    )}
                </Col>
            </Row>

            <Table
                {...PAGINATION_CONFIG}
                dataSource={bookings}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record?._id}
            />

            <ScheduledMemoModal
                visible={visibleScheduledMemo}
                toggleModal={toggleScheduledModal}
                data={selectedScheduledMemo}
                memoType={form.getFieldValue('type')}
                refetchData={refetchData}
            />

            <MemoModal
                type='other'
                visible={visibleModal}
                data={selectedItem}
                refetchData={refetchData}
                close={() => {
                    toggleModal(false)
                }}
            />
            <MemoModal
                type='trial'
                visible={visibleTrialMemo}
                data={selectedItem}
                refetchData={refetchData}
                close={() => {
                    toggleTrialMemoModal(false)
                }}
            />
            <AutoRateModel
                visible={visibleAutoRateMemo}
                data={
                    dataAutoRateMemo
                        ? {
                              dataRate: dataAutoRateMemo,
                              student_id:
                                  bookings.length > 0
                                      ? bookings[0].student_id
                                      : null,
                              promptObjId: selectedPrompt,
                              ranger_search: [startTime, endTime]
                          }
                        : null
                }
                on_edit={onEditPromptModal}
                close={(dataRate) => {
                    handlerClose(dataRate)
                }}
            />
            <PromptViewModel
                visible={visiblePromptModal}
                dataPrompt={promptTemplate.dataChoose}
                close={() => {
                    togglePromptModal(false)
                }}
            />
        </Card>
    )
}

export default AllMemo
