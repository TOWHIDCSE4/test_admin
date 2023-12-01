import { useEffect, useReducer, FC, useCallback, useState } from 'react'
import _, { initial } from 'lodash'
import StudentAPI from 'api/StudentAPI'
import OrderAPI from 'api/OrderAPI'
import TeacherAPI from 'api/TeacherAPI'
import BookingAPI from 'api/BookingAPI'
import {
    Button,
    Card,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    Alert,
    Spin,
    DatePicker,
    Table,
    Tag
} from 'antd'
import moment from 'moment'
import { useForm } from 'antd/lib/form/Form'
import {
    DEFAULT_TRIAL_COURSE_ID,
    ENUM_BOOKING_STATUS,
    EnumOrderType,
    FULL_DATE_FORMAT
} from 'const'
import UnitAPI from 'api/UnitAPI'
import { ColumnsType } from 'antd/lib/table'
import { IOrderedPackage } from 'types'
import CourseAPI from 'api/CourseAPI'
import PackageAPI from 'api/PackageAPI'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NameTeacherStudent from 'components/name-teacher-student'

const { TextArea } = Input
const { Option } = Select

const initialValues = {
    isLoading: false,
    isSearching: false,
    q: '',
    students: [],
    studentPackages: [],
    courses: [],
    units: [],
    teachers: [],
    page_size: 5,
    filter: {
        student: {
            total: 0,
            page_number: 1,
            search: ''
        },
        teacher: {
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
    },
    booking_latest: []
}

const CreateStandardClass: FC = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        initialValues
    )

    const [form] = useForm()

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

    const getAllStudents = useCallback(
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
                type: [EnumOrderType.STANDARD]
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
                                "Student has no STANDARD package active. Can't create anything"
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

    const getStandardTeachersWithStartTime = (query?: {
        start_time: number
        page_size?: number
        page_number?: number
        location_id?: string
        search?: string
    }) => {
        const { filter, teachers } = values

        const startTime = moment(query.start_time)
            .set('s', 0)
            .set('millisecond', 0)
            .valueOf()
        if (packageInfo) {
            query.location_id = packageInfo?.location_id
        }
        TeacherAPI.getTeachersByTime({
            ...query,
            start_time: startTime
        })
            .then((res) => {
                filter.teacher.total = res.pagination.total
                let temp = [...res.data]
                if (query.page_number > 1) {
                    temp = [...teachers, ...res.data]
                }
                setValues({ teachers: temp, filter })
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

    useEffect(() => {
        getAllStudents({
            page_number: values.filter.student.page_number,
            page_size: values.page_size
        })
        getUnitsByCourseId({
            course_id: DEFAULT_TRIAL_COURSE_ID,
            page_number: values.filter.unit.page_number,
            page_size: values.page_size
        })
    }, [])

    const onValuesChange = useCallback(
        (changedValues, allValues) => {
            if (!_.isEmpty(changedValues)) {
                if (
                    _.has(changedValues, 'student_id') &&
                    _.get(changedValues, 'student_id')
                ) {
                    setValues({
                        studentPackages: [],
                        courses: [],
                        units: [],
                        teachers: []
                    })
                    form.resetFields()
                    getOrderedPackagesByStudentId({
                        student_id: _.get(changedValues, 'student_id'),
                        page_number: 1,
                        page_size: values.page_size
                    })
                    getBookingLatestByStudentId({
                        student_id: _.get(changedValues, 'student_id')
                    })
                    form.setFieldsValue({
                        student_id: _.get(changedValues, 'student_id')
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
                            teachers: []
                        })
                        form.resetFields([
                            'course_id',
                            'unit_id',
                            'start_time',
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
                    form.setFieldsValue({ unit_id: null })
                    getUnitsByCourseId({
                        course_id: _.get(changedValues, 'course_id'),
                        page_number: 1,
                        page_size: values.page_size
                    })
                }
                if (_.has(changedValues, 'start_time')) {
                    const time = _.get(changedValues, 'start_time')
                    if (time && time.minute() !== 0 && time.minute() !== 30) {
                        time.set({ minute: 0, second: 0 })
                        form.setFieldsValue({
                            start_time: 0
                        })
                        setTimeout(() => {
                            form.setFieldsValue({
                                start_time: time
                            })
                        }, 100)
                    }
                    setValues({ teachers: [] })
                    getStandardTeachersWithStartTime({
                        start_time: time,
                        page_size: values.page_size
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
                        getAllStudents({
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
                    case 'teacher':
                        getStandardTeachersWithStartTime({
                            start_time: form.getFieldValue('start_time'),
                            page_number: filter[key].page_number,
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
                getAllStudents({
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
            case 'teacher':
                filter[key].page_number = 1

                getStandardTeachersWithStartTime({
                    start_time: form.getFieldValue('start_time'),
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

    const saveStandClass = (valuesForm) => {
        setValues({ isLoading: true })
        BookingAPI.createBooking({
            ...valuesForm,
            status: ENUM_BOOKING_STATUS.UPCOMING,
            start_time: moment(valuesForm.start_time)
                .set('s', 0)
                .set('millisecond', 0)
                .valueOf()
        })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Created successfully'
                })

                setTimeout(() => {
                    window.location.reload()
                }, 500)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                if (key === 'teachers') {
                    return (
                        <Option key={index} value={item.user_id}>
                            {item.user_info &&
                                `${item?.user_info?.full_name} - ${item?.user_info?.username}`}
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

    const disabledDate = (current) =>
        // Can not select days before today and today
        current && current <= moment().startOf('day')

    const disabledDateTime = () => ({
        disabledHours: () => _.range(0, 7).concat([23])
    })

    const selectedStudent = _.find(
        values.students,
        (o) => o.id === form.getFieldValue('student_id')
    )

    const columnsPackage: ColumnsType<IOrderedPackage> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
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
            title: 'Usage',
            dataIndex: 'number_class',
            key: 'number_class',
            width: 100,
            align: 'center',
            render: (text, record) => `${
                record.original_number_class - record.number_class
            }/
            ${record.original_number_class}`
        },
        {
            title: 'Expired date',
            dataIndex: 'expired_date',
            key: 'expired_date',
            width: 100,
            align: 'center',
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        }
    ]

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 80,
            align: 'center'
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            fixed: 'left',
            width: 200,
            align: 'center',
            render: (text, record: any) => (
                <>
                    <p>
                        {record &&
                            moment(record?.calendar?.start_time).format(
                                'HH:mm DD/MM/YYYY'
                            )}
                    </p>
                    <p>
                        <NameTeacherStudent
                            data={text}
                            type='teacher'
                        ></NameTeacherStudent>
                    </p>
                </>
            )
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

    return (
        <Row gutter={32}>
            <Col xs={24} xl={12}>
                <Card title='Create Standard Class'>
                    <Form
                        name='Standard Class Form'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                        onValuesChange={onValuesChange}
                        onFinish={saveStandClass}
                    >
                        <Form.Item
                            label='Choose student'
                            name='student_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select student_id!'
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
                                    <Option key='loading' value=''>
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
                                    <Option key='loading' value=''>
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
                                    <Option key='loading' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose unit'
                            name='unit_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select unit!'
                                }
                            ]}
                        >
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
                                    <Option key='loading' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Choose time'
                            name='start_time'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select start time!'
                                }
                            ]}
                        >
                            <DatePicker
                                format='YYYY-MM-DD HH:mm'
                                disabledDate={disabledDate}
                                disabledTime={disabledDateTime}
                                showTime={{ minuteStep: 30 }}
                            />
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
                                loading={values.isLoading}
                                onPopupScroll={loadMore('teacher')}
                                onSearch={_.debounce(onSearch('teacher'), 300)}
                            >
                                {renderSelect('teachers')}
                                {values.isLoading && (
                                    <Option key='loading' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item label='Note' name='admin_note'>
                            <TextArea rows={4} placeholder='Enter note' />
                        </Form.Item>
                        {checkPermission(PERMISSIONS.tmcsc_create) && (
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

export default CreateStandardClass
