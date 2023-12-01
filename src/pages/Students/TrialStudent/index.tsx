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
    Image,
    Form,
    Row,
    Col,
    Tag
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
import { IBooking, IStudent, IUser } from 'types'
import EditRegularModal from 'core/Atoms/Modals/EditRegularModal'
import moment from 'moment'
import { FULL_DATE_FORMAT, ENUM_BOOKING_STATUS } from 'const'
import { getColorTagByBookingStatus } from 'utils/common'
import { GENDER } from 'const/gender'
import defaultStudentAvatar from 'assets/images/common/hv.png'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search } = Input

const TrialStudents = ({ ...props }) => {
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
            search: ''
        }
    )

    const [visibleRegularModal, setVisibleRegular] = useState<boolean>(false)

    const fetchTrialStudents = ({ page_size, page_number, status, search }) => {
        setValues({ isLoading: true })
        StudentAPI.getTrialStudents({
            page_size,
            page_number,
            status,
            search,
            type: 'trial'
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
        fetchTrialStudents({
            page_number: values.page_number,
            page_size: values.page_size,
            status: values.status,
            search: values.search
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
        fetchTrialStudents({ ...values })
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        fetchTrialStudents({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        fetchTrialStudents({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        fetchTrialStudents({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status
        })
    }

    const goToAutomaticSchedule = (item) => {
        window.open(`/automatic-scheduling/create?studentId=${item.id}`)
    }

    const menuActions = (record) => (
        <Menu>
            <Menu.Item key='0' onClick={() => editStudent(record)}>
                <EditOutlined className='mr-2' />
                Edit Info
            </Menu.Item>
            <Menu.Item key='2' onClick={() => editRegular(record)}>
                <EditOutlined className='mr-2' />
                Edit regular
            </Menu.Item>
            <Menu.Item key='3' onClick={() => goToAutomaticSchedule(record)}>
                <ShoppingCartOutlined className='mr-2' />
                Automatic Schedule
            </Menu.Item>
            <Menu.Item key='4'>
                <ShoppingCartOutlined className='mr-2' />
                Deposit
            </Menu.Item>
            <Menu.Item key='5'>
                <ShoppingCartOutlined className='mr-2' />
                Deposit OpenClass
            </Menu.Item>
            <Menu.Item key='6'>
                <SendOutlined className='mr-2' />
                Send SMS
            </Menu.Item>
            <Menu.Item key='7'>
                <MailOutlined className='mr-2' />
                Send Email
            </Menu.Item>
            <Menu.Item key='8'>
                <EyeOutlined className='mr-2' />
                Admin View
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

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Avatar',
            dataIndex: 'student',
            key: 'student',
            fixed: 'left',
            width: 100,
            align: 'center',
            render: (text: IUser, record: any) => (
                <>
                    <Avatar
                        size='large'
                        src={
                            <Image
                                src={text?.avatar || defaultStudentAvatar}
                                fallback={defaultStudentAvatar}
                            />
                        }
                        icon={<UserOutlined />}
                        onError={() => true}
                    />
                    <p className='mt-2'>
                        <p>{text?.username}</p>
                    </p>
                </>
            )
        },
        {
            title: 'Info',
            dataIndex: 'student',
            key: 'student',
            fixed: true,
            width: 200,
            render: (text: IUser, record: any) => (
                <>
                    <p>
                        <b>Name: </b>
                        <NameTeacherStudent
                            data={text}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                    <p>
                        <b>Email: </b>
                        {`${text?.email}`}
                    </p>
                    <p>
                        <b>Gender: </b>
                        {`${_.get(GENDER, text?.gender)}`}
                    </p>
                    <p>
                        <b>Birthday: </b>
                        {`${
                            text?.date_of_birth &&
                            moment(text?.date_of_birth).format('DD/MM/YYYY')
                        }`}
                    </p>
                    <p>
                        <b>Phone: </b>
                        {`${text?.phone_number}`}
                    </p>
                    <p>
                        <b>Register At: </b>
                        {`${
                            text?.created_time &&
                            moment(text?.created_time).format('DD/MM/YYYY')
                        }`}
                    </p>
                </>
            )
        },
        {
            title: 'Detail',
            dataIndex: 'booking',
            key: 'booking',
            width: 200,
            render: (text: IBooking, record: any) => (
                <>
                    <Tag color='blue'>
                        {text.calendar &&
                            moment(text.calendar.start_time).format(
                                FULL_DATE_FORMAT
                            )}
                    </Tag>
                    <p>{`${text?.course && text?.course.name}`}</p>
                    <p>
                        <b>Bài học: </b>
                        {`${text?.unit && text?.unit?.name}`}
                    </p>
                    <p>
                        <b>Start level: </b>
                        {record?.student_starting_level ? (
                            <Tag color='#108ee9'>
                                {record?.student_starting_level?.name}
                            </Tag>
                        ) : (
                            'Not set'
                        )}
                    </p>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'booking',
            key: 'booking',
            width: 100,
            align: 'center',
            render: (text: IBooking, record: any) => (
                <>
                    <Tag color={getColorTagByBookingStatus(text.status)}>{`${
                        ENUM_BOOKING_STATUS[text.status]
                    }`}</Tag>
                </>
            )
        },
        {
            title: 'Note',
            dataIndex: 'booking',
            key: 'booking',
            width: 200,
            render: (text: IBooking, record: any) => (
                <>
                    <p>
                        <b>Admin note: </b>
                        {`${text?.admin_note}`}
                    </p>
                    <p>
                        <b>Note for Teacher: </b>
                        {`${text?.teacher_note}`}
                    </p>
                </>
            )
        }
        // {
        //     title: 'Action',
        //     key: 'action',
        //     width: 100,
        //     fixed: 'right',
        //     align: 'center',
        //     render: (text, record: IStudent) => (
        //         <Dropdown overlay={menuActions(record)} trigger={['click']}>
        //             <div className='ant-dropdown-link clickable'>
        //                 <EllipsisOutlined />
        //             </div>
        //         </Dropdown>
        //     )
        // }
    ]

    const filterEngines: IFilterEngine[] = [
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
        <Card title='Trialed Students Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

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
        </Card>
    )
}

export default TrialStudents
