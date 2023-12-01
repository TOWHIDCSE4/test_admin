import { useEffect, useCallback, FC, useState, useReducer } from 'react'
import { Table, Card, Space, Modal, Button, Row, Col, DatePicker } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import {
    EnumCouponType,
    EnumPackageType,
    EnumStudentType,
    ICoupon
} from 'types'
import CouponAPI from 'api/CouponAPI'
import moment from 'moment'
import { FULL_DATE_FORMAT, PAGINATION_CONFIG } from 'const'
import { ColumnsType } from 'antd/lib/table'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import CouponModal from './coupon-modal'

const { RangePicker } = DatePicker

const Coupon: FC = () => {
    const [isLoading, setLoading] = useState(false)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ICoupon>(null)
    const [coupons, setCoupons] = useState<ICoupon[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [filter, setFilter] = useReducer(
        (currentState, newState) => ({ ...currentState, ...newState }),
        {
            type: null,
            package_type: null,
            start_time_applied: null,
            end_time_applied: null
        }
    )

    const fetchCoupons = (query: {
        page_size?: number
        page_number?: number
        type?: EnumCouponType
        package_type?: EnumPackageType
        start_time_applied?: any
        end_time_applied?: any
    }) => {
        setLoading(true)
        const queryParams = {
            ...query
        }
        if (queryParams?.start_time_applied) {
            queryParams.start_time_applied = moment(
                queryParams.start_time_applied
            ).valueOf()
        }
        if (queryParams?.end_time_applied) {
            queryParams.end_time_applied = moment(
                queryParams.end_time_applied
            ).valueOf()
        }
        CouponAPI.getCoupons(queryParams)
            .then((res) => {
                setCoupons(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchCoupons({
            page_size: pageSize,
            page_number: pageNumber,
            ...filter
        })
    }, [])

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

    const handleTableChange = useCallback((pagination, filters, sorter, ex) => {
        if (ex?.action === 'filter') {
            setFilter({ ...filters })
            fetchCoupons({
                page_size: pagination.pageSize,
                page_number: 1,
                ...filter,
                ...filters
            })
            setPageNumber(1)
        }
        if (ex?.action === 'paginate') {
            fetchCoupons({
                page_size: pagination.pageSize,
                page_number: pagination.current,
                ...filter,
                ...filters
            })
            setPageNumber(pagination.current)
            setPageSize(pagination.pageSize)
        }
    }, [])

    const refetchData = useCallback(() => {
        fetchCoupons({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [pageSize, pageNumber])

    const removeCoupon = useCallback((id: number) => {
        setLoading(true)
        CouponAPI.removeCoupon(id)
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
                removeCoupon(item.id)
            }
        })
    }, [])

    const handleRangePicker = (value) => {
        if (_.isArray(value) && value.length === 2 && value[0] < value[1]) {
            setFilter({
                start_time_applied: value[0],
                end_time_applied: value[1]
            })
            fetchCoupons({
                page_size: pageSize,
                page_number: 1,
                ...filter,
                start_time_applied: value[0],
                end_time_applied: value[1]
            })
            setPageNumber(1)
        } else {
            setFilter({
                start_time_applied: null,
                end_time_applied: null
            })
            fetchCoupons({
                page_size: pageSize,
                page_number: 1,
                ...filter,
                start_time_applied: null,
                end_time_applied: null
            })
            setPageNumber(1)
        }
    }

    const columns: ColumnsType<ICoupon> = [
        {
            title: 'Coupon code',
            dataIndex: 'code',
            key: 'code',
            width: 150
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 150
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            width: 150
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (text) => _.startCase(_.get(EnumCouponType, text)),
            filters: [
                {
                    text: 'DISCOUNT',
                    value: EnumCouponType.DISCOUNT
                },
                {
                    text: 'SALE OFF',
                    value: EnumCouponType.SALE_OFF
                }
            ],
            filterMultiple: false
        },
        {
            title: 'Percentage off (%)',
            dataIndex: 'percentage_off',
            key: 'percentage_off',
            width: 150
        },
        {
            title: 'Apply for package',
            dataIndex: 'package_type',
            key: 'package_type',
            width: 150,
            render: (text) => _.startCase(_.get(EnumPackageType, text)),
            filters: [
                {
                    text: 'TRIAL',
                    value: EnumPackageType.TRIAL
                },
                {
                    text: 'STANDARD',
                    value: EnumPackageType.STANDARD
                },
                {
                    text: 'PREMIUM',
                    value: EnumPackageType.PREMIUM
                }
            ],
            filterMultiple: false
        },
        {
            title: 'Apply for student',
            dataIndex: 'student_type',
            key: 'student_type',
            width: 150,
            render: (text) => _.startCase(_.get(EnumStudentType, text))
        },
        {
            title: 'Min age',
            dataIndex: 'min_age',
            key: 'min_age',
            width: 100
        },
        {
            title: 'Max age',
            dataIndex: 'max_age',
            key: 'max_age',
            width: 100
        },
        {
            title: 'Start time shown',
            dataIndex: 'start_time_shown',
            key: 'start_time_shown',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'End time shown',
            dataIndex: 'end_time_shown',
            key: 'end_time_shown',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Start time applied',
            dataIndex: 'start_time_applied',
            key: 'start_time_applied',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'End time applied',
            dataIndex: 'end_time_applied',
            key: 'end_time_applied',
            width: 150,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.mc_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit coupon'
                        />
                    )}
                    {checkPermission(PERMISSIONS.mc_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove coupon'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    disabledDate={(current) =>
                        current &&
                        (current < moment().subtract(6, 'month') ||
                            current > moment().add(6, 'month'))
                    }
                    value={[filter.start_time_applied, filter.end_time_applied]}
                />
            )
        }
    ]

    return (
        <Card title='Coupon Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.mc_create) ? (
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
                {...PAGINATION_CONFIG}
                dataSource={coupons}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total
                }}
                rowKey={(record) => record?.id}
                onChange={handleTableChange}
            />
            <CouponModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Coupon
