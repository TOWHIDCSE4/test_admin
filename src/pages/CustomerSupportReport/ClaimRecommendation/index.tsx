/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback } from 'react'
import './index.css'
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
    Tag
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentAPI from 'api/StudentAPI'
import UserAPI from 'api/UserAPI'
import EditTextModal from 'core/Atoms/Modals/EditText/index'
import {
    EllipsisOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    SkypeOutlined
} from '@ant-design/icons'
import { update } from 'lodash'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import sanitizeHtml from 'sanitize-html'
import {
    EnumRecommendSection,
    EnumRecommendStatus,
    EnumReportType
} from 'const/reports'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Option } = Select
const { RangePicker } = DatePicker

const UserReport = ({ ...props }) => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisibleModal] = useState(false)
    // const [minStartTime, setMinStartTime] = useState(
    //     moment().startOf('month').valueOf()
    // )
    // const [maxEndTime, setMaxEndTime] = useState(
    //     moment().endOf('month').valueOf()
    // )
    const [selectedReport, setSelectedReport] = useState(null)

    const [reportUserId, setReportUserId] = useState(null)
    const [resolveUserId, setResolveUserId] = useState(null)
    const [recommendStatus, setRecommendStatus] = useState(1)
    const [reportSection, setReportSection] = useState(null)
    const [month, setMonth] = useState(moment().startOf('month').valueOf())

    const getReports = useCallback(
        ({
            page_size,
            page_number,
            // min_start_time,
            // max_end_time,
            report_user_id,
            resolve_user_id,
            recommend_status,
            recommend_section,
            search_month
        }) => {
            setLoading(true)
            ReportAPI.getReportList({
                page_number,
                page_size,
                // min_start_time,
                // max_end_time,
                report_user_id,
                resolve_user_id,
                recommend_status,
                recommend_section,
                type: EnumReportType.RECOMMEND,
                month: search_month
            })
                .then((res) => {
                    if (res.pagination && res.pagination.total >= 0) {
                        setTotal(res.pagination.total)
                    } else {
                        setTotal(0)
                    }
                    setReports(res.data)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
        },
        []
    )

    const refetchData = () => {
        getReports({
            page_number: pageNumber,
            page_size: pageSize,
            // min_start_time: minStartTime,
            // max_end_time: maxEndTime,
            report_user_id: reportUserId,
            resolve_user_id: resolveUserId,
            recommend_status: recommendStatus,
            recommend_section: reportSection,
            search_month: month
        })
    }

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageNumber(page_number)
            setPageSize(page_size)
            getReports({
                page_number,
                page_size,
                // min_start_time: minStartTime,
                // max_end_time: maxEndTime,
                report_user_id: reportUserId,
                resolve_user_id: resolveUserId,
                recommend_status: recommendStatus,
                recommend_section: reportSection,
                search_month: month
            })
        },
        [
            pageNumber,
            pageSize,
            reportUserId,
            resolveUserId,
            recommendStatus,
            reportSection,
            month
        ]
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
        [reports]
    )

    const updateSolution = useCallback(
        (solution) => {
            updateReport(
                { report_solution: solution.str_value },
                selectedReport
            )
            setVisibleModal(false)
            // refetchData()
        },
        [visibleModal, selectedReport]
    )

    const updateResolveUser = useCallback(
        (resolve_user_id, record) => {
            updateReport({ resolve_user_id }, record)
        },
        [selectedReport]
    )

    const fetchAdministrators = useCallback(
        async (search) => {
            const res = await AdministratorAPI.getAllAdministrators({
                search
            })
            return res.data.map((i: any) => ({
                label: i.fullname,
                value: i.id
            }))
        },
        [reports]
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

    useEffect(() => {
        getReports({
            page_number: pageNumber,
            page_size: pageSize,
            report_user_id: reportUserId,
            resolve_user_id: resolveUserId,
            recommend_status: recommendStatus,
            recommend_section: reportSection,
            // min_start_time: minStartTime,
            // max_end_time: maxEndTime
            search_month: month
        })
    }, [])

    const toggleModal = useCallback(
        (v) => {
            setVisibleModal(!visibleModal)
            if (v) setSelectedReport(v)
        },
        [visibleModal, selectedReport]
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
            title: 'Report User',
            dataIndex: 'report_user',
            key: 'report_user',
            align: 'center',
            width: '8%',
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {text?.email}
                            <br />
                            <b>Phone:</b> {text?.phone_number}
                            <br />
                            <b>Skype:</b> {text?.skype_account}
                        </>
                    }
                >
                    <p className='mb-2'>
                        <b>
                            {text?.role === 1 || text?.role[0] === 1
                                ? 'Student'
                                : 'Teacher'}
                            :
                        </b>{' '}
                        {text && `${text.full_name} - ${text.username}`}
                    </p>
                </Popover>
            )
        },
        {
            title: 'Content',
            dataIndex: 'recommend_content',
            key: 'recommend_content',
            align: 'center',
            width: '15%',
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
            title: 'Section',
            dataIndex: 'recommend_section',
            key: 'recommend_section',
            align: 'center',
            width: '5%',
            render: (text: string, record: any) => EnumRecommendSection[text]
        },
        {
            title: 'Solution',
            dataIndex: 'report_solution',
            key: 'report_solution',
            align: 'center',
            width: '15%',
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
                </>
            )
        },
        {
            title: 'Resolve User',
            dataIndex: 'resolve_user',
            key: 'resolve_user',
            align: 'center',
            width: '8%',
            render: (text, record: any) => (
                <DebounceSelect
                    onChange={(value) => updateResolveUser(value, record)}
                    placeholder='Select resolve user'
                    fetchOptions={fetchAdministrators}
                    allowClear
                    disabled
                    defaultValue={record.resolve_user_id}
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'recommend_status',
            key: 'recommend_status',
            align: 'center',
            width: '10%',
            render: (text, record: any) => (
                <Select
                    defaultValue={EnumRecommendStatus[text]}
                    style={{ width: '100%' }}
                    disabled
                    onChange={(v) =>
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
        },
        {
            title: 'Deadline',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: '10%',
            render: (text, record: any) =>
                moment(record.created_time)
                    .subtract(-1, 'days')
                    .format('DD/MM/YYYY HH:mm:ss')
        }
    ]
    const handleSearchChange = useCallback((searchObject) => {
        // if (searchObject.resolve_user_id) {
        //     setResolveUserId(searchObject.resolve_user_id)
        // }
        // if (searchObject.report_user_id) {
        //     setReportUserId(searchObject.report_user_id)
        // }
        // if (searchObject.report_section) {
        //     setReportSection(searchObject.report_section)
        // }
        // if (searchObject.status) {
        //     setStatus(searchObject.status)
        // }
        getReports({
            page_number: pageNumber,
            page_size: pageSize,
            report_user_id: searchObject.report_user_id,
            resolve_user_id: searchObject.resolve_user_id,
            recommend_section: searchObject.recommend_section,
            recommend_status: searchObject.recommend_status,
            search_month: month
        })
    }, [])
    const handleChangeResoleUser = useCallback(
        (v) => {
            setResolveUserId(v)
            getReports({
                page_size: pageSize,
                page_number: pageNumber,
                resolve_user_id: v,
                report_user_id: reportUserId,
                recommend_section: reportSection,
                recommend_status: recommendStatus,
                search_month: month
            })
        },
        [pageSize, pageNumber, reportUserId, reportSection, recommendStatus]
    )
    const handleChangeReportUser = useCallback(
        (v) => {
            setReportUserId(v)
            getReports({
                page_size: pageSize,
                page_number: pageNumber,
                resolve_user_id: resolveUserId,
                report_user_id: v,
                recommend_section: reportSection,
                recommend_status: recommendStatus,
                search_month: month
            })
        },
        [pageSize, pageNumber, resolveUserId, reportSection, recommendStatus]
    )
    const handleChangeRecommendStatus = useCallback(
        (v) => {
            setRecommendStatus(v)
            getReports({
                page_size: pageSize,
                page_number: pageNumber,
                resolve_user_id: resolveUserId,
                report_user_id: reportUserId,
                recommend_section: reportSection,
                recommend_status: v,
                search_month: month
            })
        },
        [pageSize, pageNumber, reportUserId, reportSection, resolveUserId]
    )
    const handleChangeRecommendSection = useCallback(
        (v) => {
            setReportSection(v)
            getReports({
                page_size: pageSize,
                page_number: pageNumber,
                resolve_user_id: resolveUserId,
                report_user_id: reportUserId,
                recommend_section: v,
                recommend_status: recommendStatus,
                search_month: month
            })
        },
        [
            pageSize,
            pageNumber,
            reportUserId,
            resolveUserId,
            recommendStatus,
            month
        ]
    )

    const handleRangePickerMonth = useCallback(
        (value) => {
            if (value) {
                setMonth(value.clone().startOf('month').valueOf())
                getReports({
                    page_size: pageSize,
                    page_number: pageNumber,
                    resolve_user_id: resolveUserId,
                    report_user_id: reportUserId,
                    recommend_section: reportSection,
                    recommend_status: recommendStatus,
                    search_month: value.clone().startOf('month').valueOf()
                })
            }
        },
        [pageSize, pageNumber, reportUserId, resolveUserId, recommendStatus]
    )

    // const handleRangePicker = useCallback(
    //     (time_range) => {
    //         if (
    //             time_range &&
    //             time_range[0] &&
    //             time_range[1] &&
    //             time_range[0] < time_range[1]
    //         ) {
    //             setMinStartTime(time_range[0].valueOf())
    //             setMaxEndTime(time_range[1].valueOf())
    //             getReports({
    //                 page_number: pageNumber,
    //                 page_size: pageSize,
    //                 min_start_time: time_range[0].valueOf(),
    //                 max_end_time: time_range[1].valueOf()
    //             })
    //         } else {
    //             notification.error({
    //                 message: 'Error',
    //                 description: 'Date time invalid'
    //             })
    //         }
    //     },
    //     [maxEndTime, minStartTime, pageNumber, pageSize]
    // )

    return (
        <Card title='User Claim and Recommendation'>
            <Row className='mb-4' justify='end' gutter={[10, 10]}>
                {/* <Col span={6} offset={0}>
                    <RangePicker
                        allowClear={false}
                        onChange={handleRangePicker}
                        value={[moment(minStartTime), moment(maxEndTime)]}
                    />
                </Col> */}
                <Col span={4} style={{ paddingLeft: 0 }}>
                    <DatePicker
                        allowClear={false}
                        picker='month'
                        disabledDate={(current) => current >= moment()}
                        onChange={handleRangePickerMonth}
                        defaultValue={moment()}
                    />
                </Col>
                <Col span={4}>
                    <DebounceSelect
                        // defaultValue={resolveUserId}
                        placeholder='Search by resolve admin'
                        fetchOptions={fetchAdministrators}
                        allowClear
                        onClear={() =>
                            getReports({
                                page_number: pageNumber,
                                page_size: pageSize
                            })
                        }
                        style={{ width: '100%' }}
                        onChange={(v) => handleChangeResoleUser(v)}
                    />
                </Col>
                <Col span={4}>
                    <DebounceSelect
                        // defaultValue={reportUserId}
                        placeholder='Search by user'
                        fetchOptions={fetchUser}
                        allowClear
                        onClear={() => refetchData}
                        style={{ width: '100%' }}
                        onChange={(v) => handleChangeReportUser(v)}
                    />
                </Col>
                <Col span={4}>
                    <Select
                        defaultValue={recommendStatus}
                        placeholder='Status'
                        style={{ width: '100%' }}
                        allowClear
                        onChange={(v) => handleChangeRecommendStatus(v)}
                    >
                        <Option value={EnumRecommendStatus.PENDING}>
                            PENDING
                        </Option>
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
                </Col>
                <Col span={4}>
                    <Select
                        // defaultValue={reportSection}
                        placeholder='Section'
                        style={{ width: '100%' }}
                        allowClear
                        onChange={(v) => handleChangeRecommendSection(v)}
                    >
                        {Object.values(EnumRecommendSection).map((key) => {
                            if (!isNaN(Number(key))) {
                                return (
                                    <Option value={key} key={key}>
                                        {EnumRecommendSection[key]}
                                    </Option>
                                )
                            }
                            return null
                        })}
                    </Select>
                </Col>
                {/* <Col>
                    <Space size={16}>
                        <Button type='primary' onClick={() => {}}>
                            Add New
                        </Button>
                    </Space>
                </Col> */}
            </Row>
            <Table
                bordered
                columns={columns}
                dataSource={reports}
                loading={loading}
                rowClassName={(record: any) =>
                    moment().diff(moment(record.created_time)) >
                        24 * 60 * 60 * 1000 &&
                    (record.recommend_status === EnumRecommendStatus.PENDING ||
                        record.recommend_status ===
                            EnumRecommendStatus.PROCESSING)
                        ? 'row-red'
                        : record.recommend_status ===
                          EnumRecommendStatus.PROCESSING
                        ? 'row-blue'
                        : record.recommend_status ===
                          EnumRecommendStatus.COMPLETED
                        ? 'row-green'
                        : 'row-gray'
                }
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record.id}
            />
            <EditTextModal
                visible={visibleModal}
                toggleModal={toggleModal}
                title='Edit Report Solution'
                onUpdate={updateSolution}
                textValue={selectedReport?.report_solution}
            />
        </Card>
    )
}

export default UserReport
