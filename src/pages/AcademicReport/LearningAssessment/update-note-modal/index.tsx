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
import LearningAssessmentReportsAPI from 'api/LearningAssessmentReportsAPI'

const { TextArea } = Input

interface Props extends IModalProps {
    data: any
    refetchData: () => void
}

const UpdateNote: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, data, refetchData } = props

    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({
                cskh_note: data.note?.cskh,
                ht_note: data.note?.ht
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
            LearningAssessmentReportsAPI.editLAReport(data.id, {
                note: 'true',
                cskh_note: values.cskh_note,
                ht_note: values.ht_note
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
        [data]
    )

    const renderBody = () => (
        <Form
            form={form}
            name='Update Note Form'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onUpdate}
        >
            <Form.Item label='CS note' name='cskh_note'>
                <TextArea />
            </Form.Item>
            <Form.Item label='HT note: ' name='ht_note'>
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
            title='Update note report'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
})

export default UpdateNote
