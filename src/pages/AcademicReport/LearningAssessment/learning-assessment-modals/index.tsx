import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Col,
    Row,
    Select,
    Tabs,
    Table,
    Tooltip,
    Popover,
    notification,
    Popconfirm,
    Tag,
    Spin
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { notify } from 'utils/notify'
import moment from 'moment'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { Link } from 'react-router-dom'
import { CriteriaList, REGULAR_CARE_STATUS } from 'const/regular-care'
import { ENUM_BOOKING_STATUS, EnumTemplateAIStatus, IModalProps } from 'const'
import RegularCareAPI from 'api/RegularCareAPI'
import { resolve } from 'path'
import BookingAPI from 'api/BookingAPI'
import TextEditor from 'core/Atoms/TextEditor'
import LearningAssessmentReportsAPI from 'api/LearningAssessmentReportsAPI'
import {
    EnumLAModalType,
    EnumLAReportType
} from 'types/ILearningAssessmentReports'
import sanitizeHtml from 'sanitize-html'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'
import PromptTemplateAiAPI from 'api/PromptTemplateAiAPI'
import ScheduledMemoAPI from 'api/ScheduledMemo'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

interface IProps extends IModalProps {
    data?: any
    visible: boolean
    modalType?: any
    toggleModal: (val: boolean) => void
    updateData: () => void
}

const LearningAssessmentModal: FC<IProps> = ({
    visible,
    data,
    modalType,
    toggleModal,
    updateData
}) => {
    const [isLoading, setLoading] = useState(false)
    const [isLoadingAutoRate, setLoadingAutoRate] = useState<boolean>(false)
    const [form] = Form.useForm()
    const { user } = useAuth()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            bookings: [],
            type: EnumLAReportType.DILIGENCE,
            total: 0,
            page_size: 10,
            page_number: 1,
            memo: '',
            number_lesson: 0,
            number_completed: 0,
            number_absent: 0,
            number_homework: 0,
            number_homework_completed: 0
        }
    )

    const [promptCategory, setValuePromptCategory] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: '',
            id_choose: null
        }
    )

    const [promptTemplate, setValuePromptTemplate] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: '',
            id_choose: null,
            data_choose: null
        }
    )

    const fetchBookings = async ({ page_size, page_number, booking_ids }) => {
        setLoading(true)
        await BookingAPI.getAllBookingByIds({
            page_size,
            page_number,
            booking_ids
        })
            .then(async (res) => {
                setValues({
                    bookings: res.data,
                    number_lesson: res.data.length
                })
                let countLessonCompleted = 0
                let countLessonAbsent = 0
                let countHomework = 0
                let countHomeworkCompleted = 0

                // eslint-disable-next-line array-callback-return
                res.data.map((value, index) => {
                    if (value?.status === ENUM_BOOKING_STATUS.COMPLETED) {
                        countLessonCompleted++
                        if (
                            value?.unit?.homework_id ||
                            value?.unit?.homework2_id
                        ) {
                            countHomework++
                        }

                        const homework = value?.homework?.sessions
                            ? value?.homework?.sessions[0]?.user_score
                            : value?.homework_test_result?.test_result?.avg ??
                              value?.homework_test_result?.test_result
                                  ?.percent_correct_answers ??
                              null
                        if (homework || homework === 0) {
                            countHomeworkCompleted++
                        }
                    }
                    if (value?.status === ENUM_BOOKING_STATUS.STUDENT_ABSENT) {
                        countLessonAbsent++
                    }
                })
                setValues({
                    number_completed: countLessonCompleted,
                    number_absent: countLessonAbsent,
                    number_homework: countHomework,
                    number_homework_completed: countHomeworkCompleted
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
    }

    const getPromptCategories = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setValuePromptCategory({ isLoading: true })
        PromptCategoryAiAPI.getAllPromptCategory({
            status: EnumTemplateAIStatus.ACTIVE,
            search: query.search,
            page_number: query.page_number,
            page_size: query.page_size
        })
            .then((res) => {
                let newCategory = [...res.data]
                if (query.page_number > 1) {
                    newCategory = [...promptCategory.data, ...res.data]
                }
                setValuePromptCategory({
                    data: newCategory,
                    total: res.pagination.total
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValuePromptCategory({ isLoading: false }))
    }

    const getPromptTemplates = (query: {
        page_size: number
        page_number: number
        search?: string
        category?: string
    }) => {
        // console.log(category)
        setValuePromptTemplate({ isLoading: true })
        PromptTemplateAiAPI.getAllPromptTemplate({
            page_size: query?.page_size,
            page_number: query?.page_number,
            search: query?.search,
            category: query?.category,
            status: EnumTemplateAIStatus.ACTIVE
        })
            .then((res) => {
                let newPromptTemplate = [...res.data]
                if (query.page_number > 1) {
                    newPromptTemplate = [...promptTemplate.data, ...res.data]
                }
                setValuePromptTemplate({
                    data: newPromptTemplate,
                    total: res.pagination.total
                })
                promptTemplate.data = newPromptTemplate
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValuePromptTemplate({ isLoading: false }))
    }

    const autoRateMemo = async () => {
        setLoadingAutoRate(true)
        if (promptTemplate.data_choose) {
            const dataFilterMemo = {
                best_memo: null,
                range_search: [data?.start_time, data?.end_time],
                memo_type: 'NORMAL_MEMO',
                student_user_id: data?.user_id
            }
            await ScheduledMemoAPI.getAutoRateMemo({
                dataFilterMemo,
                promptObjId: promptTemplate.id_choose
            })
                .then((res) => {
                    form.setFieldValue('memo', res.data)
                    notify('success', 'Create successfully')
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

    useEffect(() => {
        if (visible && data) {
            form.resetFields()
            setValuePromptTemplate({ id_choose: null, data_choose: null })
            fetchBookings({
                page_size: values.page_size,
                page_number: values.page_number,
                booking_ids: data.booking_ids
            })
            setValues({ memo: data.memo })
            form.setFieldValue('memo', data.memo)
            if (modalType === EnumLAModalType.EDIT) {
                getPromptCategories({ ...promptCategory })
            }
        }
    }, [visible])

    const handleClose = useCallback(() => {
        updateData()
        toggleModal(false)
    }, [toggleModal, updateData])

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        fetchBookings({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
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

    const loadMorePromptCategory = () => {
        if (
            promptCategory.page_number * promptCategory.page_size <
            promptCategory.total
        ) {
            getPromptCategories({
                page_number: promptCategory.page_number,
                page_size: promptCategory.page_size,
                search: promptCategory.search
            })
            setValuePromptCategory({
                page_number: promptCategory.page_number + 1
            })
        }
    }

    const loadMorePromptTemplate = () => {
        if (
            promptTemplate.page_number * promptTemplate.page_size <
            promptTemplate.total
        ) {
            getPromptTemplates({
                page_number: promptTemplate.page_number,
                page_size: promptTemplate.page_size,
                search: promptTemplate.search,
                category: promptCategory.id_choose
            })
            setValuePromptTemplate({
                page_number: promptTemplate.page_number + 1
            })
        }
    }

    const onSearchPromptCategory = (val) => {
        getPromptCategories({
            page_size: promptCategory.page_size,
            page_number: 1,
            search: val
        })
        setValuePromptCategory({ page_number: 1, search: val })
    }

    const onSearchPromptTemplate = (val) => {
        if (promptCategory.id_choose) {
            getPromptTemplates({
                page_size: promptTemplate.page_size,
                page_number: 1,
                search: val,
                category: promptCategory.id_choose
            })
            setValuePromptTemplate({ page_number: 1, search: val })
        }
    }

    const handlerPromptCategory = useCallback(
        async (value) => {
            form.setFieldValue('prompt_template', null)
            setValuePromptTemplate({
                id_choose: null,
                data_choose: null
            })
            setValuePromptCategory({ id_choose: value })
            getPromptTemplates({
                page_size: promptTemplate.page_size,
                page_number: 1,
                search: '',
                category: value
            })
        },
        [promptCategory]
    )

    const handlerPromptTemplate = useCallback(
        async (value) => {
            if (promptTemplate.data && promptTemplate.data.length > 0) {
                const dataPrompt = await promptTemplate.data.find(
                    (item: any) => item._id === value
                )
                if (dataPrompt) {
                    setValuePromptTemplate({
                        ...promptTemplate,
                        id_choose: value,
                        data_choose: dataPrompt
                    })
                }
            }
        },
        [promptTemplate]
    )

    const renderPromptCategory = () =>
        promptCategory.data.map((item, index) => (
            <Option value={item._id} key={item._id}>
                {item.title}
            </Option>
        ))

    const renderPromptTemplate = () =>
        promptTemplate.data.map((item, index) => (
            <Option value={item._id} key={item._id}>
                {item.title}
            </Option>
        ))

    const onFinish = useCallback(
        (val) => {
            setLoading(true)
            LearningAssessmentReportsAPI.editLAReport(data.id, {
                memo_new: val.memo
            })
                .then((res) => {
                    notification.success({
                        message: 'Update success',
                        description: 'Successfully'
                    })
                    handleClose()
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
        },
        [form, data]
    )

    const columns: any = [
        {
            title: 'No',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            fixed: true,
            align: 'center',
            render: (text, record: any, index) => index + 1
        },
        {
            title: 'Booking ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            fixed: true,
            width: 120,
            render: (text, record: any) => (
                <Link to={`/teaching/overview/?id=${text}`}>{text}</Link>
            )
        },
        {
            title: 'Start time',
            dataIndex: 'calendar',
            key: 'calendar',
            width: 160,
            align: 'center',
            render: (text, record: any) => {
                return text ? (
                    moment(text.start_time).format('HH:mm DD-MM-YYYY')
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 130,
            align: 'left',
            render: (text, record: any) => {
                return text && text.full_name ? (
                    <div>{text.full_name}</div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Content',
            dataIndex: 'course',
            key: 'content',
            width: 250,
            align: 'left',
            render: (text, record: any) => {
                return record ? (
                    <>
                        <div>Course: {record?.course?.name}</div>
                        <div>Lesson: {record?.unit?.name}</div>
                    </>
                ) : (
                    <></>
                )
            }
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
            title: 'Homework score',
            dataIndex: 'homework',
            key: 'homework',
            width: 100,
            align: 'center',
            render: (text, record: any) => {
                if (
                    record?.status === ENUM_BOOKING_STATUS.COMPLETED &&
                    (record?.unit?.homework_id || record?.unit?.homework2_id)
                ) {
                    if (
                        (record?.homework?.sessions &&
                            record?.homework?.sessions[0]?.user_score) ||
                        record?.homework_test_result?.test_result?.avg ||
                        record?.homework_test_result?.test_result
                            ?.percent_correct_answers
                    ) {
                        return (
                            <div
                                style={{
                                    color: '#52C41A'
                                }}
                            >
                                Done
                            </div>
                        )
                    }
                    return (
                        <div
                            style={{
                                color: '#FF0D0D'
                            }}
                        >
                            Not done
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
            width: 300,
            render: (text, record) => {
                return (
                    <div>
                        {text?.other &&
                            text?.other.map((item, index) => (
                                <p key={item.keyword}>
                                    {_.startCase(item?.keyword)} :{' '}
                                    {item.comment}
                                </p>
                            ))}
                    </div>
                )
            }
        }
    ]

    const renderBody = () => (
        <>
            <Form
                name='basic'
                layout='vertical'
                style={{ textAlign: 'left' }}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
            >
                {modalType !== EnumLAModalType.VIEW && (
                    <Row className='mb-2'>
                        <Col span={6}>
                            <b>Student:</b>
                        </Col>
                        <Col span={17}>
                            <b>{data?.student?.full_name}</b>
                        </Col>
                        <Col span={6}>
                            <b>Number of lesson:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_lesson}</b>
                        </Col>
                        <Col span={6}>
                            <b>Number of lessons completed:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_completed}</b>
                        </Col>
                        <Col span={6}>
                            <b>Number of lessons absent:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_absent}</b>
                        </Col>
                        <Col span={6}>
                            <b>Number of homework completed:</b>
                        </Col>
                        <Col span={17}>
                            <b>
                                {values.number_homework_completed} /{' '}
                                {values.number_homework}
                            </b>
                        </Col>
                    </Row>
                )}
                {modalType === EnumLAModalType.VIEW && (
                    <Row className='mb-2'>
                        <Col span={6}>
                            <b>Học viên:</b>
                        </Col>
                        <Col span={17}>
                            <b>{data?.student?.full_name}</b>
                        </Col>
                        <Col span={6}>
                            <b>Số buổi học:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_lesson}</b>
                        </Col>
                        <Col span={6}>
                            <b>Số buổi đã hoàn thành:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_completed}</b>
                        </Col>
                        <Col span={6}>
                            <b>Số buổi vắng mặt:</b>
                        </Col>
                        <Col span={17}>
                            <b>{values.number_absent}</b>
                        </Col>
                        <Col span={6}>
                            <b>Số BTVN đã hoàn thành:</b>
                        </Col>
                        <Col span={17}>
                            <b>
                                {values.number_homework_completed} /{' '}
                                {values.number_homework}
                            </b>
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col span={24}>
                        {modalType !== EnumLAModalType.VIEW && (
                            <Table
                                dataSource={values.bookings}
                                columns={columns}
                                pagination={false}
                                // pagination={{
                                //     defaultCurrent: values.page_number,
                                //     pageSize: values.page_size,
                                //     total: values.total,
                                //     onChange: handleChangePagination,
                                //     current: values.page_number
                                // }}
                                scroll={{
                                    y: 400
                                }}
                                bordered
                                rowKey={(record: any) => record.id}
                            />
                        )}
                        {modalType === EnumLAModalType.VIEW && (
                            <Table
                                dataSource={values.bookings}
                                pagination={false}
                                // pagination={{
                                //     defaultCurrent: values.page_number,
                                //     pageSize: values.page_size,
                                //     total: values.total,
                                //     onChange: handleChangePagination,
                                //     current: values.page_number
                                // }}
                                scroll={{
                                    y: 400
                                }}
                                bordered
                                rowKey={(record: any) => record.id}
                            >
                                <Column
                                    title='STT'
                                    dataIndex='stt'
                                    key='stt'
                                    width={60}
                                    fixed={true}
                                    align='center'
                                    render={(text: any, record: any, index) => {
                                        return <div>{index + 1}</div>
                                    }}
                                />
                                <Column
                                    title='Booking ID'
                                    dataIndex='id'
                                    key='id'
                                    width={120}
                                    fixed={true}
                                    align='center'
                                    render={(text: any, record: any) => {
                                        return (
                                            <Link
                                                to={`/teaching/overview/?id=${text}`}
                                            >
                                                {text}
                                            </Link>
                                        )
                                    }}
                                />
                                <Column
                                    title='Thời gian'
                                    dataIndex='calendar'
                                    key='calendar'
                                    width={160}
                                    align='center'
                                    render={(text: any, record: any) => {
                                        return text ? (
                                            moment(text.start_time).format(
                                                'HH:mm DD-MM-YYYY'
                                            )
                                        ) : (
                                            <></>
                                        )
                                    }}
                                />
                                <Column
                                    title='Giáo viên'
                                    dataIndex='teacher'
                                    key='teacher'
                                    width={130}
                                    align='left'
                                    render={(text: any, record: any) => {
                                        return text && text.full_name ? (
                                            <div>{text.full_name}</div>
                                        ) : (
                                            <></>
                                        )
                                    }}
                                />
                                <Column
                                    title='Nôi dung'
                                    dataIndex='course'
                                    key='course'
                                    width={250}
                                    align='left'
                                    render={(text: any, record: any) => {
                                        return record ? (
                                            <>
                                                <div>
                                                    Course:{' '}
                                                    {record?.course?.name}
                                                </div>
                                                <div>
                                                    Lesson: {record?.unit?.name}
                                                </div>
                                            </>
                                        ) : (
                                            <></>
                                        )
                                    }}
                                />
                                <Column
                                    title='Trạng thái'
                                    dataIndex='status'
                                    key='status'
                                    width={180}
                                    align='center'
                                    render={(text: any, record: any) => {
                                        return (
                                            <Tag color={colorStatus(text)}>
                                                {ENUM_BOOKING_STATUS[text]}
                                            </Tag>
                                        )
                                    }}
                                />
                                <Column
                                    title='BTVN'
                                    dataIndex='homework'
                                    key='homework'
                                    width={150}
                                    align='center'
                                    render={(text: any, record: any) => {
                                        if (
                                            record?.status ===
                                                ENUM_BOOKING_STATUS.COMPLETED &&
                                            (record?.unit?.homework_id ||
                                                record?.unit?.homework2_id)
                                        ) {
                                            if (
                                                (record?.homework?.sessions &&
                                                    record?.homework
                                                        ?.sessions[0]
                                                        ?.user_score) ||
                                                record?.homework_test_result
                                                    ?.test_result?.avg ||
                                                record?.homework_test_result
                                                    ?.test_result
                                                    ?.percent_correct_answers
                                            ) {
                                                return (
                                                    <div
                                                        style={{
                                                            color: '#52C41A'
                                                        }}
                                                    >
                                                        Hoàn thành
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div
                                                    style={{
                                                        color: '#FF0D0D'
                                                    }}
                                                >
                                                    Chưa hoàn thành
                                                </div>
                                            )
                                        }
                                        return <></>
                                    }}
                                />

                                <ColumnGroup title='Nhận xét của giáo viên'>
                                    <Column
                                        title='Mức độ chú ý'
                                        dataIndex='memo'
                                        key='attention'
                                        width={140}
                                        align='center'
                                        render={(text: any, record: any) => {
                                            if (
                                                text?.other &&
                                                text?.other?.length > 0
                                            ) {
                                                const dataMemo =
                                                    text?.other.find(
                                                        (x: any) =>
                                                            x.keyword ===
                                                            'attention'
                                                    )
                                                return dataMemo?.comment
                                            }
                                            return <></>
                                        }}
                                    />
                                    <Column
                                        title='Mức độ hiểu bài'
                                        dataIndex='memo'
                                        key='comprehension'
                                        width={140}
                                        align='center'
                                        render={(text: any, record: any) => {
                                            if (
                                                text?.other &&
                                                text?.other?.length > 0
                                            ) {
                                                const dataMemo =
                                                    text?.other.find(
                                                        (x: any) =>
                                                            x.keyword ===
                                                            'comprehension'
                                                    )
                                                return dataMemo?.comment
                                            }
                                            return <></>
                                        }}
                                    />
                                    <Column
                                        title='Tương tác trên lớp'
                                        dataIndex='memo'
                                        key='performance'
                                        width={150}
                                        align='center'
                                        render={(text: any, record: any) => {
                                            if (
                                                text?.other &&
                                                text?.other?.length > 0
                                            ) {
                                                const dataMemo =
                                                    text?.other.find(
                                                        (x: any) =>
                                                            x.keyword ===
                                                            'performance'
                                                    )
                                                return dataMemo?.comment
                                            }
                                            return <></>
                                        }}
                                    />
                                </ColumnGroup>
                            </Table>
                        )}
                    </Col>
                </Row>
                <Row className='mt-4'>
                    {modalType !== EnumLAModalType.VIEW && (
                        <>
                            <Col span={3}>
                                <div>Type:</div>
                            </Col>
                            <Col span={20}>
                                <Form.Item name='type'>
                                    <Select
                                        style={{
                                            width: '250px',
                                            borderRadius: '10px',
                                            marginRight: '15px'
                                        }}
                                        placeholder='Choose Type'
                                        defaultValue={
                                            EnumLAReportType.DILIGENCE
                                        }
                                        onChange={(val) => {
                                            setValues({
                                                type: val
                                            })
                                        }}
                                    >
                                        <Select.Option
                                            value={EnumLAReportType.DILIGENCE}
                                        >
                                            Báo cáo chuyên cần
                                        </Select.Option>
                                        <Select.Option
                                            value={EnumLAReportType.OTHER}
                                        >
                                            Other
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={22} className='mb-2'>
                                <b>Assessment of learning by AI:</b>
                            </Col>
                            <Col span={3}>
                                <div>Choose category:</div>
                            </Col>
                            <Col span={20}>
                                <Form.Item name='prompt_category'>
                                    <Select
                                        style={{
                                            width: '250px',
                                            borderRadius: '10px',
                                            marginRight: '15px'
                                        }}
                                        placeholder='Choose Prompt Category'
                                        showSearch
                                        autoClearSearchValue
                                        allowClear
                                        filterOption={false}
                                        loading={promptCategory.isLoading}
                                        onPopupScroll={loadMorePromptCategory}
                                        onSearch={_.debounce(
                                            onSearchPromptCategory,
                                            300
                                        )}
                                        onChange={(val) => {
                                            handlerPromptCategory(val)
                                        }}
                                    >
                                        {renderPromptCategory()}
                                        {promptCategory.isLoading && (
                                            <Select.Option
                                                key='loading'
                                                value=''
                                            >
                                                <Spin size='small' />
                                            </Select.Option>
                                        )}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <div>Choose prompt:</div>
                            </Col>
                            <Col span={20}>
                                <Form.Item name='prompt_template'>
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
                                        loading={promptTemplate.isLoading}
                                        onPopupScroll={loadMorePromptTemplate}
                                        onSearch={_.debounce(
                                            onSearchPromptTemplate,
                                            300
                                        )}
                                        onChange={(val) => {
                                            handlerPromptTemplate(val)
                                        }}
                                    >
                                        {renderPromptTemplate()}
                                        {promptTemplate.isLoading && (
                                            <Select.Option
                                                key='loading'
                                                value=''
                                            >
                                                <Spin size='small' />
                                            </Select.Option>
                                        )}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <div>Description:</div>
                            </Col>
                            <Col span={20} className='mb-4'>
                                <TextArea
                                    rows={3}
                                    value={
                                        promptTemplate?.data_choose?.description
                                    }
                                    readOnly
                                />
                            </Col>
                            <Col span={3}>
                                <div>Prompt:</div>
                            </Col>
                            <Col span={20} className='mb-4'>
                                <TextArea
                                    rows={5}
                                    value={promptTemplate?.data_choose?.prompt}
                                    readOnly
                                />
                            </Col>
                            <Col span={3}>
                                <div></div>
                            </Col>
                            <Col span={20} className='mb-4'>
                                <Popconfirm
                                    placement='top'
                                    title='Are you sure to evaluate reports with AI?'
                                    onConfirm={() => autoRateMemo()}
                                    okText='Ok'
                                    disabled={
                                        isLoadingAutoRate ||
                                        !promptTemplate.data_choose
                                    }
                                    cancelText='Cancel'
                                >
                                    <Button
                                        type='primary'
                                        className='mr-4'
                                        disabled={
                                            isLoadingAutoRate ||
                                            !promptTemplate.data_choose
                                        }
                                        loading={isLoadingAutoRate}
                                    >
                                        Evaluate reports by AI
                                    </Button>
                                </Popconfirm>
                            </Col>
                            <Col span={22}>
                                <b>Assessment Summary:</b>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='memo'>
                                    <TextEditor heightCustom={400} />
                                    {/* <TextArea
                                        value={data.memo}
                                        rows={10}
                                    ></TextArea> */}
                                </Form.Item>
                            </Col>
                        </>
                    )}
                    {modalType === EnumLAModalType.VIEW && data.memo && (
                        <>
                            <Col span={4}>
                                <b>Tóm tắt đánh giá:</b>
                            </Col>
                            <Col span={24}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: sanitize(data.memo)
                                    }}
                                />
                            </Col>
                        </>
                    )}
                </Row>
            </Form>
        </>
    )

    return (
        <Modal
            centered
            closable
            // maskClosable={true}
            visible={visible}
            onCancel={() => handleClose()}
            title={`BÁO CÁO KẾT QUẢ CHUYÊN CẦN  ${moment(
                data?.start_time
            ).format('DD/MM/YYYY')} - ${moment(data?.end_time).format(
                'DD/MM/YYYY'
            )}`}
            style={{ textAlign: 'center' }}
            footer={[
                <Button
                    key='Close'
                    type='default'
                    onClick={() => handleClose()}
                >
                    Close
                </Button>,
                modalType !== EnumLAModalType.VIEW && (
                    <Button
                        key='save'
                        type='primary'
                        onClick={() => form.submit()}
                        loading={isLoading}
                    >
                        Save
                    </Button>
                )
            ]}
            width={1100}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(LearningAssessmentModal)
