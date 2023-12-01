/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback, useReducer } from 'react'
import './index.css'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    DatePicker,
    Popover,
    Select,
    Tag,
    Collapse,
    Checkbox,
    Form,
    Button,
    Input,
    Spin,
    Tooltip
} from 'antd'
import _ from 'lodash'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import UserAPI from 'api/UserAPI'
import { EditFilled } from '@ant-design/icons'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import sanitizeHtml from 'sanitize-html'
import { EnumAction } from 'const/enum'
import { DEPARTMENT } from 'const/department'
import { blue } from '@ant-design/colors'
import { exportReportToXlsx } from 'utils/export-xlsx'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

import {
    EnumRecommendSection,
    EnumRecommendStatus,
    EnumClassify,
    EnumLevel,
    EnumReportType
} from 'const/reports'
import ClaimModal from '../../../core/Atoms/Modals/ClaimModal'
import AddClaimModal from './AddClaimModal'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Option } = Select
const { Panel } = Collapse

const UserReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            reports: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            isShownModal: false,
            isShownModalAdd: false,
            objectSearch: {
                month: moment().startOf('month').valueOf(),
                resolve_user_id: '',
                report_user_id: '',
                recommend_status: '',
                recommend_section: ''
            },
            hiddenColumns: {
                created_user: false,
                created_time: false,
                report_user: false,
                recommend_content: false,
                recommend_section: false,
                classify: false,
                level: false,
                error_cause: false,
                report_solution: false,
                other_handler: false,
                department_staff_feedback: false,
                resolve_user: false,
                recommend_status: false,
                deadline: false
            },
            listAdmin: [],
            listDepartmentAndStaff: []
        }
    )

    const [loadingExport, setLoadingExport] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [form] = Form.useForm()

    const getReports = ({ page_size, page_number, objectSearch }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            ...objectSearch,
            month: values.objectSearch.month,
            type: EnumReportType.RECOMMEND
        }
        ReportAPI.getReportList(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ reports: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const refetchData = useCallback(() => {
        getReports({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: values.objectSearch
        })
    }, [values])

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getReports({
            page_number,
            page_size,
            objectSearch: values.objectSearch
        })
    }

    const toggleModal = useCallback(
        (value) => {
            setValues({
                isShownModal: value
            })
        },
        [values]
    )

    const toggleModalAdd = useCallback(
        (value) => {
            setValues({
                isShownModalAdd: value
            })
        },
        [values]
    )

    const fetchAdministrators = async (search) => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                search
            })
            const grouped = _.mapValues(
                _.groupBy(res.data, 'department.department.name'),
                (clist) => {
                    return {
                        id: clist[0]?.department?.department?.id,
                        name: clist[0]?.department?.department?.name,
                        list: clist.map((e) => _.omit(e, 'make'))
                    }
                }
            )
            const myData = Object.keys(grouped)
                .filter((e) => e !== 'undefined')
                .map((key) => {
                    return grouped[key]
                })
            setValues({
                listDepartmentAndStaff: myData,
                listAdmin: res.data
                    .filter(
                        (e) =>
                            e?.department?.department?.id ===
                            DEPARTMENT.phongcskh.id
                    )
                    .map((i: any) => ({
                        label: i.fullname,
                        value: i.id
                    }))
            })
        } catch (error) {
            console.error(error)
        }
    }

    const fetchUser = async (q) => {
        try {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchAdministrators('')
        form.setFieldsValue({
            ...values.objectSearch
        })
        getReports({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
    }, [])

    const onClickUpdateData = (record) => {
        toggleModal(true)
        setSelectedReport(record)
    }

    const exportCustomer = async () => {
        setLoadingExport(true)
        try {
            const searchData = {
                page_size: 9999,
                page_number: 1,
                ...values.objectSearch,
                type: EnumReportType.RECOMMEND
            }

            const data = await ReportAPI.getReportList(searchData)
            if (data.data) {
                const exportData = data.data
                for (const iterator of exportData) {
                    const department = values.listDepartmentAndStaff.find(
                        (e) => e.id === iterator.processing_department_id
                    )
                    const handler = department
                        ? department.list.find(
                              (e) => e.id === iterator.department_staff_id
                          )
                        : iterator.department_staff_id
                    iterator.otherDepartment = department
                    iterator.otherHandler = handler
                }
                await exportReportToXlsx('ClaimRecommentations', exportData)
            }
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setLoadingExport(false)
    }

    const handleRangePicker = useCallback((value) => {
        if (value) {
            setValues({
                objectSearch: {
                    ...values.objectSearch,
                    month: value.clone().startOf('month').valueOf()
                }
            })
        }
    }, [])

    const columns: any = [
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'left',
            width: 200,
            hidden: values.hiddenColumns.created_time,
            render: (text, record: any) => {
                return (
                    <>
                        <p className='d-flex'>
                            <b style={{ width: '65px', display: 'block' }}>
                                Created:
                            </b>
                            {moment(record.created_time).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </p>
                        {/* <p className='d-flex'>
                            <b style={{ width: '65px', display: 'block' }}>
                                Deadline:
                            </b>
                            {moment(record.created_time)
                                .subtract(-1, 'days')
                                .format('DD/MM/YYYY HH:mm')}
                        </p> */}
                    </>
                )
            }
        },
        {
            title: 'Created by',
            dataIndex: 'created_user',
            key: 'created_user',
            align: 'left',
            width: 200,
            hidden: values.hiddenColumns.created_user,
            render: (text, record: any) => {
                if (text)
                    return (
                        <>
                            <p className='d-flex'>{`${text?.fullname} (${text?.username}-${text?.department?.name})`}</p>
                        </>
                    )
            }
        },
        {
            title: 'Report User',
            dataIndex: 'report_user',
            key: 'report_user',
            align: 'center',
            width: 300,
            hidden: values.hiddenColumns.report_user,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Username:</b> {text?.username} <br />
                            <b>Email:</b>{' '}
                            <a href={`mailto:${text?.email}`}>{text?.email}</a>
                            <br />
                            <b>Phone:</b>{' '}
                            <a href={`tel:${text?.emphone_numberail}`}>
                                {text?.phone_number}
                            </a>
                            <br />
                            <b>Skype:</b> {text?.skype_account}
                        </>
                    }
                >
                    <p className='mb-2 '>
                        <b>
                            {text?.role === 1 || text?.role[0] === 1
                                ? 'Student'
                                : 'Teacher'}
                            :
                        </b>{' '}
                        {text && `${text.full_name} - ${text.usename}`}
                    </p>
                </Popover>
            )
        },
        {
            title: 'Content',
            dataIndex: 'recommend_content',
            key: 'recommend_content',
            align: 'center',
            width: 100,
            hidden: values.hiddenColumns.recommend_content,
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
            width: 200,
            hidden: values.hiddenColumns.recommend_section,
            render: (text: string, record: any) => EnumRecommendSection[text]
        },
        {
            title: 'Classify',
            dataIndex: 'classify',
            key: 'classify',
            align: 'center',
            width: 200,
            hidden: values.hiddenColumns.classify,
            render: (text: string, record: any) => EnumClassify[text]
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
            width: 200,
            hidden: values.hiddenColumns.level,
            render: (text: string, record: any) => EnumLevel[text]
        },

        {
            title: 'Handler(CS)',
            dataIndex: 'resolve_user',
            key: 'resolve_user',
            align: 'center',
            width: 200,
            hidden: values.hiddenColumns.resolve_user,
            render: (text, record: any) => {
                const department = values.listDepartmentAndStaff.find(
                    (e) => e.id === DEPARTMENT.phongcskh.id
                )
                const handler = department
                    ? department.list.find(
                          (e) => e.id === record.resolve_user_id
                      )
                    : record.resolve_user_id
                return <>{handler ? handler.username : ''}</>
            }
        },
        {
            title: 'Cause',
            dataIndex: 'error_cause',
            key: 'error_cause',
            align: 'center',
            width: 200,
            hidden: values.hiddenColumns.error_cause,
            render: (text: string, record: any) => text
        },
        {
            title: 'Solution',
            dataIndex: 'report_solution',
            key: 'report_solution',
            align: 'center',
            width: 100,
            hidden: values.hiddenColumns.report_solution,
            render: (text, record: any) => (
                <>
                    {text ? (
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
                    ) : (
                        ''
                    )}
                </>
            )
        },
        {
            title: 'Other Handler',
            dataIndex: 'other_handler',
            key: 'other_handler',
            align: 'center',
            width: 250,
            hidden: values.hiddenColumns.other_handler,
            render: (text, record: any) => {
                const department = values.listDepartmentAndStaff.find(
                    (e) => e.id === record.processing_department_id
                )
                const handler = department
                    ? department.list.find(
                          (e) => e.id === record.department_staff_id
                      )
                    : record.department_staff_id
                return department ? (
                    <>
                        <p>
                            <b>Department: </b>{' '}
                            {department
                                ? department.name
                                : record.processing_department_id}
                        </p>
                        <p>
                            <b>Handler: </b> {handler?.username}
                        </p>
                    </>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Feedback from Other handler',
            dataIndex: 'department_staff_feedback',
            key: 'department_staff_feedback',
            align: 'center',
            width: 200,
            hidden: values.hiddenColumns.department_staff_feedback,
            render: (text, record: any) => (
                <>
                    {text ? (
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
                    ) : (
                        ''
                    )}
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'recommend_status',
            key: 'recommend_status',
            align: 'center',
            width: 150,
            fixed: 'right',
            hidden: values.hiddenColumns.recommend_status,
            render: (text, record: any) => {
                return EnumRecommendStatus[text]
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            width: 150,
            fixed: 'right',
            render: (text, record: any) =>
                checkPermission(PERMISSIONS.csmcr_update) ? (
                    <Tooltip title='Edit info'>
                        <EditFilled
                            onClick={() => onClickUpdateData(record)}
                            style={{ color: blue.primary }}
                            type='button'
                        />
                    </Tooltip>
                ) : (
                    <></>
                )
        }
    ]

    const onSearch = (valuesForm) => {
        setValues({
            objectSearch: valuesForm,
            page_number: 1
        })
        getReports({
            page_size: values.page_size,
            page_number: 1,
            objectSearch: valuesForm
        })
    }
    const onReset = () => {
        const objectSearch = {
            month: moment().startOf('month').valueOf(),
            resolve_user_id: '',
            report_user_id: '',
            recommend_status: '',
            recommend_section: ''
        }
        form.setFieldsValue({
            ...objectSearch
        })
        setValues({
            objectSearch,
            page_number: 1
        })
        values.objectSearch.month = moment().startOf('month').valueOf()
        getReports({
            page_size: values.page_size,
            page_number: 1,
            objectSearch
        })
    }

    return (
        <Card title='User Claim and Recommendation'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Month:</Col>
                                    <Col span={16}>
                                        <DatePicker
                                            allowClear={false}
                                            picker='month'
                                            disabledDate={(current) =>
                                                current >= moment()
                                            }
                                            onChange={handleRangePicker}
                                            defaultValue={moment()}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Report user:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='report_user_id'
                                            className='mb-0 w-100'
                                        >
                                            <DebounceSelect
                                                placeholder='Search by report user'
                                                fetchOptions={fetchUser}
                                                allowClear
                                                style={{ width: '100%' }}
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
                                    <Col span={8}>Handler(cs):</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='resolve_user_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                placeholder='Search by handler'
                                                options={values.listAdmin}
                                                allowClear
                                                style={{ width: '100%' }}
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
                                    <Col span={8}>Status:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='recommend_status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                value=''
                                                placeholder='Status'
                                                style={{ width: '100%' }}
                                                allowClear
                                            >
                                                <Option value=''>All</Option>
                                                <Option
                                                    value={
                                                        EnumRecommendStatus.PENDING
                                                    }
                                                >
                                                    PENDING
                                                </Option>
                                                <Option
                                                    value={
                                                        EnumRecommendStatus.PROCESSING
                                                    }
                                                >
                                                    PROCESSING
                                                </Option>
                                                <Option
                                                    value={
                                                        EnumRecommendStatus.COMPLETED
                                                    }
                                                >
                                                    COMPLETED
                                                </Option>
                                                <Option
                                                    value={
                                                        EnumRecommendStatus.CANCELED
                                                    }
                                                >
                                                    CANCELED
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
                                    <Col span={8}>Section:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='recommend_section'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                placeholder='Section'
                                                style={{ width: '100%' }}
                                                allowClear
                                                value=''
                                            >
                                                <Option value=''>All</Option>
                                                {Object.values(
                                                    EnumRecommendSection
                                                ).map((key) => {
                                                    if (!isNaN(Number(key))) {
                                                        return (
                                                            <Option
                                                                value={key}
                                                                key={key}
                                                            >
                                                                {
                                                                    EnumRecommendSection[
                                                                        key
                                                                    ]
                                                                }
                                                            </Option>
                                                        )
                                                    }
                                                    return null
                                                })}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            <Col>
                                <Button
                                    type='primary'
                                    danger
                                    onClick={() => onReset()}
                                >
                                    Reset
                                </Button>
                            </Col>
                            <Col>
                                <Button type='primary' htmlType='submit'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
                <Panel header='Show columns' key='2'>
                    <Checkbox
                        className=' ml-2 mb-2'
                        checked={!values.hiddenColumns.created_time}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    created_time:
                                        !values.hiddenColumns.created_time
                                }
                            })
                        }
                    >
                        Time
                    </Checkbox>
                    <Checkbox
                        className=' ml-2 mb-2'
                        checked={!values.hiddenColumns.created_user}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    created_user:
                                        !values.hiddenColumns.created_user
                                }
                            })
                        }
                    >
                        Created by
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.report_user}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    report_user:
                                        !values.hiddenColumns.report_user
                                }
                            })
                        }
                    >
                        Report user
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.recommend_content}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    recommend_content:
                                        !values.hiddenColumns.recommend_content
                                }
                            })
                        }
                    >
                        Content
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.recommend_section}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    recommend_section:
                                        !values.hiddenColumns.recommend_section
                                }
                            })
                        }
                    >
                        Section
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.classify}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    classify: !values.hiddenColumns.classify
                                }
                            })
                        }
                    >
                        Classify
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.level}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    level: !values.hiddenColumns.level
                                }
                            })
                        }
                    >
                        Level
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.resolve_user}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    resolve_user:
                                        !values.hiddenColumns.resolve_user
                                }
                            })
                        }
                    >
                        Handler
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.error_cause}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    error_cause:
                                        !values.hiddenColumns.error_cause
                                }
                            })
                        }
                    >
                        Cause
                    </Checkbox>

                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.report_solution}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    report_solution:
                                        !values.hiddenColumns.report_solution
                                }
                            })
                        }
                    >
                        Solution
                    </Checkbox>

                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.other_handler}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    other_handler:
                                        !values.hiddenColumns.other_handler
                                }
                            })
                        }
                    >
                        Other Handler
                    </Checkbox>

                    <Checkbox
                        className='mb-2'
                        checked={
                            !values.hiddenColumns.department_staff_feedback
                        }
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    department_staff_feedback:
                                        !values.hiddenColumns
                                            .department_staff_feedback
                                }
                            })
                        }
                    >
                        Feedback from Other handler
                    </Checkbox>
                    <Checkbox
                        className='mb-2'
                        checked={!values.hiddenColumns.recommend_status}
                        onChange={() =>
                            setValues({
                                hiddenColumns: {
                                    ...values.hiddenColumns,
                                    recommend_status:
                                        !values.hiddenColumns.recommend_status
                                }
                            })
                        }
                    >
                        Status
                    </Checkbox>
                </Panel>
            </Collapse>
            <Row className='mb-2'>
                <Col span={24} className='d-flex justify-content-end'>
                    {checkPermission(PERMISSIONS.csmcr_export_excel) && (
                        <Button
                            onClick={exportCustomer}
                            disabled={loadingExport}
                            className='mr-2'
                        >
                            <Spin
                                size='small'
                                className='mr-2'
                                spinning={loadingExport}
                            />
                            Export Excel
                        </Button>
                    )}
                    {checkPermission(PERMISSIONS.csmcr_create) && (
                        <Button
                            type='primary'
                            onClick={() => toggleModalAdd(true)}
                        >
                            Add new
                        </Button>
                    )}
                </Col>
            </Row>
            <Table
                className='student-management-table'
                size='small'
                columns={columns.filter((e) => !e.hidden)}
                dataSource={values.reports}
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
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                scroll={{
                    x: 500,
                    y: 350
                }}
                loading={values.isLoading}
                sticky
                rowKey={(record: any) => record.id}
            />
            <ClaimModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                data={selectedReport}
                refetchData={refetchData}
                listDepartmentAndStaff={values.listDepartmentAndStaff}
            />
            <AddClaimModal
                visible={values.isShownModalAdd}
                toggleModal={toggleModalAdd}
                refetchData={refetchData}
                listDepartmentAndStaff={values.listDepartmentAndStaff}
            />
        </Card>
    )
}

export default UserReport
