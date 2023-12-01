import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Switch } from 'antd'
import SubjectAPI from 'api/SubjectAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ISubject } from 'types'

type Props = {
    data?: ISubject
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const SubjectModal: FC<Props> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ is_active: true })
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            if (type === MODAL_TYPE.ADD_NEW) {
                SubjectAPI.createSubject(values)
                    .then((res) => {
                        notify('success', 'Create successfully')
                        onClose()
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else if (type === MODAL_TYPE.EDIT) {
                SubjectAPI.editSubject(data.id, values)
                    .then((res) => {
                        notify('success', 'Update successfully')
                        onClose()
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [type, form]
    )

    const renderBody = () => (
        <Form
            name='basic'
            layout='horizontal'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Form.Item
                label='Name'
                name='name'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Name subject is required'
                    }
                ]}
            >
                <Input placeholder='Enter name subject' />
            </Form.Item>
            <Form.Item
                label='Active subject'
                name='is_active'
                labelAlign='left'
                valuePropName='checked'
            >
                <Switch />
            </Form.Item>
        </Form>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new subject'
                    : 'Edit subject information'
            }
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={form.submit}
                    loading={isLoading}
                >
                    Save
                </Button>
            ]}
            width={600}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(SubjectModal)
