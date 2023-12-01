import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Button, Modal, Form, Input } from 'antd'
import _ from 'lodash'
import { IUser } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import EmailAPI from 'api/EmailAPI'
import { notify } from 'utils/notify'
import { IModalProps } from 'const/common'

interface IProps extends IModalProps {
    data?: IUser
}

const SendEmailModal: FC<IProps> = ({ visible, data, toggleModal }) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            EmailAPI.sendOneSpecificEmail({
                email: data?.email,
                subject: _.get(values, 'subject'),
                body: _.get(values, 'content')
            })
                .then((res) => {
                    notify('success', 'Send email successfully')
                    handleClose()
                })
                .catch((err) => {
                    notify('error', err?.message)
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
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
            >
                <Form.Item
                    label='Subject'
                    name='subject'
                    labelAlign='left'
                    rules={[
                        {
                            required: true,
                            message: 'Subject is required'
                        }
                    ]}
                >
                    <Input placeholder='Enter subject' />
                </Form.Item>
                <Form.Item
                    label='Content'
                    name='content'
                    labelAlign='left'
                    rules={[
                        {
                            required: true,
                            message: 'Content is required'
                        }
                    ]}
                >
                    <TextEditor />
                </Form.Item>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title={`Send Email to ${data?.email}`}
            footer={[
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Send
                </Button>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(SendEmailModal)
