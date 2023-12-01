import {
    useEffect,
    useReducer,
    FunctionComponent,
    useCallback,
    useState
} from 'react'
import { useLocation } from 'react-router'
import queryString from 'query-string'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import StudentAPI from 'api/StudentAPI'
import OrderAPI from 'api/OrderAPI'
import PackageAPI from 'api/PackageAPI'
import CourseAPI from 'api/CourseAPI'
import UnitAPI from 'api/UnitAPI'
import TeacherAPI from 'api/TeacherAPI'
import BookingAPI from 'api/BookingAPI'
import AutomaticSchedulingAPI from 'api/AutomaticSchedulingAPI'
import {
    getTimestampInWeekToLocal,
    getTimestampInWeekToUTC,
    formatTimestamp
} from 'utils/datetime'
import {
    Button,
    Table,
    Card,
    Tag,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    Alert,
    Spin
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import moment from 'moment'
import { useForm } from 'antd/lib/form/Form'
import { ENUM_BOOKING_STATUS, ORDER_STATUS } from 'const/status'
import { EnumOrderType } from 'const'
import { ColumnsType } from 'antd/lib/table'
import { IRegularCalendar } from 'types'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NameTeacherStudent from 'components/name-teacher-student'

const { Search, TextArea } = Input
const { Option } = Select

const CreateScheduling: FunctionComponent = () => {
    const location = useLocation()

    const [form] = useForm()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isSearching: false,
            q: '',
            students: [],
            studentPackages: [],
            courses: [],
            units: [],
            tempTeachers: [],
            teachers: [],
            regularTimes: [],
            booking_latest: [],
            page_size: 10,
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                package: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                course: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                unit: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            }
        }
    )

    const [regularCalendars, setRegularCalendars] = useState<
        IRegularCalendar[]
    >([])
    const [packageInfo, setPackageInfo] = useState(null)

    const getPackageInfo = async (id) => {
        try {
            const res = await PackageAPI.getPackageInfo(id)
            if (res) {
                setPackageInfo(res)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getAutomaticScheduleByStudent = useCallback(
        (query: {
            student_id: number
            page_size?: number
            page_number?: number
        }) => {
            AutomaticSchedulingAPI.getAutomaticScheduling({
                page_number: query.page_number,
                page_size: query.page_size,
                student_id: query.student_id
            })
                .then((res) => {
                    if (query.page_number > 1) {
                        setRegularCalendars([...regularCalendars, ...res.data])
                    } else {
                        setRegularCalendars(res.data)
                    }
                    if (
                        query.page_number * query.page_size <
                        res.pagination.total
                    ) {
                        return getAutomaticScheduleByStudent({
                            ...query,
                            page_number: query.page_number + 1
                        })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [regularCalendars]
    )

    const getRegularStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
            setValues({ isSearching: true })
            StudentAPI.getRegularStudents({
                status: 'active',
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    filter.student.total = res.pagination.total
                    let newStudents = [...res.data]
                    if (query.page_number > 1) {
                        newStudents = [...students, ...res.data]
                    }
                    setValues({
                        students: newStudents,
                        filter
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isSearching: false }))
        },
        [values]
    )

    const getOrderedPackagesByStudentId = useCallback(
        (query: {
            student_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, studentPackages } = values
            setValues({ isLoading: true })
            OrderAPI.getOrderedPackagesByUserId(query.student_id, {
                ...query,
                status: ORDER_STATUS.PAID,
                type: [EnumOrderType.PREMIUM],
                active: true
            })
                .then((res) => {
                    filter.package.total = res.pagination.total
                    let newPackages = [...res.data]
                    if (query.page_number > 1) {
                        newPackages = [...studentPackages, ...res.data]
                    }
                    setValues({
                        studentPackages: newPackages,
                        filter
                    })
                    if (_.isEmpty(res.data))
                        notification.error({
                            message: 'Error',
                            description:
                                "Student has no PREMIUM package active. Can't update anything"
                        })
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

    const getBookingLatestByStudentId = ({
        student_id,
        sort = 'prev',
        page_size = 10
    }) => {
        BookingAPI.getAllBookings({ student_id, page_size, sort })
            .then((res) => {
                setValues({ booking_latest: res.data })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getCoursesByPackageId = useCallback(
        (query: {
            package_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, courses } = values
            setValues({ isLoading: true })
            CourseAPI.getCourseByPackageId(query.package_id, query)
                .then((res) => {
                    filter.course.total = res.pagination.total
                    let newCourses = [...res.data]
                    if (query.page_number > 1) {
                        newCourses = [...courses, ...res.data]
                    }
                    setValues({
                        courses: newCourses,
                        filter
                    })
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

    const getUnitsByCourseId = useCallback(
        (query: {
            course_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, units } = values
            setValues({ isLoading: true })
            UnitAPI.getUnitsByCourseId(query.course_id, query)
                .then((res) => {
                    filter.unit.total = res.pagination.total
                    let newUnits = [...res.data]
                    if (query.page_number > 1) {
                        newUnits = [...units, ...res.data]
                    }
                    setValues({ units: newUnits, filter })
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

    const getTeachersWithRegularTime = ({ regular_time }) => {
        const regularTimeUTC = getTimestampInWeekToUTC(regular_time)
        const query = {
            regular_time: regularTimeUTC,
            page_number: 1,
            page_size: 500
        } as any
        if (packageInfo) {
            query.location_id = packageInfo?.location_id
        }
        TeacherAPI.getTeachersWithRegularTime(query)
            .then((res) => {
                setValues({ teachers: res.data, tempTeachers: res.data })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getStudentById = (student_id: number) => {
        const { filter } = values
        UserAPI.getUserById(student_id)
            .then((res) => {
                const regularTimesLocal = _.clone(res.regular_times).map((t) =>
                    getTimestampInWeekToLocal(t)
                )
                setValues({
                    students: [res],
                    regularTimes: regularTimesLocal
                })
                filter.package.page_number = 1
                getOrderedPackagesByStudentId({
                    student_id,
                    page_number: filter.package.page_number,
                    page_size: values.page_size
                })
                getBookingLatestByStudentId({ student_id })
                setValues({ filter })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAutomaticSchedulingById = (id: number) => {
        AutomaticSchedulingAPI.getAutomaticSchedulingById(id)
            .then((res: any) => {
                setValues({
                    students: [res.student],
                    courses: [res.course],
                    teachers: [res.teacher]
                })
                const regularTimeLocal = getTimestampInWeekToLocal(
                    res.regular_start_time
                )
                form.setFieldsValue({
                    student_id: res.student_id,
                    course_id: res.course_id,
                    package_id: res.course.package_id,
                    teacher_id: res.teacher_id,
                    regular_time: regularTimeLocal
                })
                return getStudentById(res.student_id)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getLatestAutomaticSchedulingByStudentId = (student_id: number) => {
        AutomaticSchedulingAPI.getLatestAutomaticScheduling({ student_id })
            .then((res) => {
                if (res) {
                    setValues({
                        students: [res.student],
                        courses: [res.course],
                        teachers: [res.teacher]
                    })
                    const regularTimeLocal = getTimestampInWeekToLocal(
                        res.regular_start_time
                    )
                    form.setFieldsValue({
                        student_id: res.student_id,
                        course_id: res.course_id,
                        package_id: res.course.package_id,
                        teacher_id: res.teacher_id,
                        regular_time: regularTimeLocal
                    })
                } else {
                    form.setFieldsValue({
                        student_id
                    })
                    notification.warning({
                        message: 'Warning',
                        description: 'Student has no previous regular calendar'
                    })
                }
                return getStudentById(student_id)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    useEffect(() => {
        const parsed: any = queryString.parse(location.search)
        if (_.has(parsed, 'autoSchedulingId')) {
            getAutomaticSchedulingById(_.get(parsed, 'autoSchedulingId'))
        } else if (_.has(parsed, 'studentId')) {
            getLatestAutomaticSchedulingByStudentId(
                _.toInteger(_.get(parsed, 'studentId'))
            )
        } else {
            getRegularStudents({
                page_number: values.filter.student.page_number,
                page_size: values.page_size
            })
        }
    }, [location.search])

    const onValuesChange = useCallback(
        (changedValues, allValues) => {
            if (!_.isEmpty(changedValues)) {
                if (
                    _.has(changedValues, 'student_id') &&
                    _.get(changedValues, 'student_id')
                ) {
                    setValues({
                        courses: [],
                        units: [],
                        regularTimes: [],
                        teachers: []
                    })
                    form.resetFields([
                        'ordered_package_id',
                        'course_id',
                        'unit_id',
                        'regular_time',
                        'teacher_id'
                    ])
                    getOrderedPackagesByStudentId({
                        student_id: _.get(changedValues, 'student_id'),
                        page_number: 1,
                        page_size: values.page_size
                    })
                    getBookingLatestByStudentId({
                        student_id: _.get(changedValues, 'student_id')
                    })
                    const student = _.find(
                        values.students,
                        (o) =>
                            o.id.toString() ===
                            _.get(changedValues, 'student_id').toString()
                    )
                    if (student) {
                        const regularTimesLocal = _.clone(
                            student.regular_times
                        ).map((t) => getTimestampInWeekToLocal(t))
                        setValues({ regularTimes: regularTimesLocal })
                    }
                    getAutomaticScheduleByStudent({
                        student_id: _.get(changedValues, 'student_id'),
                        page_size: 50,
                        page_number: 1
                    })
                }
                if (_.has(changedValues, 'ordered_package_id')) {
                    const pack = values.studentPackages.filter(
                        (p) =>
                            p.id === _.get(changedValues, 'ordered_package_id')
                    )
                    if (pack[0]) {
                        setValues({
                            courses: [],
                            units: [],
                            teachers: [],
                            tempTeachers: []
                        })
                        form.resetFields([
                            'course_id',
                            'unit_id',
                            'regular_time',
                            'teacher_id'
                        ])
                        getCoursesByPackageId({
                            package_id: pack[0].package_id,
                            page_number: 1,
                            page_size: values.page_size
                        })
                        getPackageInfo(pack[0].package_id)
                    }
                }
                if (_.has(changedValues, 'course_id')) {
                    setValues({ units: [] })
                    getUnitsByCourseId({
                        course_id: _.get(changedValues, 'course_id'),
                        page_number: 1,
                        page_size: values.page_size
                    })
                    form.setFieldsValue({ unit_id: null })
                }
                if (_.has(changedValues, 'regular_time')) {
                    setValues({ teachers: [], tempTeachers: [] })
                    getTeachersWithRegularTime({
                        regular_time: _.get(changedValues, 'regular_time')
                    })
                    form.setFieldsValue({ teacher_id: null })
                }
            }
        },
        [form, values]
    )

    const loadMore = (key) => (event) => {
        const { target } = event
        if (
            !values.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { filter, page_size } = values
            if (filter[key].total > page_size * filter[key].page_number) {
                filter[key].page_number += 1
                setValues({ filter })
                switch (key) {
                    case 'student':
                        getRegularStudents({
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'package':
                        getOrderedPackagesByStudentId({
                            student_id: form.getFieldValue('student_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'course': {
                        const pack = values.studentPackages.filter(
                            (p) =>
                                p.id ===
                                form.getFieldValue('ordered_package_id')
                        )
                        if (pack[0]) {
                            getCoursesByPackageId({
                                package_id: pack[0].package_id,
                                page_number: filter[key].page_number,
                                search: filter[key].search,
                                page_size
                            })
                        }

                        break
                    }
                    case 'unit':
                        getUnitsByCourseId({
                            course_id: form.getFieldValue('course_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    default:
                        break
                }
            }
        }
    }

    const onSearch = (key) => (value: string) => {
        const { filter, page_size } = values
        filter[key].search = value
        switch (key) {
            case 'student':
                filter[key].page_number = 1
                getRegularStudents({
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'package':
                filter[key].page_number = 1
                getOrderedPackagesByStudentId({
                    student_id: form.getFieldValue('student_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'course':
                filter[key].page_number = 1
                getCoursesByPackageId({
                    package_id: form.getFieldValue('package_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'unit':
                filter[key].page_number = 1
                getUnitsByCourseId({
                    course_id: form.getFieldValue('course_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            default:
                break
        }
        setValues({ filter })
    }

    const saveAutoScheduling = (valuesForm) => {
        setValues({ isLoading: true })
        AutomaticSchedulingAPI.createRegularCalendar({
            ...valuesForm,
            regular_start_time: getTimestampInWeekToUTC(valuesForm.regular_time)
        })
            .then((res) => {
                setValues({ isLoading: false })
                notification.success({
                    message: 'Success',
                    description: 'Created successfully'
                })
                form.resetFields(['teacher_id', 'regular_time'])
                return getAutomaticScheduleByStudent({
                    student_id: form.getFieldValue('student_id'),
                    page_size: 50,
                    page_number: 1
                })
            })
            .catch((err) => {
                setValues({ isLoading: false })
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            if (key === 'regularTimes') {
                const unMatchRegular = values[key].filter(
                    (v) =>
                        !regularCalendars
                            .filter((e) => e.status === 1)
                            .map((r) => r.regular_start_time)
                            .includes(getTimestampInWeekToUTC(v))
                )
                return unMatchRegular.map((item, index) => (
                    <Option key={index} value={item}>
                        {formatTimestamp(item)}
                    </Option>
                ))
            }
            return values[key].map((item, index) => {
                if (key === 'teachers') {
                    return (
                        <Option key={index} value={item.user_id || item.id}>
                            {item.user
                                ? `${item?.user?.full_name} - ${item?.user?.username}`
                                : `${item.full_name} - ${item.username}`}
                        </Option>
                    )
                }
                return (
                    <Option key={index} value={item.id}>
                        {item.package_name ||
                            item.name ||
                            `${item.full_name} - ${item.username}`}
                    </Option>
                )
            })
        }
    }

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center'
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 200,
            align: 'center',
            render: (text, record: any) => (
                <>
                    <Tag color='#108ee9'>
                        {record &&
                            moment(record?.calendar?.start_time).format(
                                'dddd HH:mm DD/MM/YYYY'
                            )}
                    </Tag>
                    <NameTeacherStudent
                        data={text}
                        type='teacher'
                    ></NameTeacherStudent>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (text, record: any) => {
                return <>{ENUM_BOOKING_STATUS[text]}</>
            }
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 300,
            render: (text, record: any) => (
                <>
                    <p>
                        <b>Course: </b>
                        {record && record?.course?.name}
                    </p>
                    <p>
                        <b>Unit: </b>
                        {text && text?.name}
                    </p>
                </>
            )
        },
        {
            title: 'Document',
            dataIndex: 'document',
            key: 'document',
            width: 150,
            align: 'center'
        }
    ]

    const columnsPackage: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id2',
            width: 80,
            align: 'center'
        },
        {
            title: 'Name',
            dataIndex: 'package_name',
            key: 'package_name',
            width: 150,
            align: 'center'
        },
        {
            title: 'Number class',
            dataIndex: 'number_class',
            key: 'number_class',
            width: 100,
            align: 'center'
        },
        {
            title: 'Day of use',
            dataIndex: 'day_of_use',
            key: 'day_of_use',
            width: 100,
            align: 'center'
        }
    ]

    const columnsRegularCalendar: ColumnsType = [
        {
            title: `No`,
            dataIndex: 'index',
            key: 'index',
            width: 70,
            render: (text, record, index) => index + 1
        },
        {
            title: `Teacher`,
            dataIndex: 'teacher',
            key: 'teacher2',
            width: 200,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 250,
            render: (text, record) => text && text.name
        },
        {
            title: `Regular time`,
            dataIndex: 'regular_start_time',
            key: 'regular_start_time',
            width: 200,
            fixed: 'right',
            render: (text, record) => {
                const convertToLocal = getTimestampInWeekToLocal(text)
                return formatTimestamp(convertToLocal)
            }
        }
    ]

    const selectedStudent = _.find(
        values.students,
        (o) => o.id === form.getFieldValue('student_id')
    )

    const find = (items, text) => {
        text = text.split(' ')
        return items.filter((item) => {
            return text.every((el) => {
                const full_name = item.user.full_name.toLowerCase()
                return full_name.includes(el.toLowerCase())
            })
        })
    }
    const searchTeacher = (val) => {
        const item = find(values.tempTeachers, val)
        setValues({
            teachers: item
        })
    }
    return (
        <Row gutter={32}>
            <Col xs={24} xl={12}>
                <Card title='Create Automatic Scheduling'>
                    <Form
                        name='Automatic Scheduling Form'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                        onValuesChange={onValuesChange}
                        onFinish={saveAutoScheduling}
                    >
                        <Form.Item
                            label='Choose student'
                            name='student_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select student!'
                                }
                            ]}
                        >
                            <Select
                                placeholder='Choose student'
                                showSearch
                                filterOption={false}
                                loading={values.isLoading}
                                onPopupScroll={loadMore('student')}
                                onSearch={_.debounce(onSearch('student'), 300)}
                            >
                                {renderSelect('students')}
                                {values.isLoading && (
                                    <Option key='loading_student' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose package'
                            name='ordered_package_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select you package!'
                                }
                            ]}
                        >
                            <Select
                                placeholder='Choose package'
                                showSearch
                                filterOption={false}
                                loading={values.isLoading}
                                onPopupScroll={loadMore('package')}
                                onSearch={_.debounce(onSearch('package'), 300)}
                            >
                                {renderSelect('studentPackages')}
                                {values.isLoading && (
                                    <Option key='loading_package' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose course'
                            name='course_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select course_id!'
                                }
                            ]}
                        >
                            <Select
                                placeholder='Choose course'
                                showSearch
                                autoClearSearchValue
                                filterOption={false}
                                loading={values.isLoading}
                                onPopupScroll={loadMore('course')}
                                onSearch={_.debounce(onSearch('course'), 300)}
                            >
                                {renderSelect('courses')}
                                {values.isLoading && (
                                    <Option key='loading_course' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item label='Choose unit' name='unit_id'>
                            <Select
                                placeholder='Choose unit'
                                showSearch
                                allowClear
                                filterOption={false}
                                loading={values.isLoading}
                                onPopupScroll={loadMore('unit')}
                                onSearch={_.debounce(onSearch('unit'), 300)}
                            >
                                {renderSelect('units')}
                                {values.isLoading && (
                                    <Option key='loading_unit' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose time'
                            name='regular_time'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select regular_time!'
                                }
                            ]}
                        >
                            <Select placeholder='Choose time'>
                                {renderSelect('regularTimes')}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose teacher'
                            name='teacher_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select teacher_id!'
                                }
                            ]}
                        >
                            <Select
                                placeholder='Choose teacher'
                                showSearch
                                filterOption={false}
                                onSearch={searchTeacher}
                            >
                                {renderSelect('teachers')}
                            </Select>
                        </Form.Item>
                        <Form.Item label='Note' name='note'>
                            <TextArea rows={4} placeholder='Enter note' />
                        </Form.Item>
                        {checkPermission(PERMISSIONS.ascas_create) && (
                            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    loading={values.isLoading}
                                >
                                    Save
                                </Button>
                            </Form.Item>
                        )}
                        <Alert
                            message={<b>Notes:</b>}
                            description={
                                <>
                                    <p>
                                        Hệ thống sẽ gửi lịch học cho bạn qua
                                        Email và SMS.
                                    </p>
                                    <p>
                                        Bạn cũng có thể xem lịch học của mình
                                        tại trang cá nhân trên iSpeak.vn
                                    </p>
                                </>
                            }
                            type='info'
                            showIcon
                        />
                    </Form>
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Table
                    dataSource={values.studentPackages}
                    columns={columnsPackage}
                    bordered
                    pagination={false}
                    title={() => (
                        <b>
                            Student's current packages:
                            {selectedStudent ? selectedStudent.full_name : ''}
                        </b>
                    )}
                    scroll={{
                        x: 500,
                        y: 500
                    }}
                    className='mb-3'
                />
                <Table
                    dataSource={regularCalendars}
                    columns={columnsRegularCalendar}
                    bordered
                    pagination={false}
                    title={() => <b>Student's regular calendar</b>}
                    scroll={{
                        x: 500,
                        y: 300
                    }}
                    className='mb-3'
                />
                <Table
                    dataSource={values.booking_latest}
                    columns={columns}
                    pagination={false}
                    scroll={{
                        x: 500,
                        y: 500
                    }}
                    bordered
                    title={() => <b>10 lessons latest</b>}
                />
            </Col>
        </Row>
    )
}

export default CreateScheduling
