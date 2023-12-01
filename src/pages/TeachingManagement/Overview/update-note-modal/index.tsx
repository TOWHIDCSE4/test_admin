import {
    useEffect,
    memo,
    useCallback,
    useState,
    FunctionComponent
} from 'react'
import { Modal, Button, notification, Form, Input, Row } from 'antd'
import _ from 'lodash'
import BookingAPI from 'api/BookingAPI'
import { IBooking } from 'types'
import { IModalProps } from 'const/common'

const { TextArea } = Input

interface Props extends IModalProps {
    booking: IBooking
    refetchData: () => void
}

const UpdateNote: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, booking, refetchData } = props

    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(booking)) {
            form.setFieldsValue({
                admin_note: booking.admin_note,
                teacher_note: booking.teacher_note,
                cskh_note: booking.cskh_note
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
            setLoading(true)
            BookingAPI.editBooking(booking.id, {
                admin_note: values.admin_note,
                teacher_note: values.teacher_note,
                cskh_note: values.cskh_note
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
        },
        [booking]
    )

    const renderBody = () => (
        <Form
            form={form}
            name='Update Note Form'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onUpdate}
        >
            <Form.Item label='Note for Teacher' name='teacher_note'>
                <TextArea />
            </Form.Item>
            <Form.Item label='CS note' name='cskh_note'>
                <TextArea />
            </Form.Item>
            <Form.Item label='HT & QTGV note: ' name='admin_note'>
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
            title='Update note booking'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
})

export default UpdateNote
