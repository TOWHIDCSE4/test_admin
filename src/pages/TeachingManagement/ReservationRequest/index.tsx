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
import ReservationAPI from 'api/ReservationAPI'
import { EnumStudentReservationRequestStatus } from 'types/IReservation'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ApprovalModal from './approval-modal'
import AddReservationModal from './add-reservation-modal'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select

const ReservationRequest = () => {
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
        ReservationAPI.getReservations({
            page_size: query.pageSize,
            page_number: query.pageNum,
            start_time: query.minStartTime.valueOf(),
            end_time: query.maxEndTime.valueOf(),
            status: query.statusSearch,
            student_id: query.studentSearch
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

    const createRequest = async (payload) => {
        ReservationAPI.newReservation({
            start_time: payload.start_time.valueOf(),
            end_time: payload.end_time.valueOf(),
            ordered_package_id: payload.order,
            student_note: payload.student_note,
            student_id: payload.student_id
        })
            .then(() => {
                notification.success({
                    message: 'Success',
                    description: 'Create new request success'
                })
                toggleAddModal()
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
        ReservationAPI.updateReservation({
            id: payload.id,
            status: payload.status,
            admin_note: payload.admin_note,
            price: payload.price
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

    const deleteRequest = async (id) => {
        ReservationAPI.deleteReservation(id)
            .then(() => {
                notification.success({
                    message: 'Success',
                    description: 'Request deleted'
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

    const changeStatusToPaid = async (item) => {
        if (item.status === EnumStudentReservationRequestStatus.APPROVED) {
            updateRequest({
                id: item.id,
                status: EnumStudentReservationRequestStatus.PAID
            })
        } else {
            notification.error({
                message: 'Error',
                description: 'Request is not approved'
            })
        }
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
            case EnumStudentReservationRequestStatus.APPROVED:
                return 'success'
            case EnumStudentReservationRequestStatus.PENDING:
                return 'warning'
            case EnumStudentReservationRequestStatus.CANCEL:
                return 'error'
            case EnumStudentReservationRequestStatus.PAID:
                return 'processing'
            case EnumStudentReservationRequestStatus.REJECT_BY_ADMIN:
                return 'grey'
            default:
                break
        }
    }

    const columns: ColumnsType = [
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
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Package',
            dataIndex: 'ordered_package',
            key: 'ordered_package',
            align: 'center',
            render: (text) => text.package_name
        },
        {
            title: 'From Date',
            dataIndex: 'start_time',
            key: 'start_time',
            align: 'center',
            render: (text) => moment(text).format('DD/MM/YYYY')
        },
        {
            title: 'To Date',
            dataIndex: 'end_time',
            key: 'end_time',
            align: 'center',
            render: (text) => moment(text).format('DD/MM/YYYY')
        },
        {
            title: 'Reservation Days',
            dataIndex: 'start_time',
            key: 'start_date',
            align: 'center',
            render: (text, record: any) => {
                const startDate = moment(record.start_time)
                const endDate = moment(record.end_time)
                const duration = moment.duration(endDate.diff(startDate))
                return duration.asDays()
            }
        },
        {
            title: 'Student Note',
            dataIndex: 'student_note',
            key: 'student_note',
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Fee',
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            width: 150,
            render: (text, record: any) => (
                <>
                    {record.status !==
                    EnumStudentReservationRequestStatus.PAID ? (
                        <a
                            onClick={() =>
                                checkPermission(PERMISSIONS.tmrr_mark_paid) &&
                                changeStatusToPaid(record)
                            }
                        >
                            <div title='Click to change status to PAID'>
                                <Tag color='error' className='mb-2'>
                                    {text} Unpaid
                                </Tag>
                            </div>
                        </a>
                    ) : (
                        <>
                            <Tag color='success'>{text}</Tag>
                        </>
                    )}
                </>
            )
        },
        {
            title: 'Result',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => (
                <Tag color={colorStatus(text)}>
                    {_.startCase(EnumStudentReservationRequestStatus[text])}
                </Tag>
            )
        },
        {
            title: 'Admin Note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Approve',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (text, record: any) =>
                (record.status ===
                    EnumStudentReservationRequestStatus.PENDING ||
                    record.status ===
                        EnumStudentReservationRequestStatus.CANCEL) &&
                (checkPermission(PERMISSIONS.tmrr_approve) ||
                    checkPermission(PERMISSIONS.tmrr_reject)) && (
                    <>
                        <Button
                            type='primary'
                            size='small'
                            onClick={() => toggleApproveModal(record)}
                        >
                            Approval
                        </Button>
                    </>
                )
        },
        {
            title: 'Delete',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            render: (text, record: any) =>
                (record.status ===
                    EnumStudentReservationRequestStatus.PENDING ||
                    record.status ===
                        EnumStudentReservationRequestStatus.CANCEL) &&
                checkPermission(PERMISSIONS.tmrr_delete) && (
                    <>
                        <Button
                            type='primary'
                            size='small'
                            style={{
                                backgroundColor: 'red',
                                borderColor: 'red'
                            }}
                            onClick={() => deleteRequest(record?.id)}
                        >
                            Delete
                        </Button>
                    </>
                )
        }
    ]

    const handleSavePdf = () => {
        const input = document.getElementById('savePdf')
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'landscape'
            })
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save('download.pdf')
        })
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <DebounceSelect
                    defaultValue={studentSearch}
                    placeholder='Search by user'
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
                    <Option value={EnumStudentReservationRequestStatus.PENDING}>
                        PENDING
                    </Option>
                    <Option
                        value={EnumStudentReservationRequestStatus.APPROVED}
                    >
                        APPROVED
                    </Option>
                    <Option
                        value={
                            EnumStudentReservationRequestStatus.REJECT_BY_ADMIN
                        }
                    >
                        REJECT_BY_ADMIN
                    </Option>
                    <Option value={EnumStudentReservationRequestStatus.PAID}>
                        PAID
                    </Option>
                    <Option value={EnumStudentReservationRequestStatus.CANCEL}>
                        CANCEL
                    </Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='Reservation Requests' id='savePdf'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.tmrr_create) ? (
                        <Button type='primary' onClick={toggleAddModal}>
                            Add New
                        </Button>
                    ) : (
                        <></>
                    ),
                    checkPermission(PERMISSIONS.tmrr_save_pdf) ? (
                        <Button type='primary' onClick={handleSavePdf}>
                            Save PDF
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                style={{ width: '100%' }}
                dataSource={requests}
                columns={columns}
                loading={isLoading}
                rowKey='id'
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

            <AddReservationModal
                visible={visibleAddModal}
                toggleModal={toggleAddModal}
                reload={reFetchData}
                colorStatus={colorStatus}
                createFunc={createRequest}
            />
        </Card>
    )
}

export default ReservationRequest
