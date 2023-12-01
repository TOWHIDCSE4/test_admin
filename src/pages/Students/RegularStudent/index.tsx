import React, { useCallback, useEffect, useReducer, useState } from 'react'
import StudentAPI from 'api/StudentAPI'
import { MODAL_TYPE } from 'const/status'
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
    Select,
    Image
} from 'antd'
import {
    UserOutlined,
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    ShoppingCartOutlined,
    SendOutlined,
    MailOutlined
} from '@ant-design/icons'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { EnumStudentTypeByOrderPackage, IStudent } from 'types'
import UserAPI from 'api/UserAPI'
import EditRegularModal from 'core/Atoms/Modals/EditRegularModal'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import defaultStudentAvatar from 'assets/images/common/hv.png'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import StudentModal from './student-modal'
import SendEmailModal from './send-mail-modal'

const { Search } = Input
const { Option } = Select

const RegularStudents = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            students: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: 'active',
            iShownModal: false,
            modalType: null,
            student_info: {},
            search: '',
            type: EnumStudentTypeByOrderPackage.PREMIUM
        }
    )

    const [visibleRegularModal, setVisibleRegular] = useState<boolean>(false)
    const [visibleSendEmail, setVisibleSendEmail] = useState<boolean>(false)

    const getRegularStudents = ({
        page_size,
        page_number,
        status,
        search,
        type
    }) => {
        setValues({ isLoading: true })
        StudentAPI.getRegularStudents({
            page_size,
            page_number,
            status,
            search,
            type
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
        getRegularStudents({
            page_number: values.page_number,
            page_size: values.page_size,
            status: values.status,
            search: values.search,
            type: values.type
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
        if (values.type === EnumStudentTypeByOrderPackage.PREMIUM) {
            setVisibleRegular(true)
            setValues({ student_info: selected })
        }
    }

    const toggleSendEmail = (val: boolean, selected?: any) => {
        setVisibleSendEmail(val)
        setValues({ student_info: selected })
    }

    const refetchData = () => {
        getRegularStudents({ ...values })
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

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getRegularStudents({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        getRegularStudents({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getRegularStudents({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status,
            type: values.type
        })
    }

    const onChangeType = (val) => {
        setValues({
            type: val,
            page_number: 1
        })
        getRegularStudents({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status,
            type: val
        })
    }

    const goToAutomaticSchedule = (item) => {
        if (values.type === EnumStudentTypeByOrderPackage.PREMIUM) {
            window.open(`/automatic-scheduling/create?studentId=${item.id}`)
        }
    }

    const menuActions = (record) => (
        <Menu>
            {checkPermission(PERMISSIONS.srs_update) && (
                <Menu.Item key='0' onClick={() => editStudent(record)}>
                    <EditOutlined className='mr-2' />
                    Edit Info
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.srs_edit_regular) && (
                <Menu.Item
                    key='2'
                    onClick={() => editRegular(record)}
                    disabled={
                        values.type !== EnumStudentTypeByOrderPackage.PREMIUM
                    }
                >
                    <EditOutlined className='mr-2' />
                    Edit regular
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.srs_send_email) && (
                <Menu.Item
                    key='7'
                    onClick={() => toggleSendEmail(true, record)}
                >
                    <MailOutlined className='mr-2' />
                    Send Email
                </Menu.Item>
            )}
            {checkPermission(PERMISSIONS.srs_admin_view) && (
                <Menu.Item key='8' onClick={() => adminView(record)}>
                    <EyeOutlined className='mr-2' />
                    Admin View
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
            dataIndex: ['avatar'],
            key: 'avatar',
            fixed: 'left',
            width: 100,
            align: 'center',
            render: (text) => (
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
            dataIndex: ['full_name'],
            key: 'first_name',
            fixed: true,
            width: 200,
            align: 'center',
            render: (text, record: any) => (
                <>
                    <span>{`${text}`}</span>
                    {record?.student?.staff && (
                        <p>
                            <b>CSKH: </b>
                            {record.student.staff?.fullname}
                        </p>
                    )}
                </>
            )
        },
        {
            title: 'Phone',
            dataIndex: ['phone_number'],
            key: 'phone_number',
            width: 150,
            render: (text) => text
        },
        {
            title: 'Username',
            dataIndex: ['username'],
            key: 'username',
            width: 200
        },
        {
            title: 'Email',
            dataIndex: ['email'],
            key: 'email',
            width: 250
        },
        {
            title: 'Regular Time',
            dataIndex: ['regular_times'],
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
                    {text && text.length > 2 && (
                        <Popover content={renderAllRegularTimes(text)}>
                            <a href='#'>See more...</a>
                        </Popover>
                    )}
                </ul>
            )
        },
        {
            title: 'Package',
            dataIndex: 'package',
            key: 'package',
            width: 150
        },
        {
            title: 'Latest Booking',
            dataIndex: 'course',
            key: 'course',
            width: 150
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 200
        },
        {
            title: 'Created time',
            dataIndex: ['created_time'],
            key: 'note',
            width: 150,
            render: (text) => text && moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Dropdown
                    overlay={menuActions(record)}
                    trigger={['click']}
                    placement='bottomRight'
                >
                    <div className='ant-dropdown-link clickable'>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Type',
            engine: (
                <Select
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by type'
                    value={values.type}
                    onChange={onChangeType}
                >
                    <Option
                        value={EnumStudentTypeByOrderPackage.PREMIUM}
                        key={EnumStudentTypeByOrderPackage.PREMIUM}
                    >
                        PREMIUM
                    </Option>
                    <Option
                        value={EnumStudentTypeByOrderPackage.STANDARD}
                        key={EnumStudentTypeByOrderPackage.STANDARD}
                    >
                        STANDARD
                    </Option>
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , username , email'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Regular Students Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.srs_create) ? (
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
            <SendEmailModal
                visible={visibleSendEmail}
                data={values.student_info}
                toggleModal={toggleSendEmail}
            />
        </Card>
    )
}

export default RegularStudents
