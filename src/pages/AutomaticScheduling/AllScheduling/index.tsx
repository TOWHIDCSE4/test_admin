import { useEffect, useReducer, useCallback, FunctionComponent } from 'react'
import {
    Table,
    Card,
    notification,
    Space,
    Modal,
    Input,
    Select,
    Row,
    Col,
    Form,
    Tag
} from 'antd'
import AutomaticSchedulingAPI from 'api/AutomaticSchedulingAPI'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    CopyOutlined,
    SearchOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import { EnumRegularCalendarStatus } from 'types'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import EditSchedulingModal from './edit-scheduling-modal'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search } = Input
const { Option } = Select

const AllScheduling: FunctionComponent = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            automatic_scheduling: [],
            isLoading: false,
            isShownEditModal: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            selected_item: {},
            teacher_name: '',
            course_name: '',
            student_name: '',
            status: ''
        }
    )

    const getAllScheduling = (query: {
        page_size?: number
        page_number?: number
        teacher_name?: string
        student_name?: string
        course_name?: string
        status?: number
    }) => {
        setValues({ isLoading: true })
        AutomaticSchedulingAPI.getAutomaticScheduling(query)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ automatic_scheduling: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removeScheduling = (id: number, data: any) => {
        setValues({ isLoading: true })
        AutomaticSchedulingAPI.removeRegularCalendar(id, data)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllScheduling({ ...values })
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
        getAllScheduling({
            page_size: values.page_size,
            page_number: values.page_number
        })
    }, [])

    const toggleEdit = useCallback((value: boolean) => {
        setValues({ isShownEditModal: value })
    }, [])

    const onEdit = (item) => {
        setValues({ selected_item: item })
        toggleEdit(true)
    }

    const onCloseEdit = useCallback(
        (should?: boolean) => {
            toggleEdit(false)
            if (should) {
                getAllScheduling({
                    page_size: values.page_size,
                    page_number: values.page_number,
                    teacher_name: values.teacher_name,
                    student_name: values.student_name,
                    course_name: values.course_name,
                    status: values.status
                })
            }
        },
        [values]
    )

    const onRemove = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeScheduling(item.id, item)
            }
        })
    }

    const onCopyScheduling = (item) => {
        window.open(`/automatic-scheduling/create?autoSchedulingId=${item.id}`)
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        const temp = {
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        }
        setValues(temp)
        getAllScheduling(temp)
    }

    const onSearchStudent = (v) => {
        const temp = {
            ...values,
            student_name: v
        }
        setValues(temp)
        getAllScheduling(temp)
    }
    const onSearchTeacher = (v) => {
        const temp = {
            ...values,
            teacher_name: v
        }
        setValues(temp)
        getAllScheduling(temp)
    }
    const onSearchCourse = (v) => {
        const temp = {
            ...values,
            course_name: v
        }
        setValues(temp)
        getAllScheduling(temp)
    }
    const onChangeStatus = (val) => {
        const temp = {
            ...values,
            page_number: 1,
            status: val
        }
        setValues(temp)
        getAllScheduling(temp)
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            render: (text, record) => text && text.name
        },
        {
            title: 'Regular Time',
            dataIndex: 'regular_start_time',
            key: 'regular_start_time',
            render: (text, record) => {
                const convertToLocal = getTimestampInWeekToLocal(text)
                return formatTimestamp(convertToLocal)
            }
        },
        {
            title: 'Package',
            dataIndex: 'ordered_package',
            key: 'ordered_package',
            render: (text, record) => text && text.package_name
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if (text === EnumRegularCalendarStatus.ACTIVE) {
                    return (
                        <Tag color='#52c41a'>
                            {_.get(EnumRegularCalendarStatus, text)}
                        </Tag>
                    )
                }
                if (text === EnumRegularCalendarStatus.EXPIRED) {
                    return (
                        <Tag color='#ff4d4f'>
                            {_.get(EnumRegularCalendarStatus, text)}
                        </Tag>
                    )
                }
                if (text === EnumRegularCalendarStatus.FINISHED) {
                    return (
                        <Tag color='#40a9ff'>
                            {_.get(EnumRegularCalendarStatus, text)}
                        </Tag>
                    )
                }
            }
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (text, record) =>
                text && moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.asasm_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.asasm_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                        />
                    )}
                </Space>
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
                    <Option value='' key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(EnumRegularCalendarStatus)
                        .filter(
                            (key: any) =>
                                !isNaN(Number(EnumRegularCalendarStatus[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={EnumRegularCalendarStatus[key]}
                                key={EnumRegularCalendarStatus[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Search Teacher',
            engine: (
                <Search
                    placeholder='By name , username'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchTeacher, 250)}
                />
            )
        },
        {
            label: 'Search Student',
            engine: (
                <Search
                    placeholder='By name , username'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchStudent, 250)}
                />
            )
        },
        {
            label: 'Search Course',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchCourse, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Automatic Scheduling Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                dataSource={values.automatic_scheduling}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record.id}
                loading={values.isLoading}
            />
            <EditSchedulingModal
                visible={values.isShownEditModal}
                toggleModal={onCloseEdit}
                automaticScheduling={values.selected_item}
            />
        </Card>
    )
}

export default AllScheduling
