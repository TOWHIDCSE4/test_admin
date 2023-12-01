import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Checkbox,
    Switch,
    notification,
    Spin,
    Col
} from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { EnumTemplateAIStatus, MODAL_TYPE, MODAL_TYPE_NEW } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import sanitizeHtml from 'sanitize-html'
import PromptTemplateMemoAPI from 'api/PromptTemplateAiAPI'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'
import AIReportResultAPI from 'api/AIReportResultAPI'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    type: MODAL_TYPE_NEW
    data?: any
    refetchData: () => void
}

const ReportResultModal: FC<IProps> = ({
    visible,
    toggleModal,
    type,
    data,
    refetchData
}) => {
    const { Option } = Select
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            categories: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: '',
            category_obj_id_selected: []
        }
    )

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (!_.isEmpty(data)) {
                form.setFieldsValue({
                    title: data?.title,
                    content: data?.content
                })
            }
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const onFinish = useCallback(
        async (value) => {
            setLoading(true)
            try {
                const data_payload: any = {
                    title: value.title,
                    content: value.content
                }
                await AIReportResultAPI.editAIReportResult(
                    data._id,
                    data_payload
                )
                notify('success', 'Update successfully')
                onClose()
                refetchData()
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [type, form]
    )

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            {type === MODAL_TYPE_NEW.VIEW && (
                <>
                    <Form.Item label='Title' name='title'>
                        <Input readOnly />
                    </Form.Item>
                    <Form.Item label='Content' name='content'>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: sanitize(data?.content)
                            }}
                        />
                    </Form.Item>
                </>
            )}
            {type === MODAL_TYPE_NEW.EDIT && (
                <>
                    <Form.Item
                        label='Title'
                        name='title'
                        rules={[
                            {
                                required: true,
                                message: 'Title is required'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='Content'
                        name='content'
                        rules={[
                            {
                                required: true,
                                message: 'Content is required'
                            }
                        ]}
                    >
                        <TextEditor heightCustom={400} />
                    </Form.Item>
                </>
            )}
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
                type === MODAL_TYPE_NEW.VIEW
                    ? 'View Report Results'
                    : 'Edit Report Results'
            }
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                type !== MODAL_TYPE_NEW.VIEW && (
                    <Button
                        key='submit'
                        type='primary'
                        onClick={form.submit}
                        loading={isLoading}
                    >
                        Save
                    </Button>
                )
            ]}
            width={768}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(ReportResultModal)
