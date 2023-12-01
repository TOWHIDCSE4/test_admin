import { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Card, Space, Button, Tag } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import LocationAPI from 'api/LocationAPI'
import { notify } from 'utils/notify'
import { ILocation } from 'types'
import { MODAL_TYPE } from 'const'
import { toReadablePrice } from 'utils'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper from 'components/filter-data-wrapper'
import LocationModal from './modals/LocationModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const Location = ({ ...props }) => {
    const [locations, setLocations] = useState<ILocation[]>([])
    const [isLoading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ILocation>(null)

    const getLocations = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoading(true)
        LocationAPI.getLocations(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setLocations(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getLocations({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const refetchData = useCallback(() => {
        getLocations({ page_number: pageNumber, page_size: pageSize })
    }, [pageNumber, pageSize])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getLocations({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getLocations({
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

    const removePackage = useCallback((id: number) => {
        setLoading(true)
        LocationAPI.removeLocation(id)
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
        // Modal.confirm({
        //     icon: <ExclamationCircleOutlined />,
        //     content: `Are you sure to remove item?`,
        //     onOk() {
        //         removePackage(item.id)
        //     }
        // })
    }, [])

    const columns: ColumnsType = [
        {
            title: 'Location',
            dataIndex: 'name',
            key: 'name',
            width: 100,
            fixed: true
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
            fixed: true,
            render: (text) => <Tag color='#f50'>{text}</Tag>
        },
        {
            title: 'Salary student absent (percent)',
            dataIndex: 'percent_salary_student_absent',
            key: 'percent_salary_student_absent',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Accept time (minutes)',
            dataIndex: 'accept_time',
            key: 'accept_time',
            width: 120,
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Cancel time (minutes)',
            dataIndex: 'cancel_time',
            key: 'cancel_time',
            width: 120,
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Weekend bonus (number)',
            dataIndex: 'weekend_bonus',
            key: 'weekend_bonus',
            width: 120,
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Conversion bonus (number)',
            dataIndex: 'conversion_bonus',
            key: 'conversion_bonus',
            width: 120,
            render: (text) => toReadablePrice(text)
        },

        {
            title: 'Attendance bonus (number)',
            dataIndex: 'attendance_bonus',
            key: 'attendance_bonus',
            width: 120,
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Referral bonus (number)',
            dataIndex: 'referral_bonus',
            key: 'referral_bonus',
            width: 120,
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Substitute bonus (percent)',
            dataIndex: 'percent_substitute_bonus',
            key: 'percent_substitute_bonus',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Absent punish (percent)',
            dataIndex: 'percent_absent_punish',
            key: 'percent_absent_punish',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Trial absent punish (percent)',
            dataIndex: 'percent_absent_punish_trial',
            key: 'percent_absent_punish_trial',
            width: 120,
            render: (text) => text
        },

        {
            title: 'First 3 premium absent punish (percent)',
            dataIndex: 'percent_absent_punish_first_3_slot',
            key: 'percent_absent_punish_first_3_slot',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Absent < 1h punish (percent)',
            dataIndex: 'percent_absent_punish_1h',
            key: 'percent_absent_punish_1h',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Absent < 2h punish (percent)',
            dataIndex: 'percent_absent_punish_2h',
            key: 'percent_absent_punish_2h',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Absent < 3h punish (percent)',
            dataIndex: 'percent_absent_punish_3h',
            key: 'percent_absent_punish_3h',
            width: 120,
            render: (text) => text
        },

        {
            title: 'Absent >= 3h punish (number)',
            dataIndex: 'absent_punish_greater_3h',
            key: 'absent_punish_greater_3h',
            width: 120,
            render: (text) => toReadablePrice(text)
        },

        {
            title: 'Late memo punish (number)',
            dataIndex: 'late_memo_punish',
            key: 'late_memo_punish',
            width: 120,
            render: (text) => toReadablePrice(text)
        },

        {
            title: 'Over limit punish (number)',
            dataIndex: 'over_limit_punish',
            key: 'over_limit_punish',
            width: 120,
            render: (text) => toReadablePrice(text)
        },

        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.satl2_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit package'
                        />
                    )}
                </Space>
            )
        }
    ]

    return (
        <Card title={`Teacher's Locations Management`}>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.satl2_create) ? (
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
                dataSource={locations}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <LocationModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Location
