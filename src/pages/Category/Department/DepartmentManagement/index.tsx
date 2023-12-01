import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import DepartmentAPI from 'api/DepartmentAPI'
import { notify } from 'utils/notify'
import { debounce } from 'lodash-es'
import { Button, Modal, Table, Space, Card, Row, Col, Input } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { EnumRole } from 'const/enum'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import ModalForm from './ModalFormDepartment'
// import ModalFormPermission from './ModalFormPermissionOfRole'
import ModalFormPermission from './ModalFormPermission'
import { ModalFormDepartmentRef, ModalFormPermissionRef } from './interface'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { confirm } = Modal

const Role = () => {
    const refModalForm = useRef<ModalFormDepartmentRef>(null)
    const refModalFormPermission = useRef<ModalFormPermissionRef>(null)

    const [search, setSearch] = useState('')
    const [expandedRowKeys, setExpandedRowKeys] = useState([])

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false
        }
    )

    const loadData = (text?: string) => {
        setValues({
            isLoading: true
        })
        DepartmentAPI.getDepartments({ search: text || search })
            .then((res) => {
                setValues({
                    data: res?.map((s) => {
                        if (s?.id === 1) return s
                        const newS = {
                            ...s,
                            children: [
                                {
                                    _id: `${s?.id}-manager`,
                                    id: s?.id,
                                    canUpdate: s?.canUpdateManager,
                                    departmentName: s?.name,
                                    description: `${
                                        s?.permissionOfMember?.manager
                                            ?.length || 0
                                    } quyền`,
                                    name: 'Trưởng phòng',
                                    role: 'manager'
                                },
                                {
                                    _id: `${s?.id}-deputy_manager`,
                                    id: s?.id,
                                    canUpdate: s?.canUpdateManager,
                                    departmentName: s?.name,
                                    description: `${
                                        s?.permissionOfMember?.deputy_manager
                                            ?.length || 0
                                    } quyền`,
                                    name: 'Phó phòng',
                                    role: 'deputy_manager'
                                },
                                {
                                    _id: `${s?.id}-leader`,
                                    id: s?.id,
                                    canUpdate: s?.canUpdateManager,
                                    departmentName: s?.name,
                                    description: `${
                                        s?.permissionOfMember?.leader?.length ||
                                        0
                                    } quyền`,
                                    name: 'Trưởng nhóm',
                                    role: 'leader'
                                },
                                {
                                    _id: `${s?.id}-staff`,
                                    id: s?.id,
                                    canUpdate: s?.canUpdateManager,
                                    departmentName: s?.name,
                                    description: `${
                                        s?.permissionOfMember?.staff?.length ||
                                        0
                                    } quyền`,
                                    name: 'Nhân viên',
                                    role: 'staff'
                                }
                            ]
                        }
                        return newS
                    })
                })
            })
            .catch((err) => notify('error', err.message))
            .finally(() =>
                setValues({
                    isLoading: false
                })
            )
    }

    useEffect(() => {
        loadData()
    }, [])

    const clickNew = useCallback(() => {
        refModalForm.current?.showModal()
    }, [])

    const clickEdit = useCallback((item) => {
        refModalForm.current?.showModal(item)
    }, [])

    const onFilter = useCallback((text) => {
        setSearch(text)
        loadData(text)
    }, [])

    const deleteRole = async (id) => {
        DepartmentAPI.removeDepartment(id)
            .then((res) => {
                notify('success', 'Xóa thành công')
                loadData()
            })
            .catch((err) => notify('error', err.message))
    }

    const showConfirmDelete = (item) => {
        confirm({
            title: `Bạn có muốn xóa phòng/ban ${item?.name || ''}?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteRole(item?.id)
            }
        })
    }

    const editPermission = useCallback((item: any) => {
        refModalFormPermission?.current?.showModal(item)
    }, [])

    const handleExpandedRowKeys = (key: string) => {
        const keys = [...expandedRowKeys]
        const index = keys.indexOf(key)
        if (index !== -1) {
            keys.splice(index, 1)
        } else {
            keys.push(key)
        }
        setExpandedRowKeys(keys)
    }

    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Tên phòng/ban',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Truởng phòng/ban',
            dataIndex: 'manager',
            key: 'manager',
            render: (text) => text?.fullname
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Phân quyền',
            key: 'action',
            render: (_text, record) => {
                if (record?.id === 1) {
                    return (
                        <Space size='middle'>
                            <Button
                                type='primary'
                                onClick={() =>
                                    editPermission({
                                        ...record,
                                        departmentName: record?.name,
                                        canUpdate: false,
                                        role: EnumRole.Manager
                                    })
                                }
                            >
                                Xem quyền
                            </Button>
                        </Space>
                    )
                }
                if (record?.children)
                    return (
                        <Space size='middle'>
                            <Button
                                type='primary'
                                className='btn-test'
                                onClick={() =>
                                    handleExpandedRowKeys(record._id)
                                }
                            >
                                Chi tiết quyền
                            </Button>
                            {checkPermission(PERMISSIONS.hrmrm_update) && (
                                <Button
                                    type='primary'
                                    disabled={record.canUpdateManager === false}
                                    onClick={() => clickEdit(record)}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            )}
                            {checkPermission(PERMISSIONS.hrmrm_delete) && (
                                <Button
                                    danger
                                    disabled={record.canUpdateManager === false}
                                    onClick={() => showConfirmDelete(record)}
                                >
                                    Xóa
                                </Button>
                            )}
                        </Space>
                    )
                return (
                    <Space size='middle'>
                        <Button
                            type='primary'
                            onClick={() => editPermission(record)}
                        >
                            {record.canUpdate === false
                                ? 'Xem quyền'
                                : 'Chỉnh sửa quyền'}
                        </Button>
                    </Space>
                )
            }
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: <Input.Search onSearch={debounce(onFilter, 300)} />
        }
    ]

    return (
        <Card
            title='Phân quyền người dùng'
            bordered={false}
            className='admin-department'
        >
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.hrmrm_create) ? (
                        <Button type='primary' onClick={clickNew}>
                            Thêm mới
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                loading={values.isLoading}
                dataSource={values?.data || []}
                columns={columns}
                rowKey={(v) => v?._id}
                scroll={{
                    x: 500
                }}
                rowSelection={{
                    type: 'checkbox',
                    getCheckboxProps: (record) => ({
                        disabled: !record?.children
                    })
                }}
                expandable={{
                    expandedRowKeys,
                    expandIconColumnIndex: -1
                }}
            />
            <ModalForm ref={refModalForm} callBack={loadData} />
            <ModalFormPermission
                ref={refModalFormPermission}
                callBack={loadData}
            />
        </Card>
    )
}

export default Role
