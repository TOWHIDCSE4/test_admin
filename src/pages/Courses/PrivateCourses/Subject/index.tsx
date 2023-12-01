import { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Card, Button, Space, Tag, Modal } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import SubjectAPI from 'api/SubjectAPI'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import { ISubject } from 'types'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import SubjectModal from './modals/SubjectModal'

const Subject = () => {
    const [subjects, setSubjects] = useState<ISubject[]>([])
    const [isLoading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ISubject>(null)

    const getSubjects = (query: { page_size: number; page_number: number }) => {
        setLoading(true)
        SubjectAPI.getSubjects(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setSubjects(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getSubjects({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const refetchData = () => {
        getSubjects({ page_number: pageNumber, page_size: pageSize })
    }

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getSubjects({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getSubjects({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const removeSubject = useCallback((id: number) => {
        setLoading(true)
        SubjectAPI.removeSubject(id)
            .then((res) => {
                notify('success', 'Remove successfully')
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }, [])

    const onRemove = useCallback((item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeSubject(item.id)
            }
        })
    }, [])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (text, record, index) => {
                if (text) return <Tag color='success'>Active</Tag>
                return <Tag color='error'>Inactive</Tag>
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.pms_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit subject'
                        />
                    )}
                    {checkPermission(PERMISSIONS.pms_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove subject'
                        />
                    )}
                </Space>
            )
        }
    ]

    return (
        <Card title='Subject Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.pms_create) ? (
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
                dataSource={subjects}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <SubjectModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Subject
