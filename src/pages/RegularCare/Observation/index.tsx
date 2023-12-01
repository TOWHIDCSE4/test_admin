import { useEffect, useState, useCallback, useReducer } from 'react'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Select,
    Tag,
    Collapse,
    Form,
    Button,
    Spin,
    DatePicker,
    Popover,
    Space,
    Modal
} from 'antd'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import AdministratorAPI from 'api/AdministratorAPI'
import StudentAPI from 'api/StudentAPI'
import { DEPARTMENT } from 'const/department'
import { PERMISSIONS } from 'const/permission'
import { ORDER_STATUS } from 'const'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import UpdateObservationModal from './modals/UpdateObservationModal'
import RegularCareAPI from 'api/RegularCareAPI'
import { REGULAR_CARE_STATUS } from 'const/regular-care'
import { notify } from 'utils/notify'
import { checkPermission } from 'utils/check-permission'
import { exportObservationList } from 'utils/export-xlsx'

const { RangePicker } = DatePicker
const { Option } = Select
const { Panel } = Collapse

export enum EnumLessonObserve {
    first = 1,
    second = 12,
    third = 41,
    fourth = 56,
    fifth = 86
}

const Observation = ({ ...props }) => {
    const [loadingExport, setLoadingExport] = useState(false)
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
            },
            selectedData: []
        }
    )
    const [form] = Form.useForm()

    const getAllData = ({ page_size, page_number, objectSearch }) => {
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

        RegularCareAPI.getAllObservation(searchData)
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                // eslint-disable-next-line array-callback-return
                res.data.map((value, index) => {
                    if (
                        value.status === REGULAR_CARE_STATUS.NOT_DONE &&
                        value.deadline < new Date().getTime()
                    ) {
                        value.expired = true
                    } else {
                        value.expired = false
                    }
                })
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
        getAllData({
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
    const [isShownModal, setShownModal] = useState(false)

    const toggleModal = (value) => {
        setShownModal(value)
    }

    const updateData = () => {
        getAllData({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
    }

    const onClickUpdateData = async (item: any) => {
        const data = JSON.parse(JSON.stringify(item))
        console.log(data)
        const dataObservation = {
            _id: data._id,
            status: data.status,
            detail_data: data.detail_data,
            note_history: data.note_history,
            username_student: data.user ? data.user.username : null
        }
        setValues({ selectedData: dataObservation })
        toggleModal(true)
    }

    useEffect(() => {
        fetchAdministrators()
        form.setFieldsValue({
            ...values.objectSearch
        })
        getAllData({
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
        getAllData({
            page_number: 1,
            page_size: values.page_size,
            objectSearch: valuesForm
        })
    }

    const reload = () => {
        onSearch(form.getFieldsValue())
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

    const updateStatusCheckingCall = useCallback(
        (value, item) => {
            setValues({ isLoading: true })
            RegularCareAPI.updateCheckingCall({ _id: item._id, status: value })
                .then((res) => {
                    notify('success', 'Update status successfully')
                    updateData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                if (key === 'teachers') {
                    return (
                        <Option key={index} value={item.user_id || item.id}>
                            {item.user
                                ? item.user.full_name
                                : `${item.full_name} | ${item.username}`}
                        </Option>
                    )
                }
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

    const removeObservation = useCallback((obj_id: any) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            async onOk() {
                try {
                    await RegularCareAPI.removeObservation(obj_id)
                    updateData()
                } catch (err) {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                }
            }
        })
    }, [])

    const exportObservation = async () => {
        setLoadingExport(true)
        try {
            const searchData = {
                page_size: 9999,
                page_number: 1,
                status: values.objectSearch.status,
                student_user_id: values.objectSearch.student_id,
                staff_id: values.objectSearch.staff_id,
                lesson_index_in_course:
                    values.objectSearch.lesson_index_in_course,
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
            const dataExport: any = await RegularCareAPI.getAllObservation(
                searchData
            )
            if (dataExport.data && dataExport.data.length > 0) {
                const timeExport = moment().format('HH_mm_DD_MM_YYYY')
                await exportObservationList(
                    `Observation_list_${timeExport}`,
                    dataExport.data
                )
            }
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setLoadingExport(false)
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
                {/* <li>
                    <b>Package: </b>
                    {orderedPackages?.package_name}
                </li> */}
                <li>
                    <b>Schedule: </b>
                    {booking?.calendar &&
                        moment(new Date(booking?.calendar?.start_time)).format(
                            'dddd - HH:mm'
                        )}
                    {booking?.teacher && (
                        <>
                            {' '}
                            - {booking?.teacher?.full_name} -{' '}
                            {booking?.teacher?.username}
                        </>
                    )}
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
            </ul>
        ) : (
            ''
        )

    const renderOrderedPackage = (item: any, index: any = -1) =>
        item ? (
            <ul key={`package${index}`} className='list-unstyled'>
                <li>
                    <b>ID: </b>
                    {item.id}
                </li>
                <li>
                    <b>Order Id: </b>
                    {item.order_id}
                </li>
                <li>
                    <b>Type: </b>
                    {item.type === 1 ? (
                        <Tag color='#108ee9'>STANDARD</Tag>
                    ) : item.type === 2 ? (
                        <Tag color='#f50'>PREMIUM</Tag>
                    ) : (
                        <Tag color='#87d068'>TRIAL</Tag>
                    )}
                </li>
                <li>
                    <b>Package: </b>
                    {item.package_name}
                </li>
                <li>
                    <b>Activation date: </b>
                    {`${
                        item.activation_date
                            ? moment(new Date(item?.activation_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Expired date: </b>
                    {`${
                        item.expired_date
                            ? moment(new Date(item?.expired_date)).format(
                                  'HH:mm DD-MM-YYYY'
                              )
                            : ''
                    }`}
                </li>
                <li>
                    <b>Used: </b>
                    {item.original_number_class - item.number_class}/
                    {item.original_number_class}
                </li>
                <li>
                    <b>Booking support: </b>
                    {item?.package?.is_support ? (
                        <Tag color='success'>Support</Tag>
                    ) : (
                        <Tag color='error'>Not support</Tag>
                    )}
                </li>
                <li>
                    <b>Apply for teacher: </b>
                    {item?.package?.location?.name
                        ? item?.package?.location?.name
                        : 'All teachers'}
                </li>
                <li>
                    <b>Status: </b>
                    {(() => {
                        if (
                            item.order &&
                            item.order?.status === ORDER_STATUS.PAID
                        ) {
                            if (
                                item?.expired_date &&
                                moment(item?.expired_date) < moment()
                            ) {
                                return <Tag color='error'>EXPIRED</Tag>
                            }
                            if (item.activation_date) {
                                return <Tag color='success'>ACTIVE</Tag>
                            }
                            return <Tag color='success'>INACTIVE</Tag>
                        }
                    })()}
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
                return record && record?.user && record?.student?.staff ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        <Link
                            style={record?.expired ? { color: '#E23232' } : {}}
                            to={`/students/all?search=${record?.user?.username}`}
                            target='_blank'
                        >
                            {record?.user?.full_name} - {record?.user?.username}
                        </Link>
                        <br></br>
                        Supporter: {record?.student?.staff?.fullname} -{' '}
                        {record?.student?.staff?.username}
                    </div>
                ) : record && record?.user ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        <Link
                            style={record?.expired ? { color: '#E23232' } : {}}
                            to={`/students/all?search=${record?.user?.username}`}
                            target='_blank'
                        >
                            {record?.user?.full_name} - {record?.user?.username}
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
                return record && record?.user ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {record?.user?.phone_number}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Package',
            dataIndex: 'package',
            key: 'package',
            width: 250,
            render: (e, record: any) => {
                return record && record?.orderedPackages ? (
                    <Popover
                        content={renderOrderedPackage(record?.orderedPackages)}
                    >
                        <a>
                            <div
                                className='text-truncate'
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {record?.orderedPackages?.package_name}
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
                return record ? (
                    <Popover content={renderLesson(record?.booking || null)}>
                        <a>
                            <div
                                className='text-truncate'
                                style={
                                    record?.expired ? { color: '#E23232' } : {}
                                }
                            >
                                {record.lesson_index_in_course}
                            </div>
                        </a>
                    </Popover>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                const sizeNote = record.note_history.length
                return record && record.note_history[sizeNote - 1] ? (
                    <div
                        className='text-truncate'
                        style={record?.expired ? { color: '#E23232' } : {}}
                    >
                        {record?.note_history[sizeNote - 1].note}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return record && record.deadline ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {moment(record?.deadline).format('HH:mm DD-MM-YYYY')}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return (
                    <Select
                        defaultValue={record?.status}
                        style={{ width: '100%' }}
                        onChange={(value) =>
                            updateStatusCheckingCall(value, record)
                        }
                    >
                        <Option value={REGULAR_CARE_STATUS.NOT_DONE}>
                            Not Done
                        </Option>
                        <Option value={REGULAR_CARE_STATUS.DONE}>Done</Option>
                    </Select>
                )
            }
        },
        {
            title: 'Create time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return e ? (
                    <div style={record?.expired ? { color: '#E23232' } : {}}>
                        {moment(e).format('HH:mm DD-MM-YYYY')}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.rco_update) && (
                        <EditOutlined
                            onClick={() => onClickUpdateData(record)}
                            style={{ color: blue.primary }}
                            type='button'
                        />
                    )}
                    {checkPermission(PERMISSIONS.rco_delete) && (
                        <DeleteOutlined
                            onClick={() => removeObservation(record._id)}
                            style={{ color: red.primary }}
                            type='button'
                        />
                    )}
                </Space>
            )
        }
    ]

    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                objectSearch: {
                    ...values.objectSearch,
                    fromDate: value[0],
                    toDate: value[1]
                },
                page_number: 1
            })
        }
    }

    return (
        <Card title='Observation List'>
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
                                    <Col span={8}>Deadline:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='rangeDate'
                                            className='mb-0 w-100'
                                        >
                                            <RangePicker
                                                allowClear={false}
                                                defaultValue={[
                                                    values.objectSearch
                                                        .fromDate,
                                                    values.objectSearch.toDate
                                                ]}
                                                style={{ width: '100%' }}
                                                // disabledDate={disabledDate}
                                                clearIcon={false}
                                                onChange={handleChangeDate}
                                            />
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
                                    <Col span={8}>Status:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                defaultValue={
                                                    values.objectSearch.status
                                                }
                                                style={{ width: '100%' }}
                                            >
                                                <Option
                                                    key='-1'
                                                    value={
                                                        REGULAR_CARE_STATUS.ALL
                                                    }
                                                >
                                                    All
                                                </Option>
                                                <Option
                                                    key='1'
                                                    value={
                                                        REGULAR_CARE_STATUS.NOT_DONE
                                                    }
                                                >
                                                    Not Done
                                                </Option>
                                                <Option
                                                    key='2'
                                                    value={
                                                        REGULAR_CARE_STATUS.DONE
                                                    }
                                                >
                                                    Done
                                                </Option>
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
                                                {Object.keys(EnumLessonObserve)
                                                    .filter(
                                                        (key: any) =>
                                                            !isNaN(
                                                                Number(
                                                                    EnumLessonObserve[
                                                                        key
                                                                    ]
                                                                )
                                                            )
                                                    )
                                                    .map((key: any) => (
                                                        <Option
                                                            value={
                                                                EnumLessonObserve[
                                                                    key
                                                                ]
                                                            }
                                                            key={
                                                                EnumLessonObserve[
                                                                    key
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                EnumLessonObserve[
                                                                    key
                                                                ]
                                                            }
                                                        </Option>
                                                    ))}
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
            <Row className='mb-2'>
                <Col span={24} className='d-flex justify-content-end'>
                    {checkPermission(PERMISSIONS.rco_export) && (
                        <Button
                            onClick={exportObservation}
                            disabled={loadingExport}
                            className='mr-2'
                        >
                            <Spin
                                size='small'
                                className='mr-2'
                                spinning={loadingExport}
                            />
                            Export Excel
                        </Button>
                    )}
                </Col>
            </Row>
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
            <UpdateObservationModal
                visible={isShownModal}
                toggleModal={toggleModal}
                data={values.selectedData}
                updateData={updateData}
            />
        </Card>
    )
}

export default Observation
