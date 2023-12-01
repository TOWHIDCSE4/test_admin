import { useEffect, useCallback, useState } from 'react'
import { Table, Space, Card, Row, Col, Button, Input, Modal, Image } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import CategoryAPI from 'api/CategoryAPI'
import { notify } from 'utils/notify'
import { ICategory } from 'types'
import { MODAL_TYPE } from 'const/status'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'
import FilterDataWrapper from 'components/filter-data-wrapper'
import CategoryModal from './modals/CategoryModal'

const { Search } = Input

const Category = () => {
    const [categories, setCategories] = useState<ICategory[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ICategory>(null)

    const getCategories = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoading(true)
        CategoryAPI.getCategories(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setCategories(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getCategories({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const refetchData = useCallback(() => {
        getCategories({
            page_number: pageNumber,
            page_size: pageSize,
            search
        })
    }, [pageNumber, pageSize, search])

    const onSearch = useCallback(
        (value) => {
            if (value !== search) {
                setPageNumber(1)
                setSearch(value)
                getCategories({
                    search: value,
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
            getCategories({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getCategories({
                page_number: _pageNumber,
                page_size: pageSize,
                search
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

    const removeCategory = useCallback((_id: string) => {
        setLoading(true)
        CategoryAPI.removeCategory(_id)
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
                removeCategory(item._id)
            }
        })
    }, [])

    const columns = [
        {
            title: 'Preview',
            dataIndex: 'image',
            key: 'image',
            render: (text, record) => (
                <Image width={50} src={text} onError={() => true} />
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.cmsc_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit category'
                        />
                    )}
                    {checkPermission(PERMISSIONS.cmsc_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove category'
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
        <Card title='Category Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.cmsc_create) ? (
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
                dataSource={categories}
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
            <CategoryModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Category
