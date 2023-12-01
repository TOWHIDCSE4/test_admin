import {
    useEffect,
    useReducer,
    useState,
    memo,
    useCallback,
    FunctionComponent
} from 'react'
import {
    Modal,
    Form,
    Select,
    Row,
    Button,
    notification,
    Spin,
    Switch
} from 'antd'
import _ from 'lodash'
import BookingAPI from 'api/BookingAPI'
import PackageAPI from 'api/PackageAPI'
import CourseAPI from 'api/CourseAPI'
import UnitAPI from 'api/UnitAPI'
import moment from 'moment'
import { IBooking } from 'types'
import { IModalProps } from 'const/common'

const { Option } = Select

interface Props extends IModalProps {
    booking: IBooking
    refetchData: () => void
}

const UpdateUnit: FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, booking, refetchData } = props

    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            studentPackages: [],
            courses: [],
            units: [],
            page_size: 10,
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

    const getPackagesByStudentId = useCallback(
        (query: {
            student_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, studentPackages } = values
            setLoading(true)
            PackageAPI.getPackagesByStudentId(query.student_id, query)
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
                    // if (_.isEmpty(res.data))
                    //     notification.error({
                    //         message: 'Error',
                    //         description:
                    //             "Student has no package active. Can't update anything"
                    //     })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
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
            setLoading(true)
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
                .finally(() => setLoading(false))
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
            setLoading(true)
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
                .finally(() => setLoading(false))
        },
        [values]
    )

    useEffect(() => {
        if (visible && !_.isEmpty(booking)) {
            form.setFieldsValue({
                course_id: booking.course_id,
                unit_id: booking.unit_id,
                package_id: booking.course.package_id,
                admin_unit_lock: true
            })
            getPackagesByStudentId({ student_id: booking.student_id })
            getCoursesByPackageId({ package_id: booking.course.package_id })
            getUnitsByCourseId({ course_id: booking.course_id })
        }
    }, [visible])

    const handleClose = useCallback(
        (should: boolean) => {
            setValues({
                isLoading: false,
                studentPackages: [],
                courses: [],
                units: [],
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
            })
            toggleModal(false)
            if (should) refetchData()
        },
        [refetchData]
    )

    const onUpdate = useCallback(
        (_values) => {
            if (booking.id) {
                setLoading(true)
                BookingAPI.editBooking(booking.id, _values)
                    .then((res) => {
                        notification.success({
                            message: 'Success',
                            description: 'Update unit successfully'
                        })
                        handleClose(true)
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
                    .finally(() => setLoading(false))
            }
        },
        [booking]
    )

    const onValuesChange = (changedValues, allValues) => {
        if (_.has(changedValues, 'package_id')) {
            getCoursesByPackageId({
                package_id: changedValues.package_id,
                page_number: 1,
                page_size: values.page_size
            })
            const { filter } = values
            form.setFieldsValue({
                package_id: changedValues.package_id,
                course_id: null
            })
            filter.course.page_number = 1
            setValues({ filter, courses: [], units: [] })
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
            setValues({ filter, booking, units: [] })
        }
    }

    const loadMore = (key) => (event) => {
        const { target } = event
        if (
            !isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { filter, page_size } = values
            if (filter[key].total > page_size * filter[key].page_number) {
                filter[key].page_number += 1
                setValues({ filter })
                switch (key) {
                    case 'package':
                        getPackagesByStudentId({
                            student_id: booking.student_id,
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
                    student_id: booking.student_id,
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

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => (
                <Option key={index} value={item.id}>
                    {item.name}
                </Option>
            ))
        }
    }
    const renderBody = () => (
        <>
            <Form
                form={form}
                name='Automatic Scheduling Form'
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                onFinish={onUpdate}
                onValuesChange={onValuesChange}
            >
                <Form.Item label='Booking Time'>
                    <span>
                        <b>
                            {booking.calendar &&
                                moment(booking.calendar.start_time).format(
                                    'HH:mm DD/MM/YYY'
                                )}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Teacher'>
                    <span>
                        <b>
                            {booking.teacher &&
                                `${booking.teacher.full_name} - ${booking.teacher.username}`}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Student'>
                    <span>
                        <b>
                            {booking.student &&
                                `${booking.student.full_name} - ${booking.student.username}`}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Set package' name='package_id'>
                    <Select
                        placeholder='Choose package'
                        showSearch
                        filterOption={false}
                        loading={isLoading}
                        onPopupScroll={loadMore('package')}
                        onSearch={_.debounce(onSearch('package'), 300)}
                    >
                        {renderSelect('studentPackages')}
                        {isLoading && (
                            <Option key='loading' value=''>
                                <Spin size='small' />
                            </Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label='Set course' name='course_id'>
                    <Select
                        placeholder='Choose course'
                        showSearch
                        filterOption={false}
                        loading={isLoading}
                        onPopupScroll={loadMore('course')}
                        onSearch={_.debounce(onSearch('course'), 300)}
                    >
                        {renderSelect('courses')}
                        {isLoading && (
                            <Option key='loading' value=''>
                                <Spin size='small' />
                            </Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label='Set unit' name='unit_id'>
                    <Select
                        placeholder='Choose unit'
                        showSearch
                        filterOption={false}
                        loading={isLoading}
                        onPopupScroll={loadMore('unit')}
                        onSearch={_.debounce(onSearch('unit'), 300)}
                    >
                        {renderSelect('units')}
                        {isLoading && (
                            <Option key='loading' value=''>
                                <Spin size='small' />
                            </Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item
                    label='Lock unit'
                    name='admin_unit_lock'
                    valuePropName='checked'
                >
                    <Switch />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 6 }}>
                    <Row justify='end'>
                        <Button
                            htmlType='submit'
                            type='primary'
                            loading={isLoading}
                            // disabled={
                            //     isLoading || _.isEmpty(values.studentPackages)
                            // }
                        >
                            Save
                        </Button>
                    </Row>
                </Form.Item>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Update unit booking'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(UpdateUnit)
