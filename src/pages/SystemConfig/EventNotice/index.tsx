import { useEffect, useCallback, useState } from 'react'
import { Table, Card, Space, Modal, Button, Row, Col, Tag } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { EnumEventNoticeType, EnumTargetType, IEventNotice } from 'types'
import EventNoticeAPI from 'api/EventNoticeAPI'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import FilterDataWrapper from 'components/filter-data-wrapper'
import EventNoticeModal from './modals/EventNoticeModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const EventNotice = () => {
    const [eventNotices, setEventNotices] = useState<IEventNotice[]>([])
    const [isLoading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IEventNotice>(null)

    const fetch = async (query: {
        page_size: number
        page_number: number
        type?: EnumEventNoticeType
        search?: string
    }) => {
        setLoading(true)
        try {
            const res = await EventNoticeAPI.getEventNotices(query)
            setEventNotices(res.data)
            setTotal(res.pagination.total)
        } catch (err) {
            notify('error', err.message)
        } finally {
            setLoading(false)
        }
    }

    const refetchData = useCallback(() => {
        fetch({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [pageNumber, pageSize])

    useEffect(() => {
        fetch({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [])

    const toggleModal = useCallback(
        (value: boolean, _modalType?: MODAL_TYPE) => {
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleModal]
    )

    const onEdit = useCallback(
        (item) => {
            setVisible(true)
            setSelectedItem(item)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        if (pagination) {
            setPageNumber(pagination.current)
            setPageSize(pagination.pageSize)
            fetch({
                page_size: pagination.pageSize,
                page_number: pagination.current
            })
        }
    }, [])

    const removeTemplate = useCallback(async (id: string) => {
        setLoading(true)
        try {
            await EventNoticeAPI.removeEventNotice(id)
            notify('success', 'Remove successfully')
            refetchData()
        } catch (err) {
            notify('error', err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const onRemove = useCallback((item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeTemplate(item._id)
            }
        })
    }, [])

    const columns: ColumnsType<IEventNotice> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            align: 'center',
            width: 200
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 120,
            render: (val, record) =>
                _.startCase(EnumEventNoticeType[val].toLowerCase())
            // filters: [
            //     {
            //         text: 'Holiday',
            //         value: EnumEventNoticeType.HOLIDAY_EVENT
            //     },
            //     {
            //         text: 'Update system',
            //         value: EnumEventNoticeType.UPDATE_SYSTEM_EVENT
            //     },
            //     {
            //         text: 'Other',
            //         value: EnumEventNoticeType.OTHER_EVENT
            //     }
            // ],
            // filterMultiple: false
        },
        {
            title: 'Target',
            dataIndex: 'target',
            key: 'target',
            align: 'center',
            width: 150,
            render: (val, record) => {
                if (val) {
                    return val.map((item, index) => (
                        <Tag color='processing' key={index}>
                            {_.startCase(EnumTargetType[item].toLowerCase())}
                        </Tag>
                    ))
                }
            }
            // filters: [
            //     {
            //         text: 'Teacher',
            //         value: EnumTargetType.TEACHER
            //     },
            //     {
            //         text: 'Student',
            //         value: EnumTargetType.STUDENT
            //     }
            // ],
            // filterMultiple: false
        },
        {
            title: 'Start time shown',
            dataIndex: 'start_time_shown',
            key: 'start_time_shown',
            align: 'center',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'End time shown',
            dataIndex: 'end_time_shown',
            key: 'end_time_shown',
            align: 'center',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            width: 150,
            render: (text) => {
                if (text) return <Tag color='#87d068'>Active</Tag>
                return <Tag color='#f50'>Inactive</Tag>
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.saen_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit template'
                        />
                    )}
                    {checkPermission(PERMISSIONS.saen_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove template'
                        />
                    )}
                </Space>
            )
        }
    ]

    return (
        <Card title='Event notice Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.saen_create) ? (
                        <Button
                            type='primary'
                            onClick={() =>
                                toggleModal(true, MODAL_TYPE.ADD_NEW)
                            }
                        >
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={eventNotices}
                columns={columns}
                loading={isLoading}
                pagination={{
                    pageSize,
                    current: pageNumber,
                    total
                }}
                onChange={handleTableChange}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <EventNoticeModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default EventNotice
