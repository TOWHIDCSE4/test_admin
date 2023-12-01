import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Select, Checkbox, Switch } from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import ApiKeyMemoAPI from 'api/ApiKeyAiAPI'
import { Link } from 'react-router-dom'

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    type: MODAL_TYPE
    data?: any
    refetchData: () => void
}

const ApiKeyModal: FC<IProps> = ({
    visible,
    toggleModal,
    type,
    data,
    refetchData
}) => {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
                form.setFieldsValue({
                    ...data
                })
            }
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const onFinish = useCallback(
        async (values) => {
            setLoading(true)
            try {
                if (type === MODAL_TYPE.ADD_NEW) {
                    await ApiKeyMemoAPI.createApiKey(values)
                    notify('success', 'Create successfully')
                    onClose()
                    refetchData()
                } else if (type === MODAL_TYPE.EDIT) {
                    await ApiKeyMemoAPI.editApiKey(data._id, values)
                    notify('success', 'Update successfully')
                    onClose()
                    refetchData()
                }
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [type, form]
    )
    const renderOption = (objectData) => {
        let list = []
        if (objectData) {
            list = Object.entries(objectData)
            return list.map(([name, code]) => (
                <Select.Option key={code} value={code}>
                    {code}
                </Select.Option>
            ))
        }
        return <></>
    }

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                <Form.Item
                    label='Title'
                    name='title'
                    rules={[
                        {
                            required: true,
                            message: 'Titel is required'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label='Api key'
                    name='api_key'
                    rules={[
                        {
                            required: true,
                            message: 'Api key is required'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <a href='https://platform.openai.com/account/api-keys'>
                    Get your OpenAI API key
                </a>
            </Form.Item>
            <Form.Item
                labelAlign='left'
                name='is_active'
                label='Active'
                className='mt-3'
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
                    ? 'Create New Api Key'
                    : 'Edit Api Key'
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
            width={768}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(ApiKeyModal)
