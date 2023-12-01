import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Col,
    Row,
    DatePicker,
    DatePickerProps,
    Select,
    Tag,
    Input,
    Table,
    notification,
    Spin,
    Switch
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _, { forEach } from 'lodash'
import BookingApi from 'api/BookingAPI'
import moment from 'moment'
import type { RangePickerProps } from 'antd/es/date-picker'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import TeacherAPI from 'api/TeacherAPI'
import { ENUM_BOOKING_STATUS } from 'const'
import UnitAPI from 'api/UnitAPI'
import PackageAPI from 'api/PackageAPI'
import { formatTimestamp, getTimestampInWeekToLocal } from 'utils/datetime'

const { Option } = Select
type Props = {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    reload: () => void
}

const CreateBookingModel: FC<Props> = ({
    visible,
    data,
    toggleModal,
    reload
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [listTime, setListTime] = useState([])
    const [unit, setUnit] = useState([])
    const [listTeacher, setListTeacher] = useState([])
    const [page_number, setPageNumber] = useState(1)
    const [startTime, setStartTime] = useState()
    const [total, setTotal] = useState(0)
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

    const getUnitsByCourseId = (query: {
        course_id: number
        page_size?: number
        page_number?: number
        search?: string
    }) => {
        UnitAPI.getUnitsByCourseId(query.course_id, query)
            .then((res) => {
                setUnit(res.data)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    useEffect(() => {
        if (data && visible) {
            form.setFieldsValue({
                teacher: data?.teacher.full_name,
                old_time: formatTimestamp(
                    getTimestampInWeekToLocal(data?.regular_start_time)
                ),
                course: data?.course.name,
                student: data?.student.full_name,
                is_lock_unit: true
            })
            getUnitsByCourseId({
                course_id: data.course_id,
                page_number: 1,
                page_size: 9999
            })
            getPackageInfo(data.ordered_package.package_id)
        } else {
            form.resetFields()
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            if (values.time) {
                const hours = values.time.split(':')[0]
                const minutes = values.time.split(':')[1]
                values.date.set({
                    hour: parseInt(hours, 10),
                    minute: parseInt(minutes, 10),
                    second: 0,
                    millisecond: 0
                })
            }
            const dataCreate: any = {
                course_id: data.course_id,
                unit_id: values.unit,
                student_id: data.student_id,
                ordered_package_id: data.ordered_package_id,
                admin_note: 'create booking by manual',
                start_time: values.date.toDate().getTime(),
                teacher_id: values.new_teacher,
                admin_unit_lock: values.is_lock_unit
            }
            if (Number(dataCreate.teacher_id) !== Number(data?.teacher?.id)) {
                dataCreate.substitute_for_teacher_id = data?.teacher?.id
            }
            BookingApi.createBooking({
                ...(dataCreate as any),
                status: ENUM_BOOKING_STATUS.UPCOMING
            })
                .then(async (res) => {
                    const dataInfo = {
                        id: data.id,
                        auto_schedule: {
                            time: Date.now(),
                            success: true,
                            message: 'Successfully created manual booking',
                            booking_id: res.id,
                            meta_data: dataCreate
                        }
                    }
                    await BookingApi.updateRegularBookingInfo(dataInfo)
                    toggleModal(false)
                    reload()
                    notification.success({
                        message: 'Success',
                        description: 'Created successfully'
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
        [form, data]
    )

    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        const start_time = moment()
        const list = []
        let temp = moment(start_time)
        temp = moment(temp).add(30, 'minutes')
        const now = moment()
        if (now.format('YYYY-MM-DD') === dateString) {
            temp = temp.set({
                hour: now.minute() > 30 ? now.hours() + 2 : now.hours() + 1,
                minute: now.minute() <= 30 ? 30 : 0,
                second: 0,
                millisecond: 0
            })
        } else {
            temp = temp.set({
                hour: 7,
                minute: 0,
                second: 0,
                millisecond: 0
            })
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
            list.push(temp.format('HH:mm'))
        }
        while (temp.hours() !== 23) {
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
        }
        setListTime(list)
        setLoading(true)
        form.setFieldsValue({ time: '' })
    }

    const getTeachersWithStartTime = (
        query?: {
            start_time: number
            page_size?: number
            page_number?: number
            location_id?: string
        },
        isLoadMore?
    ) => {
        setLoading(true)
        form.setFieldsValue({
            new_teacher: ''
        })
        const startTimeTemp = moment(query.start_time)
            .set('s', 0)
            .set('millisecond', 0)
            .valueOf()
        if (packageInfo) {
            query.location_id = packageInfo?.location_id
        }
        TeacherAPI.getTeachersByTime({
            ...query,
            start_time: startTimeTemp
        })
            .then((res) => {
                let dataRes = res.data
                if (isLoadMore) {
                    dataRes = listTeacher
                    res.data.forEach((element) => {
                        const exits = dataRes.find((e) => e.id === element.id)
                        if (!exits) {
                            dataRes.push(element)
                        }
                    })
                }
                setListTeacher(dataRes)
                setTotal(res.pagination.total)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const onChangeTime = () => {
        const values = form.getFieldsValue()
        if (values.time) {
            const hours = values.time.split(':')[0]
            const minutes = values.time.split(':')[1]
            values.date.set({
                hour: parseInt(hours, 10),
                minute: parseInt(minutes, 10),
                second: 0,
                millisecond: 0
            })
        }
        const query = {
            start_time: values.date.toDate().getTime(),
            page_size: 50,
            page_number: 1
        }
        setPageNumber(1)
        setStartTime(values.date.toDate().getTime())
        getTeachersWithStartTime(query)
    }
    const loadMore = (event) => {
        const { target } = event
        if (
            !loading &&
            target &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            if (!total || page_number * 50 < total) {
                const query = {
                    start_time: startTime,
                    page_size: 50,
                    page_number: page_number + 1
                }
                getTeachersWithStartTime(query, true)
                setPageNumber(page_number + 1)
            }
        }
    }
    const searchTeacher = (text) => {
        if (text) {
            setPageNumber(1)
            const query = {
                start_time: startTime,
                page_size: 50,
                page_number: 1,
                search: text
            }
            getTeachersWithStartTime(query)
        }
    }

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        const customDate = moment().format('YYYY-MM-DD')
        return current && current < moment(customDate, 'YYYY-MM-DD')
    }
    const columns: ColumnsType = [
        {
            title: `Teacher`,
            dataIndex: 'teacher',
            key: 'teacher',
            render: (text, record) =>
                text && `${text.full_name} - ${text.username}`
        },
        {
            title: `Regular time`,
            dataIndex: 'regular_start_time',
            key: 'regular_start_time'
        }
    ]

    const renderBody = () => (
        <>
            <Form
                name='basic'
                layout='vertical'
                form={form}
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Student'
                            name='student'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Old Teacher'
                            name='teacher'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Old Time'
                            name='old_time'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Course'
                            name='course'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={18}>
                        <Form.Item
                            label='Unit'
                            name='unit'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select unit'
                                }
                            ]}
                        >
                            <Select filterOption={false}>
                                {unit.map((item, index) => {
                                    return (
                                        <Option key={index} value={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6} className='d-flex justify-content-end'>
                        <Form.Item
                            label='Lock unit'
                            name='is_lock_unit'
                            labelAlign='left'
                            valuePropName='checked'
                        >
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Date'
                            name='date'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Date!'
                                }
                            ]}
                        >
                            <DatePicker
                                className='w-100'
                                allowClear={false}
                                onChange={onChange}
                                disabledDate={disabledDate}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Time'
                            name='time'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Time!'
                                }
                            ]}
                        >
                            <Select
                                defaultValue=''
                                style={{ width: '100%' }}
                                onChange={onChangeTime}
                            >
                                {listTime.map((item, index) => (
                                    <Option key={`${index}`} value={item}>
                                        {_.capitalize(item)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            className='w-100'
                            label='Teacher'
                            name='new_teacher'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Teacher!'
                                }
                            ]}
                        >
                            <Select
                                defaultValue=''
                                style={{ width: '100%' }}
                                filterOption={false}
                                loading={loading}
                                onPopupScroll={loadMore}
                                showSearch
                                onSearch={_.debounce(searchTeacher, 300)}
                            >
                                {!loading &&
                                    listTeacher.map((item, index) => (
                                        <Option
                                            key={`${index}`}
                                            value={item.user_id}
                                        >
                                            {_.capitalize(
                                                `${item.user?.full_name} - ${item.user?.username}`
                                            )}{' '}
                                            ({item.average_rating}{' '}
                                            <i
                                                className='fa fa-star'
                                                style={{ color: '#ff9800' }}
                                                aria-hidden='true'
                                            ></i>
                                            )
                                        </Option>
                                    ))}
                                {loading && (
                                    <Option key='loading'>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )

    return (
        <Modal
            maskClosable={true}
            centered
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title='Create new booking'
            footer={[
                <Button
                    key='Close'
                    type='primary'
                    danger
                    onClick={() => handleClose()}
                >
                    Close
                </Button>,
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
            width={500}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(CreateBookingModel)
