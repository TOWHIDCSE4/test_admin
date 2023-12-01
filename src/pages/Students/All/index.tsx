import React, { useCallback, useEffect, useReducer, useState } from 'react'
import StudentAPI from 'api/StudentAPI'
import { EnumStudentStatus, MODAL_TYPE } from 'const/status'
import {
    Table,
    Card,
    Avatar,
    Menu,
    Dropdown,
    Popover,
    Input,
    notification,
    Button,
    Form,
    Row,
    Col,
    Tag,
    Image,
    Select
} from 'antd'
import {
    UserOutlined,
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    AuditOutlined,
    PlusOutlined
} from '@ant-design/icons'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { IStudent } from 'types'
import UserAPI from 'api/UserAPI'
import EditRegularModal from 'core/Atoms/Modals/EditRegularModal'
import defaultStudentAvatar from 'assets/images/common/hv.png'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import StudentModal from './student-modal'

const { Search } = Input
const { Option } = Select

const RegularStudents = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            students: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumStudentStatus.ALL,
            iShownModal: false,
            modalType: null,
            student_info: {},
            search: queryUrl.get('search') || ''
        }
    )

    const [visibleRegularModal, setVisibleRegular] = useState<boolean>(false)

    const getAllStudents = ({ page_size, page_number, status, search }) => {
        setValues({ isLoading: true })
        StudentAPI.getAllStudents({
            page_size,
            page_number,
            status,
            search
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ students: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllStudents({
            page_number: values.page_number,
            page_size: values.page_size,
            status: values.status,
            search: values.search.trim()
        })
    }, [])

    const toggleModal = (value, type?: MODAL_TYPE) => {
        setValues({
            isShownModal: value,
            modalType: type,
            student_info: { is_active: false }
        })
    }

    const editStudent = (selected) => {
        toggleModal(true, MODAL_TYPE.EDIT)
        setValues({ student_info: selected })
    }

    const toggleEditRegularModal = useCallback(
        (val) => {
            setVisibleRegular(val)
        },
        [visibleRegularModal]
    )
    const editRegular = (selected) => {
        setVisibleRegular(true)
        setValues({ student_info: selected })
    }

    const refetchData = () => {
        getAllStudents({ ...values })
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllStudents({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        getAllStudents({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllStudents({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status
        })
    }

    const goToAutomaticSchedule = (item) => {
        window.open(`/automatic-scheduling/create?studentId=${item.id}`)
    }

    const adminView = (selected) => {
        UserAPI.adminView(selected.id)
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

    const memoView = (nameStudent) => {
        window.open(`/teaching/memo?search=${nameStudent}`)
    }

    const reportGenerate = (nameStudent) => {
        window.open(`/air/report-generate?user=${nameStudent}`)
    }

    const addLinkSkype = (selected) => {
        UserAPI.addLinkSkype(selected.id)
            .then((data) => {
                refetchData()
                notification.success({
                    message: 'Add link skype success'
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const menuActions = (record) => (
        <Menu>
            {checkPermission(PERMISSIONS.sas_update) && (
                <Menu.Item key='0' onClick={() => editStudent(record)}>
                    <EditOutlined className='mr-2' />
                    Edit Info
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.sas_edit_regular) && (
                <Menu.Item key='1' onClick={() => editRegular(record)}>
                    <EditOutlined className='mr-2' />
                    Edit regular
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.sas_add_link_skype) &&
                !record?.trial_class_skype_url && (
                    <Menu.Item key='2' onClick={() => addLinkSkype(record)}>
                        <PlusOutlined className='mr-2' />
                        Add link skype
                    </Menu.Item>
                )}
            <Menu.Item key='3' onClick={() => memoView(record?.username)}>
                <EyeOutlined className='mr-2' />
                Memo View
            </Menu.Item>
            <Menu.Item
                key='4'
                onClick={() =>
                    window.open(`/teaching/overview?student_id=${record?.id}`)
                }
            >
                <EyeOutlined className='mr-2' />
                Booking View
            </Menu.Item>
            <Menu.Item
                key='5'
                onClick={() =>
                    window.open(
                        `/csm/students-management?student_name=${record?.username}`
                    )
                }
            >
                <EyeOutlined className='mr-2' />
                CSM view
            </Menu.Item>
            <Menu.Item
                key='6'
                onClick={() =>
                    window.open(
                        `/students/leave-request?student_id=${record?.id}`
                    )
                }
            >
                <EyeOutlined className='mr-2' />
                Leave Request View
            </Menu.Item>
            {checkPermission(PERMISSIONS.sas_admin_view) && (
                <Menu.Item key='7' onClick={() => adminView(record)}>
                    <EyeOutlined className='mr-2' />
                    Admin View
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.airrg_view) && (
                <Menu.Item
                    key='8'
                    onClick={() => reportGenerate(record?.username)}
                >
                    <AuditOutlined className='mr-2' />
                    Report Generate
                </Menu.Item>
            )}
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

    const onChangeStatus = (val: string) => {
        setValues({ page_number: 1, status: val })
        getAllStudents({
            status: val,
            page_size: values.page_size,
            page_number: 1,
            search: values.search
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
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            fixed: 'left',
            width: 100,
            align: 'center',
            render: (text, record: IStudent) => (
                <Avatar
                    size='large'
                    src={
                        <Image
                            src={text || defaultStudentAvatar}
                            fallback={defaultStudentAvatar}
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
            width: 200,
            align: 'center',
            render: (text, record: any) => (
                <>
                    <span>{`${record.full_name} - ${record.username}`}</span>
                    {record?.student?.staff && (
                        <p>
                            <p>
                                <b>CSKH: </b>
                                {record.student.staff?.fullname}
                            </p>
                        </p>
                    )}
                </>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone_number',
            key: 'phone_number',
            width: 150,
            render: (text, record: IStudent) => text
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 200
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250
        },
        {
            title: 'Regular Time',
            dataIndex: 'regular_times',
            key: 'regular_times',
            width: 250,
            render: (text, record: IStudent) => (
                <ul>
                    {text &&
                        text
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
                    {text.length > 2 && (
                        <Popover content={renderAllRegularTimes(text)}>
                            <a href='#'>See more...</a>
                        </Popover>
                    )}
                </ul>
            )
        },
        {
            title: 'Link join Skype',
            dataIndex: 'trial_class_skype_url',
            key: 'link_join_skype',
            width: 280,
            render: (text, record: IStudent) => (
                <div>{text && text.joinLink}</div>
            )
        },
        {
            title: 'Latest Booking',
            dataIndex: 'course',
            key: 'course',
            width: 150
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 150,
            render: (text) => (
                <Tag color={text ? 'success' : 'warning'}>
                    {text ? 'ACTIVE' : 'INACTIVE'}
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
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: IStudent) => (
                <Dropdown overlay={menuActions(record)} trigger={['click']}>
                    <div className='ant-dropdown-link clickable'>
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
                    {Object.keys(EnumStudentStatus).map((key: any) => (
                        <Option
                            value={EnumStudentStatus[key]}
                            key={EnumStudentStatus[key]}
                        >
                            {_.upperCase(_.startCase(key))}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    defaultValue={values.search}
                    placeholder='By name , username , email'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Students Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.sas_create) ? (
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
                dataSource={values.students}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: IStudent) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                loading={values.isLoading}
                sticky
            />
            <StudentModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.student_info}
                refetchData={refetchData}
            />
            <EditRegularModal
                visible={visibleRegularModal}
                data={values.student_info}
                toggleModal={toggleEditRegularModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default RegularStudents
