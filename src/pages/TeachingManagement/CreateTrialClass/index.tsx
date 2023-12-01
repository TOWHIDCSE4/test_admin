import { useEffect, useReducer, FC, useCallback, useState } from 'react'
import _ from 'lodash'
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
    Table
} from 'antd'
import moment from 'moment'
import { useForm } from 'antd/lib/form/Form'
import { DEFAULT_TRIAL_COURSE_ID, EnumOrderType, FULL_DATE_FORMAT } from 'const'
import UnitAPI from 'api/UnitAPI'
import { ColumnsType } from 'antd/lib/table'
import { IOrderedPackage } from 'types'
import CourseAPI from 'api/CourseAPI'
import PackageAPI from 'api/PackageAPI'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { TextArea } = Input
const { Option } = Select

const CreateTrialClass: FC = () => {
    const [form] = useForm()

    const [packageInfo, setPackageInfo] = useState(null)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isSearching: false,
            q: '',
            students: [],
            studentPackages: [],
            teachers: [],
            courses: [],
            units: [],
            page_size: 10,
            package_id: '',
            test_levels: [],
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                course: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                package: {
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

    const getCoursesBySearch = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        const { filter, courses } = values

        setValues({ isSearching: true })

        CourseAPI.getCourses(query)
            .then((res) => {
                let newCourses = [...res.data]
                if (query.page_number > 1) {
                    newCourses = [...courses, ...res.data]
                }
                setValues({
                    courses: newCourses,
                    filter
                })
                // if (res.pagination && res.pagination.total > 0) {
                //     setFilterCourse({
                //         total: res.pagination.total
                //     })
                // }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isSearching: false }))
    }

    const getPackagesByStudentId = useCallback(
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
                type: [EnumOrderType.TRIAL]
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
                                'Student has no TRIAL package active. Can not create anything'
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

    const getTrialTeachersWithStartTime = ({ start_time }) => {
        if (start_time) {
            const startTime = moment(start_time)
                .set('s', 0)
                .set('millisecond', 0)
                .valueOf()
            const query = {
                start_time: startTime
            } as any
            if (packageInfo) {
                query.location_id = packageInfo?.location_id
            }
            TeacherAPI.getTrialTeachers(query)
                .then((res) => {
                    setValues({ teachers: res.data })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        }
    }

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

    const getCourseByPackageId = useCallback(
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
                    let newCouse = [...res.data]
                    if (query.page_number > 1) {
                        newCouse = [...courses, ...res.data]
                    }
                    setValues({
                        courses: newCouse,
                        filter,
                        package_id: query.package_id
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

    const getAllTestTopics = useCallback(() => {
        const test_levels = [
            {
                title: 'KINDERGARTEN',
                value: 1
            },
            {
                title: 'KIDS',
                value: 2
            },
            {
                title: 'TEENS',
                value: 3
            },
            {
                title: 'ADULT',
                value: 4
            }
        ]
        setValues({ test_levels })
    }, [values])

    useEffect(() => {
        getAllStudents({
            page_number: values.filter.student.page_number,
            page_size: values.page_size
        })

        getAllTestTopics()
    }, [])

    const onValuesChange = useCallback(
        async (changedValues, allValues) => {
            if (!_.isEmpty(changedValues)) {
                if (_.has(changedValues, 'student_id')) {
                    setValues({
                        studentPackages: [],
                        courses: [],
                        units: [],
                        teachers: []
                    })
                    form.resetFields([
                        'ordered_package_id',
                        'course',
                        'unit_id',
                        'start_time',
                        'teacher_id'
                    ])
                    getPackagesByStudentId({
                        student_id: _.get(changedValues, 'student_id'),
                        page_number: 1,
                        page_size: values.page_size
                    })
                }
                if (_.has(changedValues, 'ordered_package_id')) {
                    const temp = values.studentPackages.find(
                        (e) =>
                            Number(e.id) ===
                            Number(_.get(changedValues, 'ordered_package_id'))
                    )
                    if (temp) {
                        setValues({
                            courses: [],
                            units: [],
                            teachers: []
                        })
                        form.resetFields([
                            'course',
                            'unit_id',
                            'start_time',
                            'teacher_id'
                        ])
                        getCourseByPackageId({
                            package_id: temp.package_id,
                            page_number: 1,
                            page_size: values.page_size
                        })
                        getPackageInfo(temp.package_id)
                    }
                }
                if (_.has(changedValues, 'course')) {
                    const courseId = _.get(changedValues, 'course')
                    setValues({ units: [] })
                    form.setFieldsValue({ unit_id: null })
                    getUnitsByCourseId({
                        course_id: courseId,
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
                    getTrialTeachersWithStartTime({
                        start_time: time
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
                        getPackagesByStudentId({
                            student_id: form.getFieldValue('student_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'unit':
                        getUnitsByCourseId({
                            course_id: DEFAULT_TRIAL_COURSE_ID,
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'course':
                        getCourseByPackageId({
                            package_id: values.package_id,
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
                getAllStudents({
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'package':
                filter[key].page_number = 1
                getPackagesByStudentId({
                    student_id: form.getFieldValue('student_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'course':
                filter[key].page_number = 1
                getCoursesBySearch({
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'unit':
                filter[key].page_number = 1
                getUnitsByCourseId({
                    course_id: DEFAULT_TRIAL_COURSE_ID,
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

    const saveTrialClass = (valuesForm) => {
        setValues({ isLoading: true })
        BookingAPI.createTrialBooking({
            ...valuesForm,
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
                form.resetFields(['start_time', 'teacher_id', 'note'])
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
                        <Option key={index} value={item.teacher_id}>
                            {item.teacher &&
                                `${item?.teacher?.user_info?.full_name} - ${item?.teacher?.user_info?.username}`}
                        </Option>
                    )
                }
                if (key === 'courses') {
                    return (
                        <Option key={index} value={item.id}>
                            {item && `${item?.name}`}
                        </Option>
                    )
                }
                if (key === 'test_levels') {
                    return (
                        <Option key={index} value={item.value}>
                            {item && `${item?.title}`}
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

    return (
        <Row gutter={32}>
            <Col xs={24} xl={12}>
                <Card title='Create Trial Class'>
                    <Form
                        name='Trial Class Form'
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                        onValuesChange={onValuesChange}
                        onFinish={saveTrialClass}
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
                                    message: 'Please select package!'
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
                            name='course'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select course!'
                                }
                            ]}
                        >
                            <Select
                                placeholder='Choose course'
                                showSearch
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
                            <Select placeholder='Choose teacher'>
                                {renderSelect('teachers')}
                            </Select>
                        </Form.Item>
                        {/* <Form.Item
                            label='Choose test level'
                            name='test_level_id'
                        >
                            <Select
                                placeholder='Choose test level'
                                showSearch
                                allowClear
                                filterOption={false}
                                loading={values.isLoading}
                            >
                                {renderSelect('test_levels')}
                                {values.isLoading && (
                                    <Option key='loading' value=''>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item> */}
                        <Form.Item label='Note' name='note'>
                            <TextArea rows={4} placeholder='Enter note' />
                        </Form.Item>
                        {checkPermission(PERMISSIONS.tmctc_create) && (
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
            </Col>
        </Row>
    )
}

export default CreateTrialClass
