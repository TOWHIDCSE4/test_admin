import { useCallback, useEffect, useState } from 'react'
import {
    Button,
    Card,
    Col,
    Image,
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
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import PostAPI from 'api/PostAPI'
import CategoryAPI from 'api/CategoryAPI'
import { notify } from 'utils/notify'
import { IPost } from 'types'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import moment from 'moment'
import { PostStatus } from 'const/enum'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import PostModal from './post-modal'

const { Option } = Select

const { Search } = Input

const Post = () => {
    const [posts, setPosts] = useState<IPost[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IPost>(null)
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

    const getPosts = (query: {
        search?: string
        page_number: number
        category_id?: any[]
        sort?: any
        page_size: number
    }) => {
        setLoading(true)
        PostAPI.getPosts(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setPosts(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getPosts({ page_number: pageNumber, page_size: pageSize })
        getCategories()
    }, [])

    useEffect(() => {
        setPageNumber(1)
        getPosts({
            page_number: 1,
            page_size: pageSize,
            search,
            category_id: selectCategory
        })
    }, [selectCategory])

    const refetchData = useCallback(() => {
        getPosts({
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
                getPosts({
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
            getPosts({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getPosts({
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

    const removePost = useCallback((_id: string) => {
        setLoading(true)
        PostAPI.removePost(_id)
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
                removePost(item._id)
            }
        })
    }, [])

    const columns: any = [
        {
            title: 'Preview',
            dataIndex: 'image',
            key: 'image',
            render: (text, record) => (
                <Image width={50} src={text} onError={() => true} />
            )
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.title.localeCompare(b.title)
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Tag',
            dataIndex: 'tags',
            key: 'tags',
            render: (tag, record) =>
                tag && tag.name ? <Tag>{tag.name}</Tag> : ''
        },
        {
            title: 'Categories',
            dataIndex: 'categories',
            key: 'categories',
            render: (items, record) =>
                items.map((e, index) => <Tag key={index}>{e.name}</Tag>)
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) =>
                text === PostStatus.DRAFT ? 'DRAFT' : 'PUBLIC'
        },
        {
            title: 'Create At',
            dataIndex: 'created_time',
            key: 'created_time',
            defaultSortOrder: 'ascend',
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
                    {checkPermission(PERMISSIONS.cmsp2_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit'
                        />
                    )}
                    {checkPermission(PERMISSIONS.cmsp2_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove'
                        />
                    )}
                </Space>
            )
        }
    ]

    const renderCategories = () =>
        categories.map((item, index) => (
            <Option key={index} value={item.id}>
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
        <Card title='Post Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.cmsp2_create) ? (
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
                dataSource={posts}
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
            <PostModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Post
