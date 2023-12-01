import { useEffect, useCallback, FC, useState } from 'react'
import { Table, Card, Space, Modal, Button, Row, Col, Tag } from 'antd'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import { ITeacherLevel, ILocationRate } from 'types/ITeacherLevel'
import LocationAPI from 'api/LocationAPI'
import { ILocation } from 'types'
import FilterDataWrapper from 'components/filter-data-wrapper'
import TeacherLevelModal from './modals/TeacherLevelModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const TeacherLevel: FC = () => {
    const [isLoading, setLoading] = useState(false)
    const [visibleTeacherLevelModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ITeacherLevel>(null)
    const [teacherLevel, setTeacherLevel] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [locations, setLocations] = useState<ILocation[]>([])

    const getAllTeacherLevels = (query: {
        page_size?: number
        page_number?: number
    }) => {
        setLoading(true)
        TeacherLevelAPI.getTeacherLevels(query)
            .then((res) => {
                setTeacherLevel(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const getAllLocations = () => {
        LocationAPI.getLocations({ page_number: 1, page_size: 20 })
            .then((res) => setLocations(res.data))
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getAllTeacherLevels({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [])

    useEffect(() => {
        getAllLocations()
    }, [])

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleTeacherLevelModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleTeacherLevelModal, selectedItem]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getAllTeacherLevels({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getAllTeacherLevels({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const refetchData = useCallback(() => {
        getAllTeacherLevels({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [pageSize, pageNumber])

    const removeTeacherLevel = useCallback((id: number) => {
        setLoading(true)
        TeacherLevelAPI.removeTeacherLevel(id)
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
                removeTeacherLevel(item.id)
            }
        })
    }, [])

    const columnsRate = useCallback(() => {
        const newLocations: any = locations.map((x: ILocation) => ({
            title: x.name,
            dataIndex: `hourly_rates.${x.id}`,
            key: `hourly_rates.${x.id}`,
            render: (text, record: ITeacherLevel) => {
                const lc = record.hourly_rates.filter(
                    (hr: ILocationRate) => hr.location_id === x.id
                )
                if (lc[0]) return lc[0].hourly_rate
            }
        }))
        return newLocations
    }, [locations])

    const columns = [
        ...columnsRate(),
        {
            title: 'Level',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Min open slots/Circle',
            dataIndex: 'min_calendar_per_circle',
            key: 'min_calendar_per_circle'
        },
        {
            title: 'Min peak time slots/Circle',
            dataIndex: 'min_peak_time_per_circle',
            key: 'min_peak_time_per_circle'
        },
        {
            title: 'Max missed classes/Circle',
            dataIndex: 'max_missed_class_per_circle',
            key: 'max_missed_class_per_circle'
        },
        {
            title: 'Max request Absent/Circle',
            dataIndex: 'max_absent_request_per_circle',
            key: 'max_absent_request_per_circle'
        },
        {
            title: 'Accumulated classes for promotion',
            dataIndex: 'class_accumulated_for_promotion',
            key: 'class_accumulated_for_promotion'
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
                    {checkPermission(PERMISSIONS.satl_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit teacher level'
                        />
                    )}
                    {checkPermission(PERMISSIONS.satl_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove teacher level'
                        />
                    )}
                </Space>
            )
        }
    ]

    return (
        <Card title='Teacher Level Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.satl_create) ? (
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
                dataSource={teacherLevel}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <TeacherLevelModal
                visible={visibleTeacherLevelModal}
                type={modalType}
                data={selectedItem}
                locations={locations}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default TeacherLevel
