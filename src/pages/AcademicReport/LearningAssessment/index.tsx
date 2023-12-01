import React, { useCallback, useEffect, useReducer, useState } from 'react'
import {
    Table,
    Card,
    Menu,
    Dropdown,
    Popover,
    Input,
    notification,
    Checkbox,
    Row,
    Col,
    Tag,
    Modal,
    Popconfirm,
    Button,
    DatePicker,
    Select,
    Tabs
} from 'antd'
import {
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { EnumPackageType, IBooking, IStudent, IUser } from 'types'
import moment from 'moment'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'
import {
    EnumLAModalType,
    EnumLAReportStatus,
    EnumLAReportType,
    textLAReportStatus,
    textLAReportType
} from 'types/ILearningAssessmentReports'
import PromptViewModel from 'pages/TeachingManagement/MemoManagement/prompt-modal'
import LearningAssessmentReportsAPI from 'api/LearningAssessmentReportsAPI'
import { notify } from 'utils/notify'
import UpdateNoteModal from './update-note-modal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import LearningAssessmentModals from './learning-assessment-modals'
import ActionPeriodicLearningAssessmentReportsModal from './action-periodic-modals'
import AdministratorAPI from 'api/AdministratorAPI'
import { DEPARTMENT } from 'const/department'
import FileReportViewModel from './file-report-modal'
import { ORDER_STATUS } from 'const'

const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

export enum EnumTabType {
    DILIGENCE = 1,
    PERIODIC = 2,
    END_TERM = 3
}

const LearningAssessmentReports = ({ ...props }) => {
    const [visibleModal, setVisibleModal] = useState<boolean>(false)
    const [visiblePeriodicModal, setVisiblePeriodicModal] =
        useState<boolean>(false)
    const [visiblePromptModal, setVisiblePromptModal] = useState<boolean>(false)
    const [visibleViewFileModal, setVisibleViewFileModal] =
        useState<boolean>(false)
    const [visibleUpdateNoteModal, setVisibleUpdateNoteModal] =
        useState<boolean>(false)
    const [loadingPublishAll, setloadingPublishAll] = useState<boolean>(false)
    // const [tab_current, settab_current] = useState<any>(EnumTabType.DILIGENCE)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }
    const queryUrl = new URLSearchParams(window.location.search)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            type_modal: EnumLAModalType.VIEW,
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: '',
            learning_assessment_info: {},
            search: '',
            staff_id: '',
            prompt_selected: {},
            create_time: null,
            listAdmin: [],
            tab_current: EnumTabType.DILIGENCE,
            report_id: null
        }
    )

    const fetchLearningAssessmentReports = ({
        page_size,
        page_number,
        status,
        create_time,
        search,
        staff_id,
        tab_current,
        report_id
    }) => {
        setValues({ isLoading: true })
        let typeReport = EnumLAReportType.DILIGENCE
        if (tab_current === EnumTabType.PERIODIC) {
            typeReport = EnumLAReportType.PERIODIC
        } else if (tab_current === EnumTabType.END_TERM) {
            typeReport = EnumLAReportType.END_TERM
        }
        LearningAssessmentReportsAPI.getAllReport({
            page_size,
            page_number,
            status,
            search,
            staff_id,
            type: typeReport,
            create_time,
            report_id
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                } else {
                    total = 0
                }
                setValues({ data_reports: res.data, total })
                if (total === 0 && values.page_number > 1) {
                    fetchLearningAssessmentReports({
                        ...values,
                        page_number: values.page_number - 1
                    })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const fetchAdministrators = async () => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                idDepartment: DEPARTMENT.phongcskh.id
            })
            setValues({
                listAdmin: res.data.map((i: any) => ({
                    label: i.fullname,
                    value: i.id
                }))
            })
        } catch (error) {
            console.error(error)
        }
    }

    const publishReports = () => {
        const data = {
            list_publish: selectedRowKeys
        }
        setValues({ isLoading: true })
        LearningAssessmentReportsAPI.updateStatusReports(data)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Update successful'
                })
                setSelectedRowKeys([])
                fetchLearningAssessmentReports({ ...values })
            })
            .catch((err) => {
                console.log(err)
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => {
                setValues({ isLoading: false })
            })
    }

    useEffect(() => {
        if (queryUrl.get('report_id') && queryUrl.get('type')) {
            values.tab_current = Number(queryUrl.get('type'))
            setValues({
                tab_current: Number(queryUrl.get('type'))
            })
        }
        fetchLearningAssessmentReports({
            ...values,
            report_id: queryUrl.get('report_id')
        })
        fetchAdministrators()
    }, [])

    const refetchData = () => {
        fetchLearningAssessmentReports({ ...values })
    }

    const changeStatus = (id, status) => {
        setValues({ isLoading: true })
        LearningAssessmentReportsAPI.editLAReport(id, {
            status
        })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Successfully'
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

    const toggleModal = useCallback(
        (val: boolean, item?: any, type?: EnumLAModalType) => {
            if (values.tab_current === EnumTabType.DILIGENCE) {
                setVisibleModal(val)
            } else {
                setVisiblePeriodicModal(val)
            }
            if (item) {
                setValues({ ...values, learning_assessment_info: item })
            }
            if (type) {
                setValues({ type_modal: type })
            }
        },
        [visibleModal, visiblePeriodicModal, values]
    )

    const togglePromptModal = useCallback(
        (val: boolean, item?: any) => {
            setVisiblePromptModal(val)
            if (item) {
                setValues({ ...values, prompt_selected: item })
            }
        },
        [visiblePromptModal, values]
    )

    const toggleViewFileModal = useCallback(
        (val: boolean, item?: any) => {
            setVisibleViewFileModal(val)
            if (item) {
                setValues({ ...values, learning_assessment_info: item })
            }
        },
        [visibleViewFileModal, values]
    )

    const toggleUpdateNoteModal = useCallback(
        (visible: boolean, select?: any) => {
            setVisibleUpdateNoteModal(visible)
            setValues({ learning_assessment_info: select || {} })
        },
        [values.selected_booking]
    )

    const removeReport = useCallback((id: number) => {
        setValues({ isLoading: true })
        LearningAssessmentReportsAPI.removeLAReport(id)
            .then((res) => {
                notify('success', 'Remove successfully')
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }, [])

    const onRemove = useCallback((item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeReport(item.id)
            }
        })
    }, [])

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        fetchLearningAssessmentReports({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const onSearch = useCallback(
        (v) => {
            setValues({
                search: v,
                page_number: 1
            })
            fetchLearningAssessmentReports({
                ...values,
                search: v,
                page_number: 1
            })
        },
        [values]
    )

    const onChangeTab = useCallback(
        (key) => {
            values.tab_current = Number(key)
            setValues({ tab_current: Number(key) })
            fetchLearningAssessmentReports({ ...values, page_number: 1 })
        },
        [values]
    )

    const handlerSupporter = useCallback(
        (v) => {
            setValues({ staff_id: v })
            fetchLearningAssessmentReports({
                ...values,
                page_number: 1,
                staff_id: v
            })
        },
        [values]
    )

    const handlerStatus = useCallback(
        (v) => {
            setValues({ status: v })
            fetchLearningAssessmentReports({
                ...values,
                page_number: 1,
                status: v
            })
        },
        [values]
    )

    const handlerDateFilter = useCallback(
        (v) => {
            const time = moment(v).valueOf()
            setValues({ create_time: time })
            fetchLearningAssessmentReports({
                ...values,
                page_number: 1,
                create_time: time
            })
        },
        [values]
    )

    const renderOrderedPackage = (item: any, index: any = -1) =>
        item ? (
            <ul key={`package${index}`} className='list-unstyled'>
                <li>
                    <b>ID: </b>
                    {item.id}
                </li>
                <li>
                    <b>Order Id: </b>
                    {item.order_id}
                </li>
                <li>
                    <b>Type: </b>
                    {item.type === EnumPackageType.STANDARD ? (
                        <Tag color='#108ee9'>STANDARD</Tag>
                    ) : item.type === EnumPackageType.PREMIUM ? (
                        <Tag color='#f50'>PREMIUM</Tag>
                    ) : (
                        <Tag color='#87d068'>TRIAL</Tag>
                    )}
                </li>
                <li>
                    <b>Package: </b>
                    {item.package_name}
                </li>
                <li>
                    <b>Activation date: </b>
                    {`${
                        item.activation_date
                            ? moment(new Date(item?.activation_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Expired date: </b>
                    {`${
                        item.expired_date
                            ? moment(new Date(item?.expired_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Used: </b>
                    {item.original_number_class - item.number_class}/
                    {item.original_number_class}
                </li>
                <li>
                    <b>Booking support: </b>
                    {item?.package?.is_support ? (
                        <Tag color='success'>Support</Tag>
                    ) : (
                        <Tag color='error'>Not support</Tag>
                    )}
                </li>
                <li>
                    <b>Apply for teacher: </b>
                    {item?.package?.location?.name
                        ? item?.package?.location?.name
                        : 'All teachers'}
                </li>
                <li>
                    <b>Status: </b>
                    {(() => {
                        if (
                            item.order &&
                            item.order?.status === ORDER_STATUS.PAID
                        ) {
                            if (
                                item?.expired_date &&
                                moment(item?.expired_date) < moment()
                            ) {
                                return <Tag color='error'>EXPIRED</Tag>
                            }
                            if (item.activation_date) {
                                return <Tag color='success'>ACTIVE</Tag>
                            }
                            return <Tag color='success'>INACTIVE</Tag>
                        }
                    })()}
                </li>
            </ul>
        ) : (
            ''
        )

    const menuActions = (record) => (
        <Menu>
            <Menu.Item
                key='1'
                onClick={() =>
                    values.tab_current === EnumTabType.DILIGENCE
                        ? toggleModal(true, record, EnumLAModalType.VIEW)
                        : toggleViewFileModal(true, record)
                }
            >
                <EyeOutlined className='mr-2' />
                View
            </Menu.Item>
            {checkPermission(PERMISSIONS.arla_update) && (
                <Menu.Item
                    key='2'
                    onClick={() =>
                        toggleModal(true, record, EnumLAModalType.EDIT)
                    }
                >
                    <EditOutlined className='mr-2' />
                    Edit
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.arla_update_note) && (
                <Menu.Item
                    key='3'
                    onClick={() => toggleUpdateNoteModal(true, record)}
                >
                    <EditOutlined className='mr-2' />
                    Update Note
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.arla_delete) && (
                <Menu.Item key='4' onClick={() => onRemove(record)}>
                    <DeleteOutlined className='mr-2' />
                    Delete
                </Menu.Item>
            )}
            <></>
        </Menu>
    )

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            fixed: true,
            width: 70,
            render: (text, record) => text
        },
        {
            title: 'Create Time',
            dataIndex: 'time_create',
            key: 'time_create',
            width: 150,
            align: 'center',
            render: (text: any, record: any) => (
                <>{text && moment(text).format('HH:mm DD/MM/YYYY')}</>
            )
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            width: 340,
            render: (text: IUser, record: any) => {
                return record && record?.user_student?.staff ? (
                    <>
                        <p>
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                        Supporter: {record?.user_student?.staff?.fullname} -{' '}
                        {record?.user_student?.staff?.username}
                    </>
                ) : (
                    <>
                        <p>
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                        Supporter: None
                    </>
                )
            }
        },
        {
            title: 'Duration',
            dataIndex: 'start_time',
            key: 'created_time',
            width: 280,
            align: 'center',
            render: (text: any, record: any) => (
                <>
                    {record &&
                        record?.start_time &&
                        moment(record?.start_time).format(
                            'HH:mm DD/MM/YYYY'
                        )}{' '}
                    -{' '}
                    {record &&
                        record?.end_time &&
                        moment(record?.end_time).format('HH:mm DD/MM/YYYY')}
                </>
            )
        },
        {
            title: 'Number class',
            dataIndex: 'booking_ids',
            key: 'booking_ids',
            width: 100,
            align: 'center',
            render: (text: any, record: any) => text && text.length
        },
        {
            title: 'Prompt',
            dataIndex: 'prompt_template',
            key: 'prompt_template',
            width: 80,
            align: 'center',
            render: (text: any, record: any) => (
                <>
                    <Popover
                        content={
                            <>
                                <b>View Prompt</b>
                            </>
                        }
                    >
                        <span
                            style={{ width: 20 }}
                            onClick={() => togglePromptModal(true, text)}
                        >
                            {text && (
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
                </>
            )
        },
        // {
        //     title: 'Type',
        //     dataIndex: 'type',
        //     key: 'type',
        //     width: 150,
        //     align: 'center',
        //     render: (text: any) => (
        //         <>
        //             {text === EnumLAReportType.DILIGENCE && (
        //                 <p>{textLAReportType.DILIGENCE}</p>
        //             )}
        //             {text === EnumLAReportType.PERIODIC && (
        //                 <p>{textLAReportType.PERIODIC}</p>
        //             )}
        //             {text === EnumLAReportType.END_TERM && (
        //                 <p>{textLAReportType.END_TERM}</p>
        //             )}
        //             {text === EnumLAReportType.OTHER && (
        //                 <p>{textLAReportType.OTHER}</p>
        //             )}
        //         </>
        //     )
        // },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (text: any, record: any) => (
                <>
                    <p>
                        <b>CSKH: </b>
                        {`${text?.cskh}`}
                    </p>
                    <p>
                        <b>Học thuật: </b>
                        {`${text?.ht}`}
                    </p>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            render: (text: any) => (
                <>
                    {text === EnumLAReportStatus.PRIVATE && (
                        <b style={{ color: '#FF0D0D' }}>
                            {textLAReportStatus.PRIVATE}
                        </b>
                    )}
                    {text === EnumLAReportStatus.PUBLISHED && (
                        <b style={{ color: '#52C41A' }}>
                            {textLAReportStatus.PUBLISHED}
                        </b>
                    )}
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Dropdown overlay={menuActions(record)} trigger={['click']}>
                    <div className='ant-dropdown-link clickable'>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            )
        },
        {
            title: '',
            key: 'action_2',
            dataIndex: 'status',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <>
                    {checkPermission(PERMISSIONS.arla_update_status) &&
                        text === EnumLAReportStatus.PUBLISHED && (
                            <Button
                                type='default'
                                style={{
                                    background: '#7D9195',
                                    color: 'white'
                                }}
                                onClick={() =>
                                    changeStatus(
                                        record.id,
                                        EnumLAReportStatus.PRIVATE
                                    )
                                }
                            >
                                {textLAReportStatus.PRIVATE}
                            </Button>
                        )}
                    {checkPermission(PERMISSIONS.arla_update_status) &&
                        text === EnumLAReportStatus.PRIVATE && (
                            <Button
                                type='default'
                                style={{
                                    background: '#52C41A',
                                    color: 'white'
                                }}
                                onClick={() =>
                                    changeStatus(
                                        record.id,
                                        EnumLAReportStatus.PUBLISHED
                                    )
                                }
                            >
                                {textLAReportStatus.PUBLISHED}
                            </Button>
                        )}
                </>
            )
        }
    ]

    const columns2: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            fixed: true,
            width: 70,
            render: (text, record) => text
        },
        {
            title: 'Create Time',
            dataIndex: 'time_create',
            key: 'time_create',
            width: 150,
            align: 'center',
            render: (text: any, record: any) => (
                <>{text && moment(text).format('HH:mm DD/MM/YYYY')}</>
            )
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            width: 340,
            render: (text: IUser, record: any) => {
                return record && record?.user_student?.staff ? (
                    <>
                        <p>
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                        Supporter: {record?.user_student?.staff?.fullname} -{' '}
                        {record?.user_student?.staff?.username}
                    </>
                ) : (
                    <>
                        <p>
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                        Supporter: None
                    </>
                )
            }
        },
        // {
        //     title: 'Duration',
        //     dataIndex: 'start_time',
        //     key: 'created_time',
        //     width: 280,
        //     align: 'center',
        //     render: (text: any, record: any) => (
        //         <>
        //             {record &&
        //                 record?.start_time &&
        //                 moment(record?.start_time).format(
        //                     'HH:mm DD/MM/YYYY'
        //                 )}{' '}
        //             -{' '}
        //             {record &&
        //                 record?.end_time &&
        //                 moment(record?.end_time).format('HH:mm DD/MM/YYYY')}
        //         </>
        //     )
        // },
        // {
        //     title: 'Number class',
        //     dataIndex: 'booking_ids',
        //     key: 'booking_ids',
        //     width: 100,
        //     align: 'center',
        //     render: (text: any, record: any) => text && text.length
        // },
        // {
        //     title: 'Prompt',
        //     dataIndex: 'prompt_template',
        //     key: 'prompt_template',
        //     width: 80,
        //     align: 'center',
        //     render: (text: any, record: any) => (
        //         <>
        //             <Popover
        //                 content={
        //                     <>
        //                         <b>View Prompt</b>
        //                     </>
        //                 }
        //             >
        //                 <span
        //                     style={{ width: 20 }}
        //                     onClick={() => togglePromptModal(true, text)}
        //                 >
        //                     {text && (
        //                         <EyeOutlined
        //                             style={{
        //                                 fontSize: 20,
        //                                 color: '#1890FF',
        //                                 cursor: 'pointer'
        //                             }}
        //                         />
        //                     )}
        //                 </span>
        //             </Popover>
        //         </>
        //     )
        // },
        // {
        //     title: 'Type',
        //     dataIndex: 'type',
        //     key: 'type',
        //     width: 150,
        //     align: 'center',
        //     render: (text: any) => (
        //         <>
        //             {text === EnumLAReportType.DILIGENCE && (
        //                 <p>{textLAReportType.DILIGENCE}</p>
        //             )}
        //             {text === EnumLAReportType.PERIODIC && (
        //                 <p>{textLAReportType.PERIODIC}</p>
        //             )}
        //             {text === EnumLAReportType.END_TERM && (
        //                 <p>{textLAReportType.END_TERM}</p>
        //             )}
        //             {text === EnumLAReportType.OTHER && (
        //                 <p>{textLAReportType.OTHER}</p>
        //             )}
        //         </>
        //     )
        // },
        {
            title: 'Package',
            dataIndex: 'ordered_package',
            key: 'ordered_package',
            width: 200,
            render: (e, record: any) => {
                return record && e ? (
                    <Popover content={renderOrderedPackage(e)}>
                        <a>
                            <div
                                className='text-truncate'
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {e.type === EnumPackageType.STANDARD
                                    ? 'STA'
                                    : e.type === EnumPackageType.PREMIUM
                                    ? 'PRE'
                                    : 'TRIAL'}{' '}
                                - {e?.package_name}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (text: any, record: any) => (
                <>
                    <p>
                        <b>CSKH: </b>
                        {`${text?.cskh}`}
                    </p>
                    <p>
                        <b>Học thuật: </b>
                        {`${text?.ht}`}
                    </p>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            render: (text: any) => (
                <>
                    {text === EnumLAReportStatus.PRIVATE && (
                        <b style={{ color: '#FF0D0D' }}>
                            {textLAReportStatus.PRIVATE}
                        </b>
                    )}
                    {text === EnumLAReportStatus.PUBLISHED && (
                        <b style={{ color: '#52C41A' }}>
                            {textLAReportStatus.PUBLISHED}
                        </b>
                    )}
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Dropdown overlay={menuActions(record)} trigger={['click']}>
                    <div className='ant-dropdown-link clickable'>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            )
        },
        {
            title: '',
            key: 'action_2',
            dataIndex: 'status',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <>
                    {checkPermission(PERMISSIONS.arla_update_status) &&
                        text === EnumLAReportStatus.PUBLISHED && (
                            <Button
                                type='default'
                                style={{
                                    background: '#7D9195',
                                    color: 'white'
                                }}
                                onClick={() =>
                                    changeStatus(
                                        record.id,
                                        EnumLAReportStatus.PRIVATE
                                    )
                                }
                            >
                                {textLAReportStatus.PRIVATE}
                            </Button>
                        )}
                    {checkPermission(PERMISSIONS.arla_update_status) &&
                        text === EnumLAReportStatus.PRIVATE && (
                            <Button
                                type='default'
                                style={{
                                    background: '#52C41A',
                                    color: 'white'
                                }}
                                onClick={() =>
                                    changeStatus(
                                        record.id,
                                        EnumLAReportStatus.PUBLISHED
                                    )
                                }
                            >
                                {textLAReportStatus.PUBLISHED}
                            </Button>
                        )}
                </>
            )
        }
    ]

    const renderTable = (type: any) => (
        <Table
            dataSource={values.data_reports}
            columns={type === EnumTabType.DILIGENCE ? columns : columns2}
            pagination={{
                defaultCurrent: values.page_number,
                pageSize: values.page_size,
                total: values.total,
                onChange: handleChangePagination,
                current: values.page_number
            }}
            rowSelection={
                values.status === EnumLAReportStatus.PRIVATE
                    ? rowSelection
                    : null
            }
            rowKey={(record: any) => record.id}
            scroll={{
                x: 500,
                y: 768
            }}
            bordered
            loading={values.isLoading}
            sticky
        />
    )

    const renderTab = () => (
        <>
            <Tabs
                defaultActiveKey={`${values.tab_current}`}
                activeKey={`${values.tab_current}`}
                type='card'
                onChange={onChangeTab}
            >
                <TabPane tab='BC chuyên cần' key={EnumTabType.DILIGENCE}>
                    {renderTable(EnumTabType.DILIGENCE)}
                </TabPane>
                <TabPane tab='BC định kỳ' key={EnumTabType.PERIODIC}>
                    {checkPermission(PERMISSIONS.arla_create) && (
                        <div className='mb-3 d-flex justify-content-end'>
                            <Button
                                type='primary'
                                onClick={() =>
                                    toggleModal(
                                        true,
                                        { type: EnumLAReportType.PERIODIC },
                                        EnumLAModalType.NEW
                                    )
                                }
                            >
                                Add new
                            </Button>
                        </div>
                    )}
                    {renderTable(EnumTabType.PERIODIC)}
                </TabPane>
                <TabPane tab='BC cuối kỳ' key={EnumTabType.END_TERM}>
                    {checkPermission(PERMISSIONS.arla_create) && (
                        <div className='mb-3 d-flex justify-content-end'>
                            <Button
                                type='primary'
                                onClick={() =>
                                    toggleModal(
                                        true,
                                        { type: EnumLAReportType.END_TERM },
                                        EnumLAModalType.NEW
                                    )
                                }
                            >
                                Add new
                            </Button>
                        </div>
                    )}
                    {renderTable(EnumTabType.END_TERM)}
                </TabPane>
            </Tabs>
        </>
    )

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , username , email'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        },
        {
            label: 'Supporter',
            engine: (
                <Select
                    defaultValue=''
                    style={{ width: '100%' }}
                    loading={values.isLoading}
                    onChange={handlerSupporter}
                >
                    <Option value=''>All</Option>
                    <Option value={-1}>No one</Option>
                    {values.listAdmin.map((item, index) => (
                        <Option key={`staff_id${index}`} value={item.value}>
                            {_.capitalize(item.label)}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    defaultValue=''
                    style={{ width: '100%' }}
                    loading={values.isLoading}
                    onChange={handlerStatus}
                >
                    <Option value=''>All</Option>

                    <Option value={EnumLAReportStatus.PUBLISHED}>
                        PUBLISHED
                    </Option>
                    <Option value={EnumLAReportStatus.PRIVATE}>PRIVATE</Option>
                </Select>
            )
        },
        {
            label: 'Created time',
            engine: (
                <DatePicker
                    format='DD-MM-YYYY'
                    allowClear={false}
                    onChange={handlerDateFilter}
                    disabledDate={(current) => current > moment()}
                />
            )
        }
    ]

    return (
        <Card title='Báo Cáo Đánh Giá Học Tập'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>
            {selectedRowKeys.length > 0 && (
                <Row className='mb-2'>
                    <Col span={24} className='d-flex justify-content-start'>
                        <div className='mt-1 mr-4'>
                            Apply {selectedRowKeys.length} reports for publish
                        </div>
                        <Popconfirm
                            placement='top'
                            title='Are you sure want to public list report?'
                            onConfirm={publishReports}
                            okText='Ok'
                            cancelText='Cancel'
                        >
                            <Button
                                style={{
                                    background: '#08BF5A',
                                    color: 'white'
                                }}
                                className='mr-4'
                                disabled={loadingPublishAll}
                                loading={loadingPublishAll}
                            >
                                Publish Reports
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row>
            )}
            {renderTab()}
            <PromptViewModel
                visible={visiblePromptModal}
                dataPrompt={values.prompt_selected}
                close={() => {
                    togglePromptModal(false)
                }}
            />
            <FileReportViewModel
                visible={visibleViewFileModal}
                data={values.learning_assessment_info}
                close={() => {
                    toggleViewFileModal(false)
                }}
            />
            <LearningAssessmentModals
                visible={visibleModal}
                toggleModal={toggleModal}
                modalType={values.type_modal}
                data={values.learning_assessment_info}
                updateData={refetchData}
            />
            <ActionPeriodicLearningAssessmentReportsModal
                visible={visiblePeriodicModal}
                toggleModal={toggleModal}
                modalType={values.type_modal}
                data={values.learning_assessment_info}
                updateData={refetchData}
            />
            <UpdateNoteModal
                visible={visibleUpdateNoteModal}
                toggleModal={toggleUpdateNoteModal}
                data={values.learning_assessment_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default LearningAssessmentReports
