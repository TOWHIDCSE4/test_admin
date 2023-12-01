/* eslint-disable jsx-a11y/control-has-associated-label */
import { useCallback, useEffect, useReducer, useState } from 'react'
import {
    Table,
    Card,
    notification,
    Popover,
    Select,
    Row,
    Col,
    Tag,
    Space
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import ReportAPI from 'api/ReportAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import SearchUser from 'components/search-user-with-lazy-load'
import TeacherAPI from 'api/TeacherAPI'
import NameTeacherStudent from 'components/name-teacher-student'
import AdministratorAPI from 'api/AdministratorAPI'
import { DEPARTMENT } from 'const/department'

const ListTeachers = ({ ...props }) => {
    const [staffs, setStaffs] = useState([])
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            teachers: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: 'active',
            search: '',
            staff_id: ''
        }
    )

    const getAllTeachers = useCallback(
        ({ page_size, page_number, status, search, staff_id }) => {
            setValues({ isLoading: true })
            ReportAPI.getListTeacherForReport({
                page_size,
                page_number,
                status,
                search,
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
            getAllTeachers({ ...values })
        })
        fetchAdminOptions('', DEPARTMENT.hocthuat.id)
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            getAllTeachers({
                page_number: pageNumber,
                page_size: pageSize,
                status: values.status,
                staff_id: values.staff_id
            })
        },
        [values]
    )

    const handlerStatusFilter = useCallback(
        (v) => {
            setValues({ status: v })
            getAllTeachers({
                ...values,
                page_number: values.page_number,
                page_size: values.page_size,
                status: v,
                staff_id: values.staff_id
            })
        },
        [values]
    )

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
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text, record: ITeacher, index) => index + 1
        },
        {
            title: 'Mã GV',
            dataIndex: 'user_id',
            key: 'user_id',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Tên GV',
            dataIndex: 'first_name',
            key: 'first_name',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: ITeacher) => (
                <NameTeacherStudent
                    data={record?.user_info}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Quản lý',
            dataIndex: ['staff', 'fullname'],
            key: 'staff',
            width: 150,
            align: 'center',
            render: (text, record: ITeacher) => text && <p>{text}</p>
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 150,
            align: 'center',
            render: (text, record: ITeacher) =>
                text && moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'General information',
            children: [
                {
                    title: 'Skype',
                    dataIndex: 'user_info',
                    key: 'user_info',
                    width: 120,
                    align: 'center',
                    render: (text, record: ITeacher) =>
                        record.user_info?.skype_account
                },
                {
                    title: 'SĐT',
                    dataIndex: 'user_info',
                    key: 'user_info',
                    width: 120,
                    align: 'center',
                    render: (text, record: ITeacher) =>
                        record.user_info?.phone_number
                },
                {
                    title: 'Email',
                    dataIndex: 'user_info',
                    key: 'user_info',
                    width: 120,
                    align: 'center',
                    render: (text, record: ITeacher) => record.user_info?.email
                },
                {
                    title: 'Tài khoản NH',
                    dataIndex: 'user_info',
                    key: 'user_info',
                    width: 150,
                    align: 'center',
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
                    title: 'Lương',
                    dataIndex: 'hourly_rate',
                    key: 'hourly_rate',
                    align: 'center',
                    width: 120,
                    render: (text, record) =>
                        text && `${text} ${record?.location?.currency}`
                },
                {
                    title: 'Bằng ĐH/Cao đẳng',
                    dataIndex: 'degree',
                    key: 'degree',
                    align: 'center',
                    width: 100,
                    render: (text) =>
                        text && (
                            <a href={text} target='_blank' rel='noreferrer'>
                                <CheckOutlined
                                    style={{
                                        color: 'green',
                                        fontSize: 18
                                    }}
                                />
                            </a>
                        )
                },
                {
                    title: 'Chứng chỉ giảng dạy',
                    dataIndex: 'age',
                    key: 'age',
                    width: 120,
                    align: 'center',
                    render: (val, record: ITeacher) => (
                        <Space>
                            {record?.teaching_certificate?.tesol ? (
                                <a
                                    href={record?.teaching_certificate.tesol}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    TESOL
                                </a>
                            ) : null}
                            {record?.teaching_certificate?.tefl ? (
                                <a
                                    href={record?.teaching_certificate.tefl}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    TEFL
                                </a>
                            ) : null}
                        </Space>
                    )
                },
                {
                    title: 'Chứng chỉ tiếng anh',
                    dataIndex: 'age',
                    key: 'age',
                    width: 120,
                    align: 'center',
                    render: (val, record: ITeacher) => (
                        <Space>
                            {record?.english_certificate?.ielts ? (
                                <a
                                    href={record.english_certificate.ielts}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    IELTS
                                </a>
                            ) : null}
                            {record?.english_certificate?.toeic ? (
                                <a
                                    href={record.english_certificate.toeic}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    TOEIC
                                </a>
                            ) : null}
                        </Space>
                    )
                },
                {
                    title: 'Video giới thiệu',
                    dataIndex: 'intro_video',
                    key: 'intro_video',
                    align: 'center',
                    width: 100,
                    render: (text) =>
                        text && (
                            <a href={text} target='_blank' rel='noreferrer'>
                                <CheckOutlined
                                    style={{
                                        color: 'green',
                                        fontSize: 18
                                    }}
                                />
                            </a>
                        )
                },
                {
                    title: 'CV',
                    dataIndex: 'cv',
                    key: 'cv',
                    align: 'center',
                    width: 100,
                    render: (text) =>
                        text && (
                            <a href={text} target='_blank' rel='noreferrer'>
                                <CheckOutlined
                                    style={{
                                        color: 'green',
                                        fontSize: 18
                                    }}
                                />
                            </a>
                        )
                }
            ]
        },
        {
            title: 'Thâm niên (Tháng)',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 100,
            align: 'center',
            render: (text, record: ITeacher) =>
                text && _.toInteger(moment().diff(moment(text), 'months', true))
        },
        {
            title: 'Tổng số lớp học',
            dataIndex: 'total_lesson',
            key: 'total_lesson',
            width: 100,
            align: 'center',
            render: (text, record: ITeacher) => text
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
            width: 150,
            render: (text, record: ITeacher) => (
                <Tag color='#108ee9'>{record?.level.name}</Tag>
            )
        },
        {
            title: 'Giáo viên',
            dataIndex: 'location',
            key: 'location',
            width: 120,
            align: 'center',
            render: (text, record: ITeacher) => record.location?.name
        },
        {
            title: 'Trial pool',
            dataIndex: 'trial_teacher',
            key: 'trial_teacher',
            align: 'center',
            width: 100,
            render: (text) =>
                text && (
                    <CheckOutlined
                        style={{
                            color: 'green',
                            fontSize: 18
                        }}
                    />
                )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'user',
            key: 'user',
            align: 'center',
            width: 100,
            render: (text) =>
                text && text?.is_active ? (
                    <Tag color='success'>Active</Tag>
                ) : (
                    <Tag color='error'>Off</Tag>
                )
        }
    ]

    const searchDataUser = (data) => {
        if (data.selected) {
            const searchText =
                data.selected.user.username || data.selected.user.full_name
            let status = 'active'
            if (!data.selected?.user?.is_active) {
                status = 'off'
            }
            setValues({
                search: searchText,
                page_number: 1,
                total: 1,
                status
            })
            getAllTeachers({
                ...values,
                search: searchText,
                page_number: 1,
                total: 1,
                status,
                staff_id: values.staff_id
            })
        }
        if (data.clear) {
            setValues({ page_number: 1, search: '', status: 'active' })
            getAllTeachers({
                ...values,
                page_number: 1,
                search: '',
                status: 'active',
                staff_id: values.staff_id
            })
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Choose Teacher',
            engine: (
                <SearchUser
                    api={TeacherAPI.getAllTeachers}
                    placeholder='Search by teacher'
                    searchDataUser={searchDataUser}
                ></SearchUser>
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
            label: 'Status',
            engine: (
                <Select
                    placeholder='Status'
                    style={{ width: '100%' }}
                    allowClear
                    value={values.status}
                    onChange={handlerStatusFilter}
                >
                    <Select.Option value=''>ALL</Select.Option>
                    <Select.Option value='active'>ACTIVE</Select.Option>
                    <Select.Option value='off'>OFF</Select.Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='BÁO CÁO DANH SÁCH GIÁO VIÊN'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.teachers}
                columns={columns}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
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
        </Card>
    )
}

export default ListTeachers
