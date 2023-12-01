import { useCallback, useEffect, useReducer, useState } from 'react'
import TeacherAPI from 'api/TeacherAPI'
import { EnumTeacherStatus, MODAL_TYPE } from 'const/status'
import {
    Table,
    Card,
    Avatar,
    Menu,
    Dropdown,
    Input,
    notification,
    Button,
    Popover,
    Form,
    Row,
    Col,
    Image,
    Select,
    Tag
} from 'antd'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import {
    UserOutlined,
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    LineOutlined
} from '@ant-design/icons'
import { TEACHER_LEVEL_STATUS } from 'const/teacher'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import EditRegularModal from 'core/Atoms/Modals/EditRegularModal'
import UserAPI from 'api/UserAPI'
import defaultAvatarTeacher from 'assets/images/common/teacher.png'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import EditTeacherModal from './edit-teacher-modal'
import AdministratorAPI from 'api/AdministratorAPI'
import { DEPARTMENT } from 'const/department'
import moment from 'moment'
import { exportTeacherList } from 'utils/export-xlsx'

const { Search } = Input
const { Option } = Select

const AllTeachers = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            teachers: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTeacherStatus.ALL,
            staff_id: EnumTeacherStatus.ALL,
            modalType: '',
            iShownModal: false,
            teacher_info: {},
            search: queryUrl.get('search') || ''
        }
    )

    const [teacherLevels, setTeacherLevels] = useState([])
    const [visibleRegularModal, setVisibleRegular] = useState<boolean>(false)
    const [staffs, setStaffs] = useState([])

    const toggleEditRegularModal = useCallback(
        (val) => {
            setVisibleRegular(val)
        },
        [visibleRegularModal]
    )
    const editRegular = (selected) => {
        setVisibleRegular(true)
        setValues({ teacher_info: selected })
    }

    const adminView = (selected) => {
        UserAPI.adminView(selected.user_id)
            .then((data) => {
                window.open(data.url)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllTeachers = useCallback(
        ({ page_size, page_number, search, status, staff_id }) => {
            setValues({ isLoading: true })
            TeacherAPI.getAllTeachers({
                page_size,
                page_number,
                search: search.trim(),
                status,
                staff_id
            })
                .then((res) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ teachers: res.data, total })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    const toggleModal = useCallback(
        (value: boolean, type?: MODAL_TYPE) => {
            setValues({
                isShownModal: value,
                modalType: type
            })
        },
        [values]
    )

    const exportExcel = async () => {
        const searchData = {
            page_size: 9999,
            page_number: 1,
            search: values.search,
            status: values.status,
            staff_id: values.staff_id
        }
        const dataExport = await TeacherAPI.getAllTeachers(searchData)
        if (dataExport.data && dataExport.data.length > 0) {
            const timeExport = moment().format('DD_MM_YYYY')
            await exportTeacherList(
                `Teacher_list_${timeExport}`,
                dataExport.data
            )
        }
    }

    const editTeacher = useCallback(
        (selected) => {
            toggleModal(true, MODAL_TYPE.EDIT)
            setValues({ teacher_info: selected })
        },
        [values]
    )

    const refetchData = () => {
        getAllTeachers({
            status: values.status,
            page_size: values.page_size,
            page_number: values.page_number,
            search: values.search,
            staff_id: values.staff_id
        })
    }

    const fetchAdminOptions = async (search, idDepartment) => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment
            })
            const dataStaffs = res.data.map((i) => ({
                label: `${i.fullname} - ${i.username}`,
                value: i.id,
                username: i.username,
                fullname: i.fullname,
                phoneNumber: i.phoneNumber
            }))
            setStaffs(dataStaffs)
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }

    useEffect(() => {
        TeacherLevelAPI.getTeacherLevels({}).then((result) => {
            setTeacherLevels(result.data)
            getAllTeachers({ ...values })
        })
        fetchAdminOptions('', DEPARTMENT.hocthuat.id)
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            getAllTeachers({
                status: values.status,
                page_number: pageNumber,
                page_size: pageSize,
                search: values.search,
                staff_id: values.staff_id
            })
        },
        [values]
    )

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllTeachers({
            search: val,
            page_size: values.page_size,
            status: values.status,
            page_number: 1,
            staff_id: values.staff_id
        })
    }

    const menuActions = (record) => (
        <Menu>
            {checkPermission(PERMISSIONS.tat_update) && (
                <Menu.Item key='0' onClick={() => editTeacher(record)}>
                    <EditOutlined className='mr-2' />
                    Edit Info
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tat_edit_regular) && (
                <Menu.Item key='1' onClick={() => editRegular(record)}>
                    <EditOutlined className='mr-2' />
                    Edit regular
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.tat_admin_view) && (
                <Menu.Item key='2' onClick={() => adminView(record)}>
                    <EyeOutlined className='mr-2' />
                    Admin View
                </Menu.Item>
            )}
            <Menu.Item
                key='3'
                onClick={() =>
                    window.open(
                        `/teachers/absent-request?teacher_name=${record?.user?.username}`
                    )
                }
            >
                <EyeOutlined className='mr-2' />
                Absent Request View
            </Menu.Item>
        </Menu>
    )

    const renderAllRegularTimes = (_regular_times: any[]) => (
        <ul style={{ height: '250px', overflow: 'auto' }} className='pr-3'>
            {_regular_times.map((item, index) => {
                const convertToLocal = getTimestampInWeekToLocal(item)
                return <li key={index}>{formatTimestamp(convertToLocal)}</li>
            })}
        </ul>
    )

    const onChangeStatus = (val) => {
        setValues({ page_number: 1, status: val })
        getAllTeachers({
            status: val,
            page_size: values.page_size,
            page_number: 1,
            search: values.search,
            staff_id: values.staff_id
        })
    }

    const onSearchStaff = (val) => {
        setValues({ page_number: 1, staff_id: val })
        getAllTeachers({
            status: values.status,
            page_size: values.page_size,
            page_number: 1,
            search: values.search,
            staff_id: val
        })
    }

    const columns: ColumnsType<ITeacher> = [
        {
            title: 'ID',
            dataIndex: 'user_id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            fixed: 'left',
            width: 100,
            align: 'center',
            render: (text, record: ITeacher) => (
                <Avatar
                    size='large'
                    src={
                        <Image
                            src={record.user_info?.avatar}
                            fallback={defaultAvatarTeacher}
                        />
                    }
                    icon={<UserOutlined />}
                    onError={() => true}
                />
            )
        },
        {
            title: 'Name',
            dataIndex: 'first_name',
            key: 'first_name',
            fixed: true,
            width: 150,
            render: (text, record: ITeacher) =>
                `${record.user_info?.full_name} - ${record.user_info?.username}`
        },
        {
            title: 'Phone',
            dataIndex: 'phone_number',
            key: 'phone_number',
            width: 150,
            render: (text, record: ITeacher) => record.user_info?.phone_number
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 150,
            render: (text, record: ITeacher) => record.user_info?.username
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (text, record: ITeacher) => record.user_info?.email
        },
        {
            title: 'Regular Time',
            dataIndex: 'regular_times',
            key: 'regular_times',
            width: 250,
            render: (text, record: ITeacher) => (
                <ul style={{ paddingInlineStart: '1em' }}>
                    {record.user_info?.regular_times &&
                        record.user_info.regular_times
                            .filter((x, index) => index < 2)
                            .map((x, _index) => {
                                const convertToLocal =
                                    getTimestampInWeekToLocal(x)
                                return (
                                    <li key={_index}>
                                        {formatTimestamp(convertToLocal)}
                                    </li>
                                )
                            })}
                    {record.user_info?.regular_times.length > 2 && (
                        <Popover
                            content={renderAllRegularTimes(
                                record.user_info.regular_times
                            )}
                        >
                            <Button type='link'>See more...</Button>
                        </Popover>
                    )}
                </ul>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            width: 150,
            render: (text, record: ITeacher) => record.location?.name
        },
        {
            title: 'Profile Eval',
            dataIndex: 'eval',
            key: 'eval',
            width: 150
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 200,
            render: (text, record: ITeacher) => (
                <div className='teacher-level'>{record?.level?.name}</div>
            )
        },
        {
            title: 'Staff',
            dataIndex: ['staff', 'fullname'],
            key: 'staff',
            width: 150
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 150,
            render: (text, record: ITeacher) => (
                <Tag color={record.user_info.is_active ? 'success' : 'warning'}>
                    {record.user_info.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 200
        },
        {
            title: 'Bank Account',
            dataIndex: 'user_info',
            key: 'user_info',
            width: 200,
            render: (text, record: ITeacher) => (
                <Popover
                    content={
                        <>
                            <b>Bank Name:</b>{' '}
                            <p>{text?.bank_account?.bank_name}</p>
                            <b>Bank Account:</b>
                            <p>{text?.bank_account?.account_number}</p>
                            <b>Account Number:</b>
                            <p>{text?.bank_account?.account_name}</p>
                            <b>Paypal Email:</b>
                            <p>{text?.bank_account?.paypal_email}</p>
                            <b>Note:</b>
                            <p>{text?.bank_account?.note}</p>
                        </>
                    }
                >
                    <span>{text?.bank_account?.account_number}</span>
                </Popover>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: ITeacher) => (
                <Dropdown overlay={menuActions(record)} trigger={['click']}>
                    <div
                        className='ant-dropdown-link clickable'
                        onClick={(e) => e.preventDefault()}
                    >
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
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
                    value={values.status}
                    onChange={onChangeStatus}
                >
                    {Object.keys(EnumTeacherStatus).map((key: any) => (
                        <Option
                            value={EnumTeacherStatus[key]}
                            key={EnumTeacherStatus[key]}
                        >
                            {_.upperCase(_.startCase(key))}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Staff',
            engine: (
                <Select
                    defaultValue={values.staff_id}
                    style={{ width: '100%' }}
                    onChange={_.debounce(onSearchStaff, 250)}
                >
                    <Select.Option value=''>All</Select.Option>
                    {staffs.map((item, index) => (
                        <Select.Option
                            key={`staff_id${index}`}
                            value={item.value}
                        >
                            {_.capitalize(item.label)}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    defaultValue={values.search}
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Teachers Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.tat_create) ? (
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
                    ),
                    checkPermission(PERMISSIONS.tat_export_excel) ? (
                        <Button type='primary' onClick={() => exportExcel()}>
                            Export excel
                        </Button>
                    ) : null
                ].filter(Boolean)}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.teachers}
                columns={columns}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} items`,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: ITeacher) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />

            <EditTeacherModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.teacher_info}
                refetchData={refetchData}
            />

            <EditRegularModal
                visible={visibleRegularModal}
                data={values?.teacher_info?.user_info}
                toggleModal={toggleEditRegularModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default AllTeachers
