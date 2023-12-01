import { useEffect, useCallback, useReducer } from 'react'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Select,
    Collapse,
    Form,
    Button,
    Spin,
    Popover
} from 'antd'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentAPI from 'api/StudentAPI'
import { DEPARTMENT } from 'const/department'
import RegularCareAPI from 'api/RegularCareAPI'
import { REGULAR_CARE_STATUS } from 'const/regular-care'

const { Option } = Select
const { Panel } = Collapse

const RegularTest = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            objectSearch: {
                status: REGULAR_CARE_STATUS.NOT_DONE,
                student_id: '',
                staff_id: '',
                fromDate: '',
                toDate: '',
                lesson_index_in_course: ''
            },
            students: [],
            listAdmin: [],
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            }
        }
    )
    const [form] = Form.useForm()

    const getAllTestReports = ({ page_size, page_number, objectSearch }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            status: objectSearch.status,
            student_user_id: objectSearch.student_id,
            staff_id: objectSearch.staff_id,
            lesson_index_in_course: objectSearch.lesson_index_in_course,
            fromDate: values.objectSearch.fromDate,
            toDate: values.objectSearch.toDate
        }
        if (searchData.fromDate && searchData.toDate) {
            const fromDate = new Date(
                searchData.fromDate.set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                })
            ).getTime()
            const toDate = new Date(
                searchData.toDate.set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 0
                })
            ).getTime()
            searchData.fromDate = fromDate
            searchData.toDate = toDate
        }

        RegularCareAPI.getAllRegularTest(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ data: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getAllTestReports({
            page_number,
            page_size,
            objectSearch: values.objectSearch
        })
    }

    const fetchAdministrators = async () => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                idDepartment: DEPARTMENT.phongcskh.id
            })
            setValues({
                listAdmin: res.data.map((i: any) => ({
                    label: i.fullname,
                    value: i.id
                }))
            })
        } catch (error) {
            console.error(error)
        }
    }
    const getRegularStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
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
        },
        [values]
    )

    useEffect(() => {
        fetchAdministrators()
        form.setFieldsValue({
            ...values.objectSearch
        })
        getAllTestReports({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
        getRegularStudents({
            search: ''
        })
    }, [])

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
                getRegularStudents({
                    page_number: filter[key].page_number,
                    search: filter[key].search,
                    page_size
                })
            }
        }
    }
    const onSearch = (valuesForm: any) => {
        setValues({
            page_number: 1,
            objectSearch: { ...values.objectSearch, ...valuesForm }
        })
        getAllTestReports({
            page_number: 1,
            page_size: values.page_size,
            objectSearch: valuesForm
        })
    }

    const onSearchStudent = (key) => (value: string) => {
        const { filter, page_size } = values
        filter[key].search = value
        filter[key].page_number = 1
        getRegularStudents({
            page_number: filter[key].page_number,
            page_size,
            search: value
        })
        setValues({ filter })
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                return (
                    <Option key={index} value={item.id}>
                        {item.package_name ||
                            item.name ||
                            `${item.full_name} | ${item.username}`}
                    </Option>
                )
            })
        }
    }

    const renderCourse = (
        orderedPackages: any,
        booking: any,
        student: any,
        index: any = -1
    ) =>
        orderedPackages || booking || student ? (
            <ul key={`course${index}`} className='list-unstyled'>
                <li>
                    <b>Course: </b>
                    {booking?.course && booking?.course?.name}
                </li>
                <li>
                    <b>Package: </b>
                    {orderedPackages?.package_name}
                </li>
            </ul>
        ) : (
            ''
        )

    const renderLesson = (booking: any, index: any = -1) =>
        booking ? (
            <ul key={`course${index}`} className='list-unstyled'>
                <li>
                    <b>Time: </b>
                    {booking.calendar &&
                        moment(new Date(booking?.calendar?.start_time)).format(
                            'dddd - HH:mm DD/MM/YYYY'
                        )}
                </li>
                <li>
                    <b>GV: </b>
                    {booking?.teacher && (
                        <>
                            {booking?.teacher?.full_name} -{' '}
                            {booking?.teacher?.username}
                        </>
                    )}
                </li>
                <li>
                    <b>Unit: </b>
                    {booking?.unit && <>{booking?.unit?.name}</>}
                </li>
            </ul>
        ) : (
            ''
        )

    const columns: any = [
        {
            title: 'STT',
            key: 'STT',
            width: 60,
            align: 'center',
            hidden: false,
            fixed: true,
            render: (text: any, record: any, index) =>
                index + (values.page_number - 1) * values.page_size + 1
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            align: 'left',
            fixed: true,
            width: 280,
            render: (e, record: any) => {
                return record &&
                    record?.student?.user &&
                    record?.student?.staff ? (
                    <div>
                        <Link
                            to={`/students/all?search=${record?.student?.user?.username}`}
                            target='_blank'
                        >
                            {record?.student?.user?.full_name} -{' '}
                            {record?.student?.user?.username}
                        </Link>
                        <br></br>
                        Supporter: {record?.student?.staff?.fullname} -{' '}
                        {record?.student?.staff?.username}
                    </div>
                ) : record && record?.student?.user ? (
                    <div>
                        <Link
                            to={`/students/all?search=${record?.student?.user?.username}`}
                            target='_blank'
                        >
                            {record?.student?.user?.full_name} -{' '}
                            {record?.student?.user?.username}
                        </Link>
                        <br></br>
                        Supporter: None
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return record && record?.student?.user ? (
                    <div>{record?.student?.user?.phone_number}</div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            align: 'left',
            width: 250,
            render: (e, record: any) => {
                return record && record?.course ? (
                    <Popover
                        content={renderCourse(
                            record?.orderedPackages || null,
                            record || null,
                            record?.student?.user || null
                        )}
                    >
                        <a>
                            <div className='text-truncate'>
                                {record?.course?.name}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Lesson',
            dataIndex: 'lesson',
            key: 'lesson',
            align: 'center',
            width: 80,
            render: (text: any, record: any, index) => {
                return record &&
                    typeof record.unit?.display_order === 'number' ? (
                    <Popover content={renderLesson(record || null)}>
                        <a>
                            <div className='text-truncate'>
                                {record.unit.display_order + 1}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 100,
            render: (e, record: any) => {
                return record && record?.test_type ? (
                    <div className='text-truncate'>
                        {record?.test_type === 'MID' ? 'Mid-term' : 'Final'}
                    </div>
                ) : (
                    <></>
                )
            }
        }
    ]

    return (
        <Card title='Regular Test'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Supporter:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='staff_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value={-1}>
                                                    No one
                                                </Option>
                                                {values.listAdmin.map(
                                                    (item, index) => (
                                                        <Option
                                                            key={`staff_id${index}`}
                                                            value={item.value}
                                                        >
                                                            {_.capitalize(
                                                                item.label
                                                            )}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Student:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='student_id'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                showSearch
                                                placeholder='By name , username'
                                                defaultValue=''
                                                allowClear
                                                filterOption={false}
                                                loading={
                                                    values.isLoadingSearchStudent
                                                }
                                                onPopupScroll={loadMore(
                                                    'student'
                                                )}
                                                onSearch={_.debounce(
                                                    onSearchStudent('student'),
                                                    500
                                                )}
                                            >
                                                {renderSelect('students')}
                                                {values.isLoadingSearchStudent && (
                                                    <Option
                                                        key='loading'
                                                        value=''
                                                    >
                                                        <Spin size='small' />
                                                    </Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Lesson:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='lesson_index_in_course'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue=''
                                                style={{ width: '100%' }}
                                                loading={values.isLoading}
                                            >
                                                <Option value=''>All</Option>
                                                <Option value={15}>15</Option>
                                                <Option value={30}>30</Option>
                                                <Option value={45}>45</Option>
                                                <Option value={60}>60</Option>
                                                <Option value={75}>75</Option>
                                                <Option value={90}>90</Option>
                                                <Option value={105}>105</Option>
                                                <Option value={120}>120</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            {/* <Col>
                                <Button
                                    type='primary'
                                    danger
                                    onClick={() => onReset()}
                                >
                                    Reset
                                </Button>
                            </Col> */}
                            <Col>
                                <Button type='primary' htmlType='submit'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>

            <Table
                columns={columns}
                dataSource={values.data}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                scroll={{
                    x: 500,
                    y: 400
                }}
                loading={values.isLoading}
                sticky
                rowKey={(record: any) => record._id}
            />
        </Card>
    )
}

export default RegularTest
