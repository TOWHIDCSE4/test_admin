/* eslint-disable new-cap */
import React, { useEffect, useState, useCallback } from 'react'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Tag,
    Popover,
    Select,
    DatePicker,
    Button
} from 'antd'
import { SkypeOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import ExtensionAPI from 'api/ExtensionAPI'
import { EnumStudentExtensionRequestStatus } from 'types/IExtensionRequest'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import { encodeFilenameFromLink, POINT_VND_RATE } from 'const'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ApprovalModal from './approval-modal'
import AddExtensionModal from './add-extension-modal'
import NameTeacherStudent from 'components/name-teacher-student'
import UploadAPI from 'api/UploadAPI'

const { Option } = Select

const ExtensionRequest = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [requests, setRequests] = useState([])
    const [total, setTotal] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(6)
    const [pageNum, setPageNum] = useState<number>(1)
    const [minStartTime, setMinStartTime] = useState(moment().startOf('month'))
    const [maxEndTime, setMaxEndTime] = useState(moment().endOf('month'))
    const [statusSearch, setStatusSearch] = useState(null)
    const [studentSearch, setStudentSearch] = useState(null)
    const [visibleModal, setVisibleModal] = useState<boolean>(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [visibleAddModal, setVisibleAddModal] = useState<boolean>(false)

    const toggleAddModal = useCallback(() => {
        setVisibleAddModal(!visibleAddModal)
    }, [visibleAddModal])

    const fetchUser = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'STUDENT',
            q
        })
        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const getRequests = useCallback(async (query: any) => {
        setLoading(true)
        ExtensionAPI.getExtensions({
            page_size: query.pageSize,
            page_number: query.pageNum,
            status: query.statusSearch,
            student_id: query.studentSearch,
            min_days: query.minStartTime,
            max_days: query.maxEndTime
        })
            .then((res) => {
                setRequests(res.data)
                setTotal(res.pagination.total)
                setLoading(false)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
                setLoading(false)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        getRequests({
            pageSize,
            pageNum,
            minStartTime,
            maxEndTime
        })
    }, [])

    const reFetchData = useCallback(() => {
        getRequests({
            pageSize,
            pageNum,
            minStartTime,
            maxEndTime,
            statusSearch,
            studentSearch
        })
    }, [])

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        if (res.code === 10001) {
            notification.error({
                message: 'Error',
                description: res.message
            })
        }
        return res
    }

    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }

    const toggleViewAudio = (src) => {
        window.open(
            hasHttpUrl(src)
                ? encodeFilenameFromLink(src)
                : `https://ispeak.vn/${encodeFilenameFromLink(src)}`,
            '_blank'
        )
    }

    const createRequest = async (payload) => {
        setLoading(true)
        if (
            payload?.proof_files?.fileList &&
            payload?.proof_files?.fileList?.length > 0
        ) {
            const arrFile = []
            await Promise.all(
                payload?.proof_files?.fileList.map(async (item, index) => {
                    const newFile = await uploadFile(item.originFileObj)
                    if (newFile) {
                        arrFile.push(newFile)
                    }
                })
            )
            payload.proof_files = arrFile
        }
        ExtensionAPI.newExtension({
            ordered_package_id: payload.order,
            student_note: payload.student_note,
            student_id: payload.student_id,
            days: payload.days,
            price: payload.price,
            proof_files: payload.proof_files
        })
            .then(() => {
                notification.success({
                    message: 'Success',
                    description: 'Create new request success'
                })
                setVisibleAddModal(false)
                reFetchData()
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const updateRequest = async (payload) => {
        ExtensionAPI.updateExtension({
            id: payload.id,
            status: payload.status,
            admin_note: payload.admin_note,
            price: payload.price,
            number_of_days: payload.number_of_days
        })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Request updated'
                })
                reFetchData()
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const toggleApproveModal = useCallback(
        (record) => {
            setVisibleModal(!visibleModal)
            setSelectedRequest(record)
        },
        [visibleModal]
    )

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNum(page_number)
            getRequests({
                pageSize: page_size,
                pageNum: page_number,
                minStartTime,
                maxEndTime,
                statusSearch,
                studentSearch
            })
        },
        [minStartTime, maxEndTime, statusSearch, studentSearch]
    )

    const handlerUserFilter = useCallback(
        (v) => {
            setStudentSearch(v)
            getRequests({
                pageNum,
                pageSize,
                minStartTime,
                maxEndTime,
                statusSearch,
                studentSearch: v
            })
        },
        [pageNum, pageSize, minStartTime, maxEndTime, statusSearch]
    )

    const handleChangeStatusFilter = useCallback(
        (status) => {
            setStatusSearch(status)
            getRequests({
                pageNum,
                pageSize,
                minStartTime,
                maxEndTime,
                statusSearch: status,
                studentSearch
            })
        },
        [pageNum, pageSize, minStartTime, maxEndTime, studentSearch]
    )

    const colorStatus = (_status: number) => {
        switch (_status) {
            case EnumStudentExtensionRequestStatus.APPROVED:
                return 'success'
            case EnumStudentExtensionRequestStatus.PENDING:
                return 'warning'
            case EnumStudentExtensionRequestStatus.REJECTED:
                return 'error'
            default:
                break
        }
    }

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            align: 'center',
            width: 150,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>StudentID: </b> {text && text.id}
                            <br />
                            <b>Student: </b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <SkypeOutlined className='mr-2' />
                            <span className='ml-1'>{text?.skype_account}</span>
                            <br />
                        </>
                    }
                >
                    <div>
                        <p className='mb-2'>
                            <b>Student:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='student'
                            ></NameTeacherStudent>
                        </p>
                    </div>
                </Popover>
            )
        },
        {
            title: 'Created Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 150,
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Package',
            dataIndex: 'ordered_package',
            key: 'ordered_package',
            align: 'center',
            width: 150,

            render: (text) => (
                <Popover
                    content={
                        <>
                            <b>Ordered Package ID: </b> {text && text.id}
                            <br />
                            <b>Order ID: </b> {text && text.order_id}
                        </>
                    }
                >
                    <div className='clickable'>{text.package_name}</div>
                </Popover>
            )
        },
        {
            title: 'Extension Days',
            dataIndex: 'number_of_days',
            key: 'number_of_days',
            align: 'center',
            width: 150,

            render: (text, record: any) => text
        },
        {
            title: 'Student Note',
            dataIndex: 'student_note',
            key: 'student_note',
            align: 'center',
            width: 150,

            render: (text) => text
        },
        {
            title: 'Fee',
            dataIndex: 'price',
            key: 'price',
            width: 150,

            align: 'center',
            render: (text, record: any) => (
                <>
                    <Tag color='success'>
                        {Intl.NumberFormat('en-US').format(
                            text / POINT_VND_RATE
                        )}{' '}
                        Points
                    </Tag>
                </>
            )
        },
        {
            title: 'Result',
            dataIndex: 'status',
            key: 'status',
            width: 150,

            align: 'center',
            render: (text, record) => (
                <Tag color={colorStatus(text)}>
                    {_.startCase(EnumStudentExtensionRequestStatus[text])}
                </Tag>
            )
        },
        {
            title: 'Admin Note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            width: 150,

            render: (text) => text
        },
        {
            title: 'File',
            dataIndex: 'proof_files',
            key: 'file',
            width: 150,

            align: 'center',
            render: (text, record: any) => {
                if (text) {
                    if (Array.isArray(text) && text.length > 0) {
                        return text.map((item, index) => (
                            <div
                                className='mb-1 display-flex'
                                onClick={() => toggleViewAudio(item)}
                                title={
                                    encodeFilenameFromLink(item) || 'View audio'
                                }
                            >
                                <Tag className='clickable' color='processing'>
                                    View File {index + 1}
                                </Tag>
                            </div>
                        ))
                    }
                    return <></>
                }
            }
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (text, record: any) =>
                record.status === EnumStudentExtensionRequestStatus.PENDING &&
                (checkPermission(PERMISSIONS.tmer_approve) ||
                    checkPermission(PERMISSIONS.tmer_reject)) && (
                    <>
                        <Button
                            type='primary'
                            size='small'
                            onClick={() => toggleApproveModal(record)}
                            className='w-100 m-1'
                        >
                            Update
                        </Button>
                    </>
                )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search User',
            engine: (
                <DebounceSelect
                    defaultValue={studentSearch}
                    placeholder='By name , username'
                    fetchOptions={fetchUser}
                    allowClear
                    onClear={() => reFetchData()}
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
                    value={statusSearch}
                    onChange={(v) => handleChangeStatusFilter(v)}
                >
                    <Option value={EnumStudentExtensionRequestStatus.PENDING}>
                        PENDING
                    </Option>
                    <Option value={EnumStudentExtensionRequestStatus.APPROVED}>
                        APPROVED
                    </Option>
                    <Option value={EnumStudentExtensionRequestStatus.REJECTED}>
                        REJECTED
                    </Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='Extension Requests'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.tmer_create) ? (
                        <Button
                            style={{ width: '100%' }}
                            type='primary'
                            onClick={toggleAddModal}
                        >
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                dataSource={requests}
                columns={columns}
                loading={isLoading}
                size='small'
                sticky
                rowKey='id'
                scroll={{
                    x: 500,
                    y: 768
                }}
                pagination={{
                    defaultCurrent: pageNum,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
            />

            <ApprovalModal
                visible={visibleModal}
                toggleModal={toggleApproveModal}
                reload={reFetchData}
                request={selectedRequest}
                colorStatus={colorStatus}
                updateFunc={updateRequest}
            />

            <AddExtensionModal
                visible={visibleAddModal}
                toggleModal={toggleAddModal}
                reload={reFetchData}
                createFunc={createRequest}
            />
        </Card>
    )
}

export default ExtensionRequest
