import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Row,
    Col,
    DatePicker,
    Switch
} from 'antd'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { IEventNotice, EnumEventNoticeType, EnumTargetType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import EventNoticeAPI from 'api/EventNoticeAPI'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import UploadImage from 'core/Atoms/UploadImage'

type Props = {
    data?: IEventNotice
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const EventNoticeModal: FC<Props> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [image, setImage] = useState('')

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
                form.setFieldsValue({
                    ...data,
                    start_time_shown: moment(data.start_time_shown),
                    end_time_shown: moment(data.end_time_shown)
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
            const payload = {
                ...values,
                start_time_shown: moment(values.start_time_shown)
                    .startOf('day')
                    .valueOf(),
                end_time_shown: moment(values.end_time_shown)
                    .endOf('day')
                    .valueOf()
            }
            if (image) payload.image = image
            try {
                if (type === MODAL_TYPE.ADD_NEW) {
                    await EventNoticeAPI.createEventNotice(payload)
                    notify('success', 'Create successfully')
                    onClose()
                    refetchData()
                } else if (type === MODAL_TYPE.EDIT) {
                    await EventNoticeAPI.editEventNotice(data._id, payload)
                    notify('success', 'Update successfully')
                    onClose()
                    refetchData()
                }
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [type, form, image]
    )

    const afterUpload = (url) => {
        setImage(url)
    }

    const onRemoveAvatar = (file) => {
        setImage('')
        return true
    }

    const onChangeForm = (changedValues, allValues) => {
        if (allValues?.start_time_shown) {
            form.setFieldsValue({
                start_time_shown: _.get(allValues, 'start_time_shown').startOf(
                    'd'
                )
            })
        }
        if (allValues?.end_time_shown) {
            form.setFieldsValue({
                end_time_shown: _.get(allValues, 'end_time_shown').endOf('d')
            })
        }
        if (allValues?.end_time_applied) {
            form.setFieldsValue({
                end_time_applied: _.get(allValues, 'end_time_applied').endOf(
                    'd'
                )
            })
        }
    }

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
            onValuesChange={onChangeForm}
        >
            <Form.Item
                label='Event notice type'
                name='type'
                rules={[
                    {
                        required: true,
                        message: 'Event notice type is required'
                    }
                ]}
                initialValue={EnumEventNoticeType.HOLIDAY_EVENT}
            >
                <Select>
                    <Select.Option value={EnumEventNoticeType.HOLIDAY_EVENT}>
                        Holiday event
                    </Select.Option>
                    <Select.Option
                        value={EnumEventNoticeType.UPDATE_SYSTEM_EVENT}
                    >
                        Update system event
                    </Select.Option>
                    <Select.Option value={EnumEventNoticeType.OTHER_EVENT}>
                        Other event
                    </Select.Option>
                </Select>
            </Form.Item>
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
                <Input.TextArea rows={2} />
            </Form.Item>
            <Row gutter={[10, 10]}>
                <Col span={12}>
                    <Form.Item
                        label='Apply for'
                        name='target'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Apply for is required'
                            }
                        ]}
                    >
                        <Select placeholder='Choose Apply for' mode='multiple'>
                            <Select.Option value={EnumTargetType.TEACHER}>
                                {_.startCase(
                                    _.get(
                                        EnumTargetType,
                                        EnumTargetType.TEACHER
                                    )
                                )}
                            </Select.Option>
                            <Select.Option value={EnumTargetType.STUDENT}>
                                {_.startCase(
                                    _.get(
                                        EnumTargetType,
                                        EnumTargetType.STUDENT
                                    )
                                )}
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label='Status'
                        name='is_active'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Status is required'
                            }
                        ]}
                        valuePropName='checked'
                    >
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[10, 10]}>
                <Col span={12}>
                    <Form.Item
                        labelAlign='left'
                        name='start_time_shown'
                        label='Start time shown'
                        rules={[
                            {
                                required: true,
                                message: 'Start time shown is required'
                            }
                        ]}
                    >
                        <DatePicker
                            disabledDate={(current) =>
                                moment().startOf('d') >= current
                            }
                            className='w-100'
                            format={FULL_DATE_FORMAT}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        labelAlign='left'
                        name='end_time_shown'
                        label='End time shown'
                        rules={[
                            {
                                required: true,
                                message: 'End time shown is required'
                            }
                        ]}
                    >
                        <DatePicker
                            disabledDate={(current) =>
                                moment().startOf('d') >= current
                            }
                            className='w-100'
                            format={FULL_DATE_FORMAT}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                {({ getFieldValue }) =>
                    getFieldValue('type') !==
                    EnumEventNoticeType.HOLIDAY_EVENT ? (
                        <>
                            <Form.Item label='Content' name='content'>
                                <TextEditor />
                            </Form.Item>
                        </>
                    ) : (
                        <Row className='justify-content-center'>
                            <div>
                                <UploadImage
                                    afterUpload={afterUpload}
                                    onRemove={onRemoveAvatar}
                                    defaultFileList={
                                        data?.image
                                            ? [
                                                  {
                                                      url: data?.image,
                                                      name: data?.title,
                                                      uid: data?._id.toString()
                                                  }
                                              ]
                                            : null
                                    }
                                />
                            </div>
                        </Row>
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
                    ? 'Create new event notice'
                    : 'Edit event notice'
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

export default memo(EventNoticeModal)
