import { useEffect, useState, useCallback, useReducer } from 'react'
import {
    Table,
    Space,
    Card,
    Row,
    Col,
    Button,
    Tag,
    Input,
    Select,
    Popconfirm
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { blue } from '@ant-design/colors'
import OrderAPI from 'api/OrderAPI'
import { notify } from 'utils/notify'
import { IOrder } from 'types'
import { MODAL_TYPE, ORDER_STATUS, PREORDER_STATUS } from 'const'
import moment from 'moment'
import _ from 'lodash'
import { toReadablePrice } from 'utils'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NewOrderModal from './new-order-modal'
import NameTeacherStudent from 'components/name-teacher-student'
import SearchUser from 'components/search-user-with-lazy-load'
import StudentAPI from 'api/StudentAPI'

const { Search } = Input
const { Option } = Select

const AllOrders = () => {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleAddModal, setVisibleAddModal] = useState(false)
    const [status, setStatus] = useState<ORDER_STATUS>(null)
    const [searchStudent, setSearchStudent] = useState(null)

    const [filterStudent, setFilterStudent] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            status: 'active',
            search: ''
        }
    )

    const getPreOrders = (query: {
        page_size: number
        page_number: number
        search?: string
        status?: ORDER_STATUS
        student_id?: number
    }) => {
        setLoading(true)
        OrderAPI.getPreOrders(query)
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

    useEffect(() => {
        getPreOrders({
            page_number: pageNumber,
            page_size: pageSize,
            status,
            student_id: searchStudent
        })
    }, [])

    const refetchData = () => {
        getPreOrders({
            page_number: pageNumber,
            page_size: pageSize,
            status,
            student_id: searchStudent
        })
    }

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getPreOrders({
                page_number: pageNumber,
                page_size: _pageSize,
                status,
                student_id: searchStudent
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getPreOrders({
                page_number: _pageNumber,
                page_size: pageSize,
                status,
                student_id: searchStudent
            })
        }
    }

    const toggleAddModal = useCallback(
        (value: boolean) => {
            setVisibleAddModal(value)
        },
        [visibleAddModal]
    )

    const onChangeStatus = (val) => {
        setStatus(val)
        setPageNumber(1)
        getPreOrders({
            page_number: 1,
            page_size: pageSize,
            status: val,
            student_id: searchStudent
        })
    }

    const searchDataUserStudent = (data) => {
        if (data.selected) {
            const searchText = data.selected.id
            setSearchStudent(searchText)
            setPageNumber(1)
            getPreOrders({
                page_number: 1,
                page_size: pageSize,
                status,
                student_id: searchText
            })
        }
        if (data.clear) {
            setSearchStudent(null)
            setPageNumber(1)
            getPreOrders({
                page_number: 1,
                page_size: pageSize,
                status,
                student_id: null
            })
        }
    }

    const confirmAccept = async (item) => {
        try {
            const res = await OrderAPI.acceptPreOrders(item)
            if (res) {
                notify('success', 'Cập nhật trạng thái thành công')
                refetchData()
            }
        } catch (error) {
            console.log(error)
            notify('error', error.message)
        }
    }
    const cancel = async (item) => {
        try {
            const res = await OrderAPI.rejectPreOrders(item)
            if (res) {
                notify('success', 'Cập nhật trạng thái thành công')
                refetchData()
            }
        } catch (error) {
            console.log(error)
            notify('error', error.message)
        }
    }

    const removePreOrder = async (item) => {
        try {
            const res = await OrderAPI.removePreOrders(item)
            if (res) {
                notify('success', 'Xóa pre order thành công')
                refetchData()
            }
        } catch (error) {
            console.log(error)
            notify('error', error.message)
        }
    }

    const columns = [
        {
            title: 'Created date',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (text, record) => moment(text).format('DD/MM/YYYY HH:mm')
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if (text === PREORDER_STATUS.ACCEPTED)
                    return <Tag color='success'>ACCEPTED</Tag>
                if (text === PREORDER_STATUS.PENDING)
                    return <Tag color='warning'>PENDING</Tag>
                if (text === PREORDER_STATUS.REJECTED)
                    return <Tag color='error'>REJECTED</Tag>
            }
        },
        {
            title: 'Order package',
            dataIndex: 'ordered_packages',
            key: 'ordered_packages',
            render: (text, record) => {
                const res = record.ordered_packages.map((e) => {
                    return (
                        <li>
                            <p>Name: {e.pack.name}</p>
                            <p>Day of use: {e.pack.day_of_use}</p>
                            <p>Price: {toReadablePrice(e.pack.price)}</p>
                            <p>Number class: {e.pack.number_class}</p>
                            <p>Paid number class: {e.paid_number_class}</p>
                            <p>
                                Activation date:{' '}
                                {moment(e.activation_date).format(
                                    'DD/MM/YYYY HH:mm'
                                )}
                            </p>
                        </li>
                    )
                })
                return (
                    <ul style={{ listStyle: 'number' }} className='p-2 mb-2'>
                        {res}
                    </ul>
                )
            }
        },
        {
            title: 'Total price',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => toReadablePrice(text)
        },
        {
            title: 'Total bill',
            dataIndex: 'total_bill',
            key: 'total_bill',
            render: (text, record) => toReadablePrice(text)
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
                (checkPermission(PERMISSIONS.ompo_approve) ||
                    checkPermission(PERMISSIONS.ompo_reject)) && (
                    <Space size='middle'>
                        {record.status === PREORDER_STATUS.PENDING ? (
                            <Popconfirm
                                placement='topLeft'
                                title={`Xác nhận thêm gói học cho học viên và ghi nhận doanh thu là ${toReadablePrice(
                                    record.total_bill
                                )}?`}
                                onConfirm={() =>
                                    checkPermission(PERMISSIONS.ompo_approve) &&
                                    confirmAccept(record)
                                }
                                onCancel={() =>
                                    checkPermission(PERMISSIONS.ompo_reject) &&
                                    cancel(record)
                                }
                                okText='Chấp nhận'
                                cancelText='Từ chối'
                            >
                                <Button type='primary'>Approve/Reject</Button>
                            </Popconfirm>
                        ) : (
                            <></>
                        )}
                        {record.order_id ? (
                            <Popconfirm
                                placement='topLeft'
                                title='Lưu ý: Hành động xóa gói học này sẽ xóa toàn bộ các thông tin liên quan đến gói học như order, doanh thu, lịch đã ghép. Bạn có chắc chắn muốn xóa không?'
                                onConfirm={() =>
                                    checkPermission(PERMISSIONS.ompo_approve) &&
                                    removePreOrder(record)
                                }
                                overlayInnerStyle={{ maxWidth: '300px' }}
                                okText='Chấp nhận'
                                cancelText='Đóng'
                            >
                                <Button type='primary' danger>
                                    Delete
                                </Button>
                            </Popconfirm>
                        ) : (
                            <></>
                        )}
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
                    {Object.keys(PREORDER_STATUS)
                        .filter(
                            (key: any) => !isNaN(Number(PREORDER_STATUS[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={PREORDER_STATUS[key]}
                                key={PREORDER_STATUS[key]}
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
        }
    ]

    return (
        <Card title='Pre Order Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.ompo_create_order) ? (
                        <Button
                            type='primary'
                            className='mr-2'
                            onClick={() => toggleAddModal(true)}
                        >
                            Add New Pre Order
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
            <NewOrderModal
                visible={visibleAddModal}
                toggleModal={toggleAddModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default AllOrders
