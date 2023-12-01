import { useEffect, useCallback, useState } from 'react'
import { Table, Space, Card, Row, Col, Button, Input, Modal } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import TagAPI from 'api/TagAPI'
import { notify } from 'utils/notify'
import { ITag } from 'types'
import { MODAL_TYPE } from 'const/status'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'
import FilterDataWrapper from 'components/filter-data-wrapper'
import TagModal from './tag-modal'

const { Search } = Input

const TagComponent = () => {
    const [tags, setTags] = useState<ITag[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ITag>(null)

    const getTags = (query: {
        page_size: number
        page_number: number
        name?: string
    }) => {
        setLoading(true)
        TagAPI.getTags(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setTags(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getTags({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const refetchData = useCallback(() => {
        getTags({ page_number: pageNumber, page_size: pageSize, name: search })
    }, [pageNumber, pageSize, search])

    const onSearch = useCallback(
        (value) => {
            if (value !== search) {
                setPageNumber(1)
                setSearch(value)
                getTags({
                    name: value,
                    page_number: 1,
                    page_size: pageSize
                })
            }
        },
        [search, pageSize, pageNumber]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getTags({
                page_number: pageNumber,
                page_size: _pageSize,
                name: search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getTags({
                page_number: _pageNumber,
                page_size: pageSize,
                name: search
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

    const removeTag = useCallback((_id: string) => {
        setLoading(true)
        TagAPI.removeTag(_id)
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
                removeTag(item._id)
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
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.cmst_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit tag'
                        />
                    )}
                    {checkPermission(PERMISSIONS.cmst_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove tag'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='Enter text to search'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Tag Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.cmst_create) ? (
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
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={tags}
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
            <TagModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default TagComponent
