/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import AdministratorAPI from 'api/AdministratorAPI'
import DepartmentAPI from 'api/DepartmentAPI'
import { locateMoment } from 'const'
import { notify } from 'utils/notify'
import { debounce } from 'lodash-es'
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Space,
    Table,
    Modal,
    Select,
    Badge,
    Tooltip
} from 'antd'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import FilterDataWrapper from 'components/filter-data-wrapper'
import ModalForm from './ModalFormAdmin'
import { ModalFormRef } from './interface'
import './style.scss'
import ModalFormPermissionForUser from 'pages/Category/Department/DepartmentManagement/ModalFormPermissionForUser'
import { ModalFormPermissionForUserRef } from 'pages/Category/Department/DepartmentManagement/interface'

const { confirm } = Modal
const { Option } = Select

moment.updateLocale('en', locateMoment)

const AdminAll = () => {
    const [search, setSearch] = useState('')
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            department: null,
            departments: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0
        }
    )

    const refModalForm = useRef<ModalFormRef>(null)
    const refModalFormPermissionForUser =
        useRef<ModalFormPermissionForUserRef>(null)

    useEffect(() => {
        loadDepartment()
        loadData(1, '')
    }, [])

    const clickEdit = useCallback((admin) => {
        refModalForm.current?.showModal(admin)
    }, [])

    const clickNew = useCallback(() => {
        refModalForm.current?.showModal()
    }, [])

    const onFilter = useCallback(
        (event) => {
            const text = event?.target?.value
            setSearch(text)
            loadData(values.page_number, null, text)
        },
        [values.page_number]
    )

    const loadDepartment = useCallback((id?: number) => {
        DepartmentAPI.getDepartments({ idDepartment: id || '' })
            .then((res) => {
                setValues({
                    departments: res || []
                })
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }, [])

    const loadData = (
        offset?: any,
        idDepartment?: any,
        text?: string,
        pageSize?: number
    ) => {
        setValues({
            isLoading: true
        })
        AdministratorAPI.getAdministrators({
            limit: pageSize || values.page_size,
            offset: offset || values.page_number,
            search: text || search,
            idDepartment: idDepartment || values.department || ''
        })
            .then((res) => {
                if (
                    res.offset &&
                    res.limit &&
                    res.totalDocument &&
                    res.totalPage &&
                    res.data
                ) {
                    setValues({
                        data: res.data,
                        page_number: res.offset,
                        total: res.totalDocument
                    })
                }
            })
            .catch((err) => {
                notify('error', err?.message || 'Lỗi không xác định')
            })
            .finally(() =>
                setValues({
                    isLoading: false
                })
            )
    }

    const onChangePagination = useCallback(
        (page: number, pageSize?: number) => {
            setValues({
                page_number: page,
                page_size: pageSize || values.page_size
            })
            loadData(page, null, null, pageSize)
        },
        [values]
    )

    const deleteRole = async (id) => {
        AdministratorAPI.removeAdministrator(id)
            .then(() => {
                notify('success', 'Xóa thành công')
                loadData(values.page_number)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const editPermissionOfUser = useCallback((item: any) => {
        const newItem = {
            canUpdate: item?.canUpdate,
            adminId: item.id,
            fullName: item.fullname
        }
        refModalFormPermissionForUser?.current?.showModal(newItem)
    }, [])

    const showConfirmDelete = (item) => {
        confirm({
            title: `Bạn có muốn xóa người dùng ${item?.name || ''}?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteRole(item?.id)
            }
        })
    }

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
            title: 'Tài khoản',
            dataIndex: 'username',
            key: 'username',
            width: 130,
            fixed: 'left',
            render: (text, record: any) => (
                <Tooltip
                    placement='top'
                    title={
                        record?.is_active ? 'Đã kích hoạt' : 'Chưa kích hoạt'
                    }
                >
                    <Badge status={record?.is_active ? 'success' : 'error'} />
                    {text}
                </Tooltip>
            )
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullname',
            width: 200,
            fixed: 'left',
            key: 'fullname'
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'bod',
            width: 120,
            key: 'bod',
            render: (text) => (text ? moment(text).format('DD-MM-YYYY') : '')
        },
        {
            title: 'Email - Số điện thoại',
            dataIndex: 'email',
            width: 200,
            key: 'email',
            render: (text, record: any) =>
                `${text || ''} - ${record?.phoneNumber || ''}`
        },
        {
            title: 'Phòng/ban',
            dataIndex: 'department',
            width: 200,
            key: 'department',
            render: (text) => (
                <Tooltip
                    placement='top'
                    title={`Phòng/ban ${text?.department?.name || ''}`}
                >
                    {text?.department?.name} -{' '}
                    {text?.isRole === 'manager'
                        ? 'Trưởng phòng'
                        : text?.isRole === 'deputy_manager'
                        ? 'Phó phòng'
                        : text?.isRole === 'leader'
                        ? 'Trưởng nhóm'
                        : 'Nhân viên'}
                </Tooltip>
            )
        },
        {
            title: 'Đăng nhập gần đây',
            dataIndex: 'last_login',
            width: 160,
            key: 'last_login',
            render: (text) => (
                <Tooltip
                    placement='topLeft'
                    title={text ? moment(text).format('DD-MM-YYYY HH:mm') : ''}
                >
                    {text ? moment(text).fromNow() : ''}
                </Tooltip>
            )
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'bankingNumber',
            width: 200,
            key: 'bankingNumber'
        },
        {
            title: 'Tên ngân hàng',
            dataIndex: 'bankingName',
            width: 200,
            key: 'bankingName'
        },
        {
            title: '',
            key: 'action',
            fixed: 'right',
            width: 350,
            render: (_text, record: any) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.hrmum_update) && (
                        <Button
                            type='primary'
                            onClick={() => editPermissionOfUser(record)}
                        >
                            {record.canUpdate ? 'Chỉnh sửa quyền' : 'Xem quyền'}
                        </Button>
                    )}
                    {checkPermission(PERMISSIONS.hrmum_update) && (
                        <Button
                            type='primary'
                            onClick={() => clickEdit(record)}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                    {checkPermission(PERMISSIONS.hrmum_delete) && (
                        <Button
                            danger
                            onClick={() => showConfirmDelete(record)}
                        >
                            Xóa
                        </Button>
                    )}
                </Space>
            )
        }
    ]

    const onChangeDepartment = useCallback((valuesSelect: any) => {
        if (valuesSelect === '*') {
            loadData()
            setValues({
                department: null
            })
        } else {
            loadData(null, valuesSelect)
            setValues({
                department: valuesSelect
            })
        }
    }, [])

    const filterEngines = [
        {
            label: 'Department',
            engine: (
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder='Chọn phòng ban'
                    optionFilterProp='children'
                    onChange={onChangeDepartment}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Option value='*'>Tất cả phòng/ban</Option>
                    {values?.departments?.map((d, index) => (
                        <Option value={d?.id} key={index}>
                            {d?.name}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Input.Search
                    placeholder='By name , username'
                    onChange={debounce(onFilter, 300)}
                />
            )
        }
    ]

    return (
        <Card
            title='Quản lý người dùng'
            bordered={false}
            className='admin-managerment-user'
        >
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.hrmum_create) ? (
                        <Button type='primary' onClick={clickNew}>
                            Thêm mới
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Row gutter={[0, 10]}>
                <Col span={24}>
                    <Row>
                        <Col span={24}>
                            <Table
                                bordered
                                loading={values.isLoading}
                                dataSource={values?.data || []}
                                columns={columns}
                                rowKey={(v: any) => v?._id}
                                onRow={(record) => ({
                                    onDoubleClick: (_event) => {
                                        refModalForm?.current?.showModal(
                                            record,
                                            true
                                        )
                                    }
                                })}
                                scroll={{
                                    x: 500
                                }}
                                pagination={{
                                    current: values?.page_number || 0,
                                    pageSize: values?.page_size || 10,
                                    total: values?.total || 0,
                                    showSizeChanger: true,
                                    onChange: onChangePagination,
                                    locale: {
                                        items_per_page: ''
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <ModalForm
                ref={refModalForm}
                callBack={() => loadData(values.page_number)}
            />
            <ModalFormPermissionForUser ref={refModalFormPermissionForUser} />
        </Card>
    )
}

export default AdminAll
