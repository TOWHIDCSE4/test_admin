/* eslint-disable react/no-danger */
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Input,
    DatePicker,
    Space,
    Button,
    Popover,
    Select,
    Tag,
    Rate,
    Checkbox
} from 'antd'
import {
    EllipsisOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    SkypeOutlined
} from '@ant-design/icons'
import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import ReportAPI from 'api/ReportAPI'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import EditTextModal from 'core/Atoms/Modals/EditText/index'
import './index.css'
import sanitizeHtml from 'sanitize-html'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NameTeacherStudent from 'components/name-teacher-student'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

enum EnumReportType {
    RECOMMEND = 1,
    REPORT = 2
}

const { Option } = Select

enum EnumRecommendStatus {
    PENDING = 1,
    PROCESSING = 2,
    COMPLETED = 3,
    CANCELED = 4,
    CLOSED = 5
}

const Claims = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            pageNumber: 1,
            pageSize: 3,
            total: 1,
            reports: [],
            visibleModal: false,
            recommendStatus: EnumRecommendStatus.PENDING
        }
    )
    const [selectedReport, setSelectedReport] = useState(null)

    const fetchData = useCallback(
        ({
            page_number,
            page_size,
            min_start_time,
            max_end_time,
            recommend_status,
            report_user_id
        }) => {
            setValues({ isLoading: true })
            ReportAPI.getReportList({
                page_number,
                page_size,
                min_start_time,
                max_end_time,
                recommend_status,
                report_user_id,
                type: EnumReportType.REPORT
            })
                .then((res) => {
                    if (res.pagination && res.pagination.total >= 0) {
                        setValues({ total: res.pagination.total })
                    } else {
                        setValues({ total: 0 })
                    }
                    setValues({ reports: res.data })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        []
    )

    const refetchData = () => {
        fetchData({
            page_number: values.pageNumber,
            page_size: values.pageSize,
            recommend_status: values.recommendStatus,
            report_user_id: values.reportUserId
        })
    }

    const toggleModal = useCallback(
        (v) => {
            setValues({ visibleModal: !values.visibleModal })
            if (v) setSelectedReport(v)
        },
        [values.visibleModal, selectedReport]
    )

    const updateReport = useCallback(
        (value, record) => {
            const payload: any = {}
            if (value.recommend_status)
                payload.recommend_status = value.recommend_status
            if (value.report_solution)
                payload.report_solution = value.report_solution
            if (value.resolve_user_id)
                payload.resolve_user_id = value.resolve_user_id
            ReportAPI.updateReport({
                id: record.id,
                ...payload
            })
                .then((res) => {
                    notification.success({
                        message: 'Update Success'
                    })
                    refetchData()
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [values.reports]
    )

    const columns: ColumnsType = [
        {
            title: 'Created Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                moment(record.created_time).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Booking',
            dataIndex: 'booking',
            key: 'booking',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <Popover content={<>Booking</>}>{text?.id}</Popover>
            )
        },
        {
            title: 'Report',
            dataIndex: 'report_content',
            key: 'report_content',
            align: 'center',
            width: '10%',
            render: (text, record: any) => (
                <Popover
                    content={
                        <div style={{ width: '500px' }}>
                            <Row gutter={[48, 24]}>
                                <Col span={12}>
                                    <h6>
                                        <b>Teacher</b>
                                    </h6>
                                    <Row>
                                        <Col flex='auto'>Late to class :</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.teacher?.is_late}
                                            />
                                        </Col>
                                    </Row>
                                    {/* <Row>
                                        <Col flex='auto'></Col>
                                        <Col flex='0'></Col>
                                    </Row> */}
                                    <Row>
                                        <Col flex='auto'>Not enough time</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={
                                                    text?.teacher
                                                        ?.not_enough_time
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Teaching method</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={
                                                    text?.teacher?.teaching
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Bad attitude</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={
                                                    text?.teacher?.bad_attitude
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div>Comment : </div>
                                        <p>{text?.teacher?.comment}</p>
                                    </Row>
                                </Col>
                                <Col span={12}>
                                    <h6>
                                        <b>Material</b>
                                    </h6>
                                    <Row>
                                        <Col flex='auto'>Bad document</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={
                                                    text?.document?.bad_document
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Easy</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.document?.easy}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Hard</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.document?.hard}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Resonable</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.document?.normal}
                                            />
                                        </Col>
                                    </Row>
                                    Comment : <p>{text?.document?.comment}</p>
                                    <br />
                                </Col>
                            </Row>
                            <Row gutter={[48, 24]}>
                                <Col span={12}>
                                    <h6>
                                        <b>Network</b>
                                    </h6>
                                    <Row>
                                        <Col flex='auto'>Good</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.network?.good}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Bad</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.network?.bad}
                                            />
                                        </Col>
                                    </Row>
                                    Comment : <p>{text?.network?.comment}</p>
                                    <br />
                                </Col>
                                <Col span={12}>
                                    <h6>
                                        <b>Homework</b>
                                    </h6>
                                    <Row>
                                        <Col flex='auto'>Bad Homework</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={
                                                    text?.homework?.bad_homework
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Easy</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.homework?.easy}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Hard</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.homework?.hard}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex='auto'>Reasonable</Col>
                                        <Col flex='0'>
                                            <Checkbox
                                                checked={text?.homework?.normal}
                                            />
                                        </Col>
                                    </Row>
                                    Comment
                                    <p>{text?.homework?.comment}</p>
                                    <br />
                                </Col>
                            </Row>
                        </div>
                    }
                >
                    <span>
                        <Rate value={text?.rating} disabled />
                    </span>
                </Popover>
            )
        },
        {
            title: 'Report User',
            dataIndex: 'report_teacher',
            key: 'report_teacher',
            align: 'center',
            width: '5%',
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
            title: 'Teacher Feedback',
            dataIndex: 'report_teacher_feedback',
            key: 'report_teacher_feedback',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <Popover
                    content={
                        <div
                            dangerouslySetInnerHTML={{ __html: sanitize(text) }}
                        />
                    }
                >
                    <Tag>Preview</Tag>
                </Popover>
            )
        },
        {
            title: 'Resolve of iSpeak',
            dataIndex: 'report_solution',
            key: 'report_solution',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <>
                    <Popover
                        content={
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: sanitize(text)
                                }}
                            />
                        }
                    >
                        <Tag>Preview</Tag>
                    </Popover>
                    <EditOutlined onClick={() => toggleModal(record)} />
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'recommend_status',
            key: 'recommend_status',
            align: 'center',
            width: '5%',
            render: (text, record: any) => (
                <Select
                    defaultValue={EnumRecommendStatus[text]}
                    style={{ width: '100%' }}
                    onChange={(v) =>
                        checkPermission(PERMISSIONS.t2scr_update) &&
                        updateReport({ recommend_status: v }, record)
                    }
                >
                    <Option value={EnumRecommendStatus.PENDING}>PENDING</Option>
                    <Option value={EnumRecommendStatus.PROCESSING}>
                        PROCESSING
                    </Option>
                    <Option value={EnumRecommendStatus.COMPLETED}>
                        COMPLETED
                    </Option>
                    <Option value={EnumRecommendStatus.CANCELED}>
                        CANCELED
                    </Option>
                </Select>
            )
        }
    ]

    useEffect(() => {
        fetchData({
            page_number: values.pageNumber,
            page_size: values.pageSize,
            recommend_status: values.recommendStatus,
            report_user_id: values.reportUserId
        })
    }, [])

    const updateSolution = useCallback(
        (solution) => {
            updateReport(
                { report_solution: solution.str_value },
                selectedReport
            )
            setValues({ visibleModal: false })
            refetchData()
        },
        [values.visibleModal, selectedReport]
    )

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setValues({ pageNumber: page_number, pageSize: page_size })
            fetchData({
                page_number,
                page_size,
                recommend_status: values.recommendStatus
            })
        },
        [
            values.pageNumber,
            values.pageSize,
            values.recommendStatus,
            values.reportUserId
        ]
    )

    const handlerStatusFilter = useCallback(
        (v) => {
            setValues({ recommendStatus: v })
            fetchData({
                page_number: values.pageNumber,
                page_size: values.pageSize,
                recommend_status: v,
                report_user_id: values.reportUserId
            })
        },
        [values]
    )

    const handlerUserFilter = useCallback(
        (v) => {
            setValues({ report_user_id: v })
            fetchData({
                page_number: values.pageNumber,
                page_size: values.pageSize,
                recommend_status: values.recommendStatus,
                report_user_id: v
            })
        },
        [values]
    )

    const fetchUser = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            q
        })
        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const filterEngines: IFilterEngine[] = [
        {
            label: 'User',
            engine: (
                <DebounceSelect
                    defaultValue={values.reportUserId}
                    placeholder='Search by user'
                    fetchOptions={fetchUser}
                    allowClear
                    onClear={() => refetchData()}
                    style={{ width: '100%' }}
                    onChange={(v) => handlerUserFilter(v)}
                />
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    // defaultValue={reportStatus}
                    placeholder='Status'
                    style={{ width: '100%' }}
                    allowClear
                    value={values.recommendStatus}
                    onChange={(v) => handlerStatusFilter(v)}
                >
                    <Option value={EnumRecommendStatus.PENDING}>PENDING</Option>
                    <Option value={EnumRecommendStatus.PROCESSING}>
                        PROCESSING
                    </Option>
                    <Option value={EnumRecommendStatus.COMPLETED}>
                        COMPLETED
                    </Option>
                    <Option value={EnumRecommendStatus.CANCELED}>
                        CANCELED
                    </Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='Reports'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                columns={columns}
                dataSource={values.reports}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.pageNumber,
                    pageSize: values.pageSize,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record.id}
                rowClassName={(record: any) =>
                    record.recommend_status === EnumRecommendStatus.PENDING ||
                    record.recommend_status === EnumRecommendStatus.PROCESSING
                        ? 'row-red'
                        : record.recommend_status ===
                          EnumRecommendStatus.PROCESSING
                        ? 'row-blue'
                        : record.recommend_status ===
                          EnumRecommendStatus.COMPLETED
                        ? 'row-green'
                        : 'row-gray'
                }
            />
            <EditTextModal
                visible={values.visibleModal}
                toggleModal={toggleModal}
                title='Edit Report Solution'
                onUpdate={updateSolution}
                textValue={selectedReport?.report_solution}
            />
        </Card>
    )
}

export default Claims
