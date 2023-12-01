import {
    useEffect,
    useReducer,
    memo,
    useCallback,
    FunctionComponent
} from 'react'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import PackageAPI from 'api/PackageAPI'
import CourseAPI from 'api/CourseAPI'
import UnitAPI from 'api/UnitAPI'
import TeacherAPI from 'api/TeacherAPI'
import AutomaticSchedulingAPI from 'api/AutomaticSchedulingAPI'
import {
    getTimestampInWeekToLocal,
    getTimestampInWeekToUTC,
    formatTimestamp
} from 'utils/datetime'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    Alert,
    Spin
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import OrderAPI from 'api/OrderAPI'
import { EnumOrderType, IModalProps } from 'const'
import { IRegularCalendar } from 'types'

const { TextArea } = Input
const { Option } = Select

interface Props extends IModalProps {
    automaticScheduling: IRegularCalendar
}
const EditScheduling: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, automaticScheduling } = props

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            students: [],
            studentPackages: [],
            courses: [],
            units: [],
            teachers: [],
            regular_times: [],
            package: null,
            filter: {
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
    const [form] = useForm()

    const getStudentById = useCallback(
        (student_id) => {
            UserAPI.getUserById(student_id)
                .then((res) => {
                    const regularTimesLocal = _.clone(res.regular_times).map(
                        (t) => getTimestampInWeekToLocal(t)
                    )
                    setValues({
                        regular_times: regularTimesLocal
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [form]
    )

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

    const getTeachersWithRegularTime = useCallback(
        ({ regular_time, location_id }) => {
            const regularTimeUTC = getTimestampInWeekToUTC(regular_time)
            const query = {
                regular_time: regularTimeUTC,
                location_id
            } as any
            if (values.package) {
                query.location_id = values.package.location_id
            }
            TeacherAPI.getTeachersWithRegularTime(query)
                .then((res) => {
                    setValues({ teachers: res.data })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [form]
    )
    const getPackageInfo = (id) => {
        PackageAPI.getPackageInfo(id)
            .then((res) => {
                setValues({ package: res })
                getTeachersWithRegularTime({
                    regular_time: automaticScheduling.regular_start_time,
                    location_id: res.location_id
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    useEffect(() => {
        if (visible && !_.isEmpty(automaticScheduling)) {
            setValues({
                courses: [automaticScheduling.course],
                units: automaticScheduling.unit
                    ? [automaticScheduling.unit]
                    : [],
                teachers: automaticScheduling.teacher
                    ? [
                          {
                              ...automaticScheduling.teacher,
                              user_id: automaticScheduling.teacher.id
                          }
                      ]
                    : [],
                studentPackages: [automaticScheduling.ordered_package]
            })
            getStudentById(automaticScheduling.student_id)
            getPackagesByStudentId({
                student_id: automaticScheduling.student_id
            })
            getCoursesByPackageId({
                package_id: automaticScheduling.course.package_id
            })
            getPackageInfo(automaticScheduling.ordered_package.package_id)
            getUnitsByCourseId({ course_id: automaticScheduling.course_id })

            const regularTimeLocal = getTimestampInWeekToLocal(
                automaticScheduling.regular_start_time
            )
            form.setFieldsValue({
                ...automaticScheduling,
                course_id: automaticScheduling.course_id,
                package_id: automaticScheduling.course.package_id,
                regular_time: regularTimeLocal
            })
        }
    }, [visible])

    const onValuesChange = (changedValues, allValues) => {
        if (_.has(changedValues, 'ordered_package_id')) {
            const pack = values.studentPackages.filter(
                (p) => p.id === _.get(changedValues, 'ordered_package_id')
            )
            if (pack[0]) {
                getCoursesByPackageId({
                    package_id: pack[0].package_id,
                    page_number: 1,
                    page_size: values.page_size
                })
                getPackageInfo(pack[0].package_id)
                form.setFieldsValue({ course_id: null })
            }
            const { filter } = values
            filter.course.page_number = 1
            setValues({ filter })
        }
        if (_.has(changedValues, 'course_id')) {
            getUnitsByCourseId({
                course_id: changedValues.course_id,
                page_number: 1,
                page_size: values.page_size
            })
            const { filter } = values
            form.setFieldsValue({
                course_id: changedValues.course_id,
                unit_id: null
            })
            filter.unit.page_number = 1
            setValues({ filter })
        }
    }

    const editAutoScheduling = useCallback(
        (valuesForm) => {
            setValues({ isLoading: true })
            AutomaticSchedulingAPI.editRegularCalendar(
                automaticScheduling.id,
                valuesForm
            )
                .then((res) => {
                    notification.success({
                        message: 'Success',
                        description: 'Edit successfully'
                    })
                    toggleModal(true)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => {
                    setValues({ isLoading: false })
                })
        },
        [values]
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
                    case 'package':
                        getPackagesByStudentId({
                            student_id: automaticScheduling.student_id,
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'course':
                        getCoursesByPackageId({
                            package_id: form.getFieldValue('package_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
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
            case 'package':
                filter[key].page_number = 1
                getPackagesByStudentId({
                    student_id: automaticScheduling.student_id,
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

    const renderSelect = useCallback(
        (key) => {
            if (_.isArray(values[key]) && values[key].length > 0) {
                return values[key].map((item, index) => {
                    if (key === 'regular_times') {
                        return (
                            <Option key={index} value={item}>
                                {formatTimestamp(item)}
                            </Option>
                        )
                    }
                    if (key === 'teachers') {
                        return (
                            <Option key={index} value={item.user_id}>
                                {item.user
                                    ? `${item?.user?.full_name} - ${item?.user?.username}`
                                    : `${item.full_name} - ${item.username}`}
                            </Option>
                        )
                    }
                    return (
                        <Option key={item.id} value={item.id}>
                            {item.package_name ||
                                item.name ||
                                `${item?.full_name} - ${item.username}`}
                        </Option>
                    )
                })
            }
        },
        [values]
    )

    const renderBody = () => (
        <Row gutter={32}>
            {values.studentPackages.length === 0 && (
                <Col span={24}>
                    <Alert
                        message={`Student has no PREMIUM package active. Can't update anything`}
                        type='error'
                        showIcon
                    />
                </Col>
            )}
            <Col span={24}>
                <Form
                    name='Automatic Scheduling Form'
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    form={form}
                    onValuesChange={onValuesChange}
                    onFinish={editAutoScheduling}
                >
                    <Form.Item label='Học viên'>
                        <span>
                            <b>
                                {automaticScheduling.student &&
                                    `${automaticScheduling?.student?.full_name} - ${automaticScheduling?.student?.username}`}
                            </b>
                        </span>
                    </Form.Item>
                    <Form.Item
                        label='Choose package'
                        name='ordered_package_id'
                        rules={[
                            {
                                required: true,
                                message: 'Please select your package!'
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
                                message: 'Please select course!'
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
                                <Option key='loading' value=''>
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
                                message: 'Please select regular time!'
                            }
                        ]}
                    >
                        <Select placeholder='Choose time'>
                            {renderSelect('regular_times')}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label='Choose teacher'
                        name='teacher_id'
                        rules={[
                            {
                                required: true,
                                message: 'Please select teacher!'
                            }
                        ]}
                    >
                        <Select placeholder='Choose teacher'>
                            {renderSelect('teachers')}
                        </Select>
                    </Form.Item>
                    <Form.Item label='Note' name='note'>
                        <TextArea rows={4} placeholder='Enter note' />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={values.isLoading}
                            disabled={values.studentPackages.length === 0}
                        >
                            Save
                        </Button>
                    </Form.Item>
                    <Alert
                        message={<b>Notes:</b>}
                        description={
                            <>
                                <p>
                                    QTV chỉ có thể thay đổi được Khóa học và
                                    giáo viên
                                </p>
                            </>
                        }
                        type='info'
                        showIcon
                    />
                </Form>
            </Col>
        </Row>
    )

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Edit Automatic Scheduling'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
})

export default EditScheduling
