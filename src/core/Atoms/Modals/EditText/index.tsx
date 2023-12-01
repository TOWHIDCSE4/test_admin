import { useEffect, memo, useState, FunctionComponent } from 'react'
import { Modal, Button, notification, Form, Input, Row } from 'antd'
import _ from 'lodash'
import TextEditor from 'core/Atoms/TextEditor'

const { TextArea } = Input
interface Props {
    visible: boolean
    title: string
    textValue: string
    onUpdate: (v) => void
    toggleModal: (visible: boolean) => void
}

const EditTextModal: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, onUpdate, title, textValue } = props
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({ str_value: textValue || '' })
        }
    }, [visible])

    const renderBody = () => (
        <Form
            form={form}
            name={title}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onUpdate}
        >
            <Form.Item noStyle name='str_value'>
                {/* <TextArea
                    style={{
                        width: '100%',
                        marginBottom: '10px',
                        height: '200px'
                    }}
                /> */}
                <TextEditor />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 6 }} style={{ marginBottom: 0 }}>
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
            title={title}
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
})

export default EditTextModal
