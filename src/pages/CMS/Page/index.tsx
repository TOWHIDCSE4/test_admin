import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
    Button,
    Card,
    Col,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import PageAPI from 'api/PageAPI'
import CategoryAPI from 'api/CategoryAPI'
import { notify } from 'utils/notify'
import { IPage } from 'types'
import { MODAL_TYPE, PAGE_STATUS } from 'const/status'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'
import moment from 'moment'
import FilterDataWrapper from 'components/filter-data-wrapper'
import PageModal from './modals/PageModal'

const { Option } = Select

const { Search } = Input

const Page = () => {
    const history = useHistory()
    const [pages, setPages] = useState<IPage[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IPage>(null)
    const [categories, setCategories] = useState([])
    const [selectCategory, setSelectCategory] = useState([])

    const getCategories = () => {
        CategoryAPI.getCategories()
            .then((res) => {
                setCategories(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getPages = (query: {
        search?: string
        page_number: number
        category_id?: any[]
        page_size: number
    }) => {
        setLoading(true)
        PageAPI.getPages(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setPages(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getCategories()
    }, [])

    useEffect(() => {
        setPageNumber(1)
        getPages({
            page_number: 1,
            page_size: pageSize,
            search,
            category_id: selectCategory
        })
    }, [selectCategory])

    const refetchData = useCallback(() => {
        getPages({
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
                getPages({
                    search: value,
                    page_number: 1,
                    page_size: pageSize,
                    category_id: selectCategory
                })
            }
        },
        [search, pageSize, pageNumber]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getPages({
                page_number: pageNumber,
                page_size: _pageSize,
                search,
                category_id: selectCategory
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getPages({
                page_number: _pageNumber,
                page_size: pageSize,
                search,
                category_id: selectCategory
            })
        }
    }

    const toggleModal = useCallback(
        (value: boolean, _modalType?: MODAL_TYPE) => {
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

    const removePage = useCallback((_id: string) => {
        setLoading(true)
        PageAPI.removePage(_id)
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
                removePage(item._id)
            }
        })
    }, [])

    const columns: any = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
        },
        {
            title: 'Categories',
            dataIndex: 'categories',
            key: 'categories',
            render: (items, record) =>
                items.map((e, index) => <Tag key={index}>{e.name}</Tag>)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) =>
                text === PAGE_STATUS.DRAFT ? (
                    <Tag color='warning'>DRAFT</Tag>
                ) : (
                    <Tag color='success'>PUBLISH</Tag>
                )
        },
        {
            title: 'Create At',
            dataIndex: 'created_time',
            key: 'created_time',
            defaultSortOrder: 'desc',
            sorter: (a, b) =>
                moment(a.created_time).unix() - moment(b.created_time).unix(),
            render: (text, record) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.cmsp_update) && (
                        <EyeOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() =>
                                history.push(`/cms/page/${record.id}`)
                            }
                            title='Editor page'
                        />
                    )}
                    {checkPermission(PERMISSIONS.cmsp_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit page'
                        />
                    )}
                    {checkPermission(PERMISSIONS.cmsp_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove page'
                        />
                    )}
                </Space>
            )
        }
    ]

    const renderCategories = () =>
        categories.map((item, index) => (
            <Option key={index} value={item._id}>
                {item.name}
            </Option>
        ))

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
        },
        {
            label: 'Category',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by Category'
                    optionFilterProp='children'
                    mode='tags'
                    value={selectCategory}
                    onChange={(val) => setSelectCategory(val)}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {renderCategories()}
                </Select>
            )
        }
    ]

    return (
        <Card title='Page Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.cmsp_create) ? (
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
                dataSource={pages}
                columns={columns}
                loading={loading}
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
            <PageModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Page
