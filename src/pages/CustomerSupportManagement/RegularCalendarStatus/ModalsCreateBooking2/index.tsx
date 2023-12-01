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
import {
    formatTimestamp,
    formatTimestamp2,
    getTimestampInWeekToLocal,
    getTimestampInWeekToUTC
} from 'utils/datetime'

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
    const [unit, setUnit] = useState([])

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

            const dataCreate = {
                course_id: data.course_id,
                unit_id: values.unit,
                student_id: data.student_id,
                ordered_package_id: data.ordered_package_id,
                admin_note: 'create booking by manual',
                start_time: formatTimestamp2(
                    getTimestampInWeekToLocal(data?.regular_start_time)
                ).valueOf(),
                teacher_id: data?.teacher_id,
                admin_unit_lock: values.is_lock_unit
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
