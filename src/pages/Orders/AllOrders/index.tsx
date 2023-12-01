import { useEffect, useState, useCallback, useReducer } from 'react'
import { Table, Space, Card, Row, Col, Button, Tag, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { blue } from '@ant-design/colors'
import OrderAPI from 'api/OrderAPI'
import { notify } from 'utils/notify'
import { IOrder } from 'types'
import { MODAL_TYPE, ORDER_STATUS } from 'const'
import moment from 'moment'
import _ from 'lodash'
import { toReadablePrice } from 'utils'
import Search from 'antd/lib/input/Search'
import useQuery from 'hooks/useQuery'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import EditOrderModal from './edit-order-modal'
import NewTrialOrderModal from './new-trial-order-modal'
import NameTeacherStudent from 'components/name-teacher-student'
import SearchUser from 'components/search-user-with-lazy-load'
import StudentAPI from 'api/StudentAPI'

const { Option } = Select

const AllOrders = ({ ...props }) => {
    const q = useQuery()

    const [orders, setOrders] = useState<IOrder[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [visibleAddTrialModal, setVisibleAddTrialModal] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IOrder>(null)
    const [status, setStatus] = useState<ORDER_STATUS>(null)
    const [searchStudent, setSearchStudent] = useState(null)
    const [orderId, setOrderId] = useState(null)

    const [filterStudent, setFilterStudent] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            status: 'active',
            search: ''
        }
    )

    const getOrders = (query: {
        page_size: number
        page_number: number
        search?: string
        status?: ORDER_STATUS
        student_id?: number
        order_id?: number
    }) => {
        setLoading(true)
        OrderAPI.getOrders(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setOrders(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        getOrders({
            page_number: pageNumber,
            page_size: pageSize,
            status,
            search,
            student_id: searchStudent,
            order_id: orderId
        })
    }

    useEffect(() => {
        if (q) {
            const id = q.get('id')
            setSearch(id)
            getOrders({
                page_number: pageNumber,
                page_size: pageSize,
                status,
                search: id,
                student_id: searchStudent,
                order_id: orderId
            })
        } else {
            refetchData()
        }
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getOrders({
                page_number: pageNumber,
                page_size: _pageSize,
                status,
                search,
                student_id: searchStudent,
                order_id: orderId
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getOrders({
                page_number: _pageNumber,
                page_size: pageSize,
                status,
                search,
                student_id: searchStudent,
                order_id: orderId
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

    const toggleAddTrialModal = useCallback(
        (value: boolean) => {
            setVisibleAddTrialModal(value)
        },
        [visibleAddTrialModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const onChangeStatus = (val) => {
        setStatus(val)
        setPageNumber(1)
        setOrderId(null)
        getOrders({
            page_number: 1,
            page_size: pageSize,
            status: val,
            search,
            student_id: searchStudent,
            order_id: null
        })
    }

    const onSearch = useCallback(
        (value) => {
            if (value !== search) {
                setPageNumber(1)
                setSearch(value)
                getOrders({
                    search: value,
                    page_number: 1,
                    page_size: pageSize
                })
            }
        },
        [pageNumber, pageSize, search]
    )

    const searchDataUserStudent = (data) => {
        if (data.selected) {
            const searchText = data.selected.id
            setSearchStudent(searchText)
            setPageNumber(1)
            setOrderId(null)
            getOrders({
                page_number: 1,
                page_size: pageSize,
                status,
                student_id: searchText,
                order_id: null
            })
        }
        if (data.clear) {
            setSearchStudent(null)
            setPageNumber(1)
            setOrderId(null)
            getOrders({
                page_number: 1,
                page_size: pageSize,
                status,
                student_id: null,
                order_id: null
            })
        }
    }

    const onChangeSearch = (val) => {
        setSearchStudent(null)
        setPageNumber(1)
        setStatus(null)
        setOrderId(val)
        getOrders({
            page_number: 1,
            page_size: pageSize,
            status: null,
            student_id: null,
            order_id: val
        })
    }

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: 'Student',
            dataIndex: 'user_info',
            key: 'user_info',
            render: (text, record) => {
                return (
                    <NameTeacherStudent
                        data={text}
                        type='student'
                    ></NameTeacherStudent>
                )
            }
        },
        {
            title: 'Active date',
            dataIndex: 'orderedPackage',
            key: 'orderedPackage',
            render: (text, record) =>
                text && text.activation_date ? (
                    moment(text?.activation_date).format('DD/MM/YYYY')
                ) : (
                    <></>
                )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if (text === ORDER_STATUS.PAID)
                    return <Tag color='success'>PAID</Tag>
                if (text === ORDER_STATUS.PENDING)
                    return <Tag color='warning'>PENDING</Tag>
                if (text === ORDER_STATUS.CANCEL)
                    return <Tag color='error'>CANCEL</Tag>
            }
        },
        {
            title: 'Total bill',
            dataIndex: 'total_bill',
            key: 'total_bill',
            render: (text, record) => toReadablePrice(text)
        },
        {
            title: 'Created date',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (text, record) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Note',
            dataIndex: 'admin_note',
            key: 'admin_note'
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) =>
                checkPermission(PERMISSIONS.omao_update) && (
                    <Space size='middle'>
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                        />
                    </Space>
                )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={status}
                    onChange={onChangeStatus}
                >
                    <Option value={null} key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(ORDER_STATUS)
                        .filter((key: any) => !isNaN(Number(ORDER_STATUS[key])))
                        .map((key: any) => (
                            <Option
                                value={ORDER_STATUS[key]}
                                key={ORDER_STATUS[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Student',
            engine: (
                <SearchUser
                    api={StudentAPI.getAllStudents}
                    placeholder='Search by student'
                    searchDataUser={searchDataUserStudent}
                    filter={filterStudent}
                ></SearchUser>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By order id'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onChangeSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Order Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.omao_create_trial) ? (
                        <Button
                            type='primary'
                            onClick={() => toggleAddTrialModal(true)}
                        >
                            Add Trial Order
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={_.orderBy(orders, ['id'], ['desc'])}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?.id}
                scroll={{
                    x: 500
                }}
            />
            <EditOrderModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
            <NewTrialOrderModal
                visible={visibleAddTrialModal}
                toggleModal={toggleAddTrialModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default AllOrders
