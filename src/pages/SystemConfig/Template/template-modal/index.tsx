import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Select } from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'

interface IProps extends IModalProps {
    data?: any
    type: MODAL_TYPE
    refetchData: () => void
}

const TemplateModal: FC<IProps> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)
    const [templateCodes, setTemplateCodes] = useState()

    const fetchTemplateCodes = () => {
        TemplateAPI.getTemplateCodes()
            .then((res) => {
                setTemplateCodes(res)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
                form.setFieldsValue({
                    ...data
                })
            }
            fetchTemplateCodes()
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
                    await TemplateAPI.createTemplate(values)
                    notify('success', 'Create successfully')
                    onClose()
                    refetchData()
                } else if (type === MODAL_TYPE.EDIT) {
                    await TemplateAPI.editTemplate(data._id, values)
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
                label='Template type'
                name='type'
                rules={[
                    {
                        required: true,
                        message: 'Template type is required'
                    }
                ]}
                initialValue={EnumTemplateType.EMAIL}
            >
                <Select onChange={() => form.setFieldsValue({ code: null })}>
                    <Select.Option value={EnumTemplateType.EMAIL}>
                        Email
                    </Select.Option>
                    <Select.Option value={EnumTemplateType.NOTIFICATION}>
                        Notification
                    </Select.Option>
                    <Select.Option value={EnumTemplateType.EVENT}>
                        Event
                    </Select.Option>
                    <Select.Option value={EnumTemplateType.ZALOOA}>
                        ZaloOA
                    </Select.Option>
                </Select>
            </Form.Item>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                {({ getFieldValue }) => (
                    <Form.Item
                        label='Code'
                        name='code'
                        rules={[
                            {
                                required: true,
                                message: 'Code is required'
                            }
                        ]}
                    >
                        <Select>
                            {getFieldValue('type') === EnumTemplateType.EMAIL &&
                                renderOption(_.get(templateCodes, 'email'))}
                            {getFieldValue('type') ===
                                EnumTemplateType.NOTIFICATION &&
                                renderOption(
                                    _.get(templateCodes, 'notification')
                                )}
                            {getFieldValue('type') === EnumTemplateType.EVENT &&
                                renderOption(_.get(templateCodes, 'event'))}
                            {getFieldValue('type') ===
                                EnumTemplateType.ZALOOA &&
                                renderOption(_.get(templateCodes, 'zalo'))}
                        </Select>
                    </Form.Item>
                )}
            </Form.Item>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                {({ getFieldValue }) =>
                    getFieldValue('type') === EnumTemplateType.EMAIL ||
                    getFieldValue('type') === EnumTemplateType.EVENT ? (
                        <>
                            <Form.Item label='Title' name='title'>
                                <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item label='Content' name='content'>
                                <TextEditor />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item label='Content' name='content'>
                            <Input.TextArea rows={5} />
                        </Form.Item>
                    )
                }
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
                    ? 'Create new template'
                    : 'Edit template'
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
            width={1000}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(TemplateModal)
