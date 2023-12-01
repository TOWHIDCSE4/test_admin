import React, {
    useEffect,
    memo,
    useCallback,
    useMemo,
    useState,
    FunctionComponent
} from 'react'
import { Modal, Button, notification, Form, Input, Select, Row } from 'antd'
import _ from 'lodash'
import { BOOKING_STATUS_OBJECT } from 'const/status'
import BookingAPI from 'api/BookingAPI'
import moment from 'moment'
import { IBooking } from 'types'
import { IModalProps } from 'const/common'

const { Option } = Select
const { TextArea } = Input

interface Props extends IModalProps {
    booking: IBooking
    refetchData: () => void
}

const UpdateStatus: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, booking, refetchData } = props

    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(booking)) {
            form.setFieldsValue({
                teacher_name: booking.teacher && booking.teacher.first_name,
                calendar_time:
                    booking.calendar &&
                    moment(booking.calendar.start_time).format(
                        'HH:mm DD/MM/YYY'
                    ),
                status: booking.status,
                reason: booking.reason || '',
                admin_note: booking.admin_note || '',
                id: booking.id
            })
        }
    }, [visible])

    const handleClose = useCallback(
        (should: boolean) => {
            toggleModal(false)
            if (should) refetchData()
        },
        [refetchData]
    )

    const onUpdate = useCallback(
        (values) => {
            if (values.status) {
                setLoading(true)
                BookingAPI.editBooking(booking.id, {
                    status: values.status,
                    reason: values.reason,
                    admin_note: values.admin_note
                })
                    .then((res) => {
                        notification.success({
                            message: 'Success',
                            description: 'Successfully'
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
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Status invalid'
                })
            }
        },
        [booking]
    )

    const renderSelect = useMemo(
        () =>
            _.keys(BOOKING_STATUS_OBJECT).map((key) => (
                <Option key={key} value={BOOKING_STATUS_OBJECT[key]}>
                    {_.startCase(key)}
                </Option>
            )),
        []
    )

    const renderBody = () => (
        <Form
            form={form}
            name='Automatic Scheduling Form'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onUpdate}
        >
            <Form.Item label='Teacher' name='teacher_name'>
                <Input readOnly />
            </Form.Item>
            <Form.Item label='Booking time' name='calendar_time'>
                <Input readOnly />
            </Form.Item>
            <Form.Item label='Set new status' name='status'>
                <Select>{renderSelect}</Select>
            </Form.Item>
            <Form.Item label='Reason' name='reason'>
                <TextArea />
            </Form.Item>
            <Form.Item label='Admin note' name='admin_note'>
                <TextArea />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 6 }}>
                <Row justify='end'>
                    <Button
                        htmlType='submit'
                        type='primary'
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Save
                    </Button>
                </Row>
            </Form.Item>
        </Form>
    )
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Update status booking'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
})

export default UpdateStatus
