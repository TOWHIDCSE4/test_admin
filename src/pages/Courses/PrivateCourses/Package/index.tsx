import React, { useEffect, useCallback, useState } from 'react'
import {
    Table,
    Tag,
    Space,
    Card,
    Row,
    Col,
    Button,
    Input,
    Image,
    Modal,
    Select
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    BarsOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import LocationAPI from 'api/LocationAPI'
import PackageAPI from 'api/PackageAPI'
import { notify } from 'utils/notify'
import { IPackage, ILocation, ISubject, EnumPackageType } from 'types'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import SubjectAPI from 'api/SubjectAPI'
import { ColumnsType } from 'antd/lib/table'
import { PAGINATION_CONFIG } from 'const/common'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import PackageModal from './package-modal'

import { TYPE, TYPE_LABEL } from '../../../../const/package'
import ViewOrderedPackagesModal from './view-ordered-packages-modal'

const { Search } = Input

const Package = () => {
    const [packages, setPackages] = useState<IPackage[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [searchNumberClass, setSearchNumberClass] = useState<string>('')
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [locations, setLocations] = useState<ILocation[]>([])
    const [subjects, setSubjects] = useState<ISubject[]>([])
    const [visibleModal, setVisible] = useState<boolean>(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IPackage>(null)
    const [type, setType] = useState<number>(0)
    const [selectedLocationId, setSelectedLocationId] = useState<number>(-1)
    const [viewOrderPackageId, setViewOrderPackageId] = useState<number>(null)

    const getPackages = (query: {
        page_size: number
        page_number: number
        search?: string
        number_class?: string
        type?: number
        location_id?: number
    }) => {
        setLoading(true)
        PackageAPI.getPackages(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setPackages(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const getLocations = () => {
        LocationAPI.getLocations()
            .then((res) => {
                setLocations(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getSubjects = () => {
        SubjectAPI.getSubjects()
            .then((res) => {
                setSubjects(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getPackages({ page_number: pageNumber, page_size: pageSize })
        getLocations()
        getSubjects()
    }, [])

    const refetchData = useCallback(() => {
        getPackages({
            page_number: pageNumber,
            page_size: pageSize,
            search,
            type,
            location_id: selectedLocationId,
            number_class: searchNumberClass
        })
    }, [
        pageNumber,
        pageSize,
        search,
        type,
        selectedLocationId,
        searchNumberClass
    ])

    const onSearch = useCallback(
        (value) => {
            if (value !== search) {
                setPageNumber(1)
                setSearch(value)
                getPackages({
                    search: value,
                    page_number: 1,
                    page_size: pageSize,
                    type,
                    location_id: selectedLocationId,
                    number_class: searchNumberClass
                })
            }
        },
        [
            pageNumber,
            pageSize,
            search,
            type,
            selectedLocationId,
            searchNumberClass
        ]
    )

    const onSearchByNumberClass = useCallback(
        (value: string) => {
            if (value !== searchNumberClass) {
                setPageNumber(1)
                setSearchNumberClass(value)
                getPackages({
                    search,
                    page_number: 1,
                    page_size: pageSize,
                    type,
                    location_id: selectedLocationId,
                    number_class: value
                })
            }
        },
        [
            pageNumber,
            pageSize,
            search,
            type,
            selectedLocationId,
            searchNumberClass
        ]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getPackages({
                page_number: pageNumber,
                page_size: _pageSize,
                search,
                type,
                location_id: selectedLocationId,
                number_class: searchNumberClass
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getPackages({
                page_number: _pageNumber,
                page_size: pageSize,
                search,
                type,
                location_id: selectedLocationId,
                number_class: searchNumberClass
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

    const removePackage = useCallback((id: number) => {
        setLoading(true)
        PackageAPI.removePackage(id)
            .then((res) => {
                notify('success', res.warning)
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
                removePackage(item.id)
            }
        })
    }, [])

    const onChangeType = useCallback(
        (item) => {
            setType(item)
            getPackages({
                page_number: 1,
                page_size: pageSize,
                search,
                type: item,
                location_id: selectedLocationId,
                number_class: searchNumberClass
            })
            setPageNumber(1)
        },
        [
            pageNumber,
            pageSize,
            search,
            type,
            selectedLocationId,
            searchNumberClass
        ]
    )

    const onChangeLocation = useCallback(
        (id) => {
            setSelectedLocationId(id)
            getPackages({
                page_number: 1,
                page_size: pageSize,
                search,
                type,
                location_id: id,
                number_class: searchNumberClass
            })
            setPageNumber(1)
        },
        [
            pageNumber,
            pageSize,
            search,
            type,
            selectedLocationId,
            searchNumberClass
        ]
    )

    const onViewOrderedPackages = useCallback((id: number) => {
        setViewOrderPackageId(id)
    }, [])

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Preview',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (text, record) => (
                <Image width={50} src={text} onError={() => true} />
            )
        },
        {
            title: 'Name package',
            dataIndex: 'name',
            key: 'name',
            width: 200
        },
        {
            title: 'Day of use',
            dataIndex: 'day_of_use',
            key: 'day_of_use',
            width: 120,
            align: 'center'
        },
        {
            title: 'Number class',
            dataIndex: 'number_class',
            key: 'number_class',
            width: 160,
            align: 'center'
        },
        {
            title: 'Number ordered packages',
            dataIndex: 'number_ordered_packages',
            key: 'number_ordered_packages',
            width: 160,
            align: 'center',
            render: (text, record: IPackage) => (
                <Space align='center' size='middle'>
                    <p>{text.toLocaleString('en-US')}</p>

                    <div style={{ opacity: text === 0 ? '0' : '1' }}>
                        <BarsOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onViewOrderedPackages(record.id)}
                            title='View Orders'
                        />
                    </div>
                </Space>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            align: 'center',
            render: (text) =>
                new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(text)
        },
        {
            title: 'Apply for teacher',
            dataIndex: 'location',
            key: 'location',
            width: 150,
            align: 'center',
            render: (text, record: IPackage) => {
                if (record.location_id === -1) return 'All'
                return text?.name
            }
        },
        {
            title: 'Type booking',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            align: 'center',
            render: (text, record, index) => {
                if (text === EnumPackageType.STANDARD)
                    return <Tag color='#108ee9'>STANDARD</Tag>
                if (text === EnumPackageType.PREMIUM)
                    return <Tag color='#f50'>PREMIUM</Tag>
                if (text === EnumPackageType.TRIAL)
                    return <Tag color='#87d068'>TRIAL</Tag>
            }
        },
        {
            title: 'Support booking',
            dataIndex: 'is_support',
            key: 'is_support',
            width: 150,
            align: 'center',
            render: (text, record, index) => {
                if (text) return <Tag color='success'>Support</Tag>
                return <Tag color='error'>Not support</Tag>
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 120,
            render: (text) => {
                if (text === TYPE.TRIAL) return <Tag color='success'>TRIAL</Tag>
                if (text === TYPE.STANDARD)
                    return <Tag color='success'>STANDARD</Tag>
                if (text === TYPE.PREMIUM)
                    return <Tag color='success'>PREMIUM</Tag>
            }
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record, index) => {
                if (text) return <Tag color='success'>Active</Tag>
                return <Tag color='error'>Inactive</Tag>
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
                    {checkPermission(PERMISSIONS.pmp_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit package'
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmp_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove package'
                        />
                    )}
                </Space>
            )
        }
    ]

    const renderType = () =>
        TYPE_LABEL.map((e, index) => (
            <Select.Option key={index + 1} value={index + 1}>
                {e}
            </Select.Option>
        ))

    const renderLocations = () =>
        locations.map((e, index) => (
            <Select.Option key={e.id} value={e.id}>
                {e.name}
            </Select.Option>
        ))

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Location',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by location'
                    optionFilterProp='children'
                    value={selectedLocationId}
                    onChange={onChangeLocation}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Select.Option value={-1}>All</Select.Option>
                    {renderLocations()}
                </Select>
            )
        },
        {
            label: 'Type',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by type'
                    optionFilterProp='children'
                    value={type}
                    onChange={onChangeType}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Select.Option value={0}>ALL</Select.Option>
                    {renderType()}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , slug , alias'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        },
        {
            label: 'Number Class',
            engine: (
                <Search
                    placeholder='Enter number class'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchByNumberClass, 250)}
                    type='number'
                />
            )
        }
    ]

    return (
        <Card title='Package Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.pmp_create) ? (
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
                bordered
                dataSource={packages}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: IPackage) => record?.id}
                scroll={{
                    x: 500
                }}
                sticky
            />

            <PackageModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                locations={locations}
                subjects={subjects}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />

            <ViewOrderedPackagesModal
                visible={!!viewOrderPackageId}
                packageId={viewOrderPackageId}
                close={() => setViewOrderPackageId(null)}
            />
        </Card>
    )
}

export default Package
