import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, InputNumber, Select } from 'antd'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumCommentType } from 'types'
import CommentSuggestionAPI from 'api/CommentSuggestionAPI'
import { MEMO_NOTE_FIELDS } from 'const'

const { TextArea } = Input
const { Option } = Select

type Props = {
    data?: any
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const CommentSuggestionModal: FC<Props> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [keywordList, setKeywordList] = useState(MEMO_NOTE_FIELDS)

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
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
                CommentSuggestionAPI.createCommentSuggestion(values)
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
                CommentSuggestionAPI.editCommentSuggestion(data.id, values)
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
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            form={form}
            onFinish={onFinish}
        >
            <Form.Item
                label='Comment type'
                name='type'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Comment type is required'
                    }
                ]}
            >
                <Select style={{ width: '100%' }} placeholder='Choose type'>
                    <Option value={EnumCommentType.NORMAL_MEMO}>
                        {_.startCase(EnumCommentType.NORMAL_MEMO).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.TRIAL_MEMO}>
                        {_.startCase(EnumCommentType.TRIAL_MEMO).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.MONTHLY_MEMO}>
                        {_.startCase(
                            EnumCommentType.MONTHLY_MEMO
                        ).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.COURSE_MEMO}>
                        {_.startCase(EnumCommentType.COURSE_MEMO).toUpperCase()}
                    </Option>
                </Select>
            </Form.Item>
            <Form.Item
                label='Keyword'
                name='keyword'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Keyword is required'
                    }
                ]}
            >
                <Select
                    style={{ width: '100%' }}
                    placeholder='Choose name keyword'
                >
                    {keywordList.map((k, index) => (
                        <Option value={k} key={k}>
                            {k.toUpperCase()}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label='Min point'
                name='min_point'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Min point is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={10}
                    placeholder='Enter Min point'
                />
            </Form.Item>

            <Form.Item
                label='Max point'
                name='max_point'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Max point is requried'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={10}
                    placeholder='Enter Max point'
                />
            </Form.Item>
            <Form.Item
                label='VI comment'
                name='vi_comment'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'VI comment is required'
                    }
                ]}
            >
                <TextArea placeholder='Enter name keyword' />
            </Form.Item>
            <Form.Item
                label='EN comment'
                name='en_comment'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'EN comment is required'
                    }
                ]}
            >
                <TextArea placeholder='Enter name keyword' />
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
                    ? 'Create new comment suggestion'
                    : 'Edit comment suggestion information'
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

export default memo(CommentSuggestionModal)
