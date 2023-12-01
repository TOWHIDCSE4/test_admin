import React, { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, DatePicker, Form, Input, Button, Select } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { EnumTeacherAbsentRequestStatus, IAbsentRequest } from 'types'
import AbsentRequestAPI from 'api/AbsentRequestAPI'
import { DATE_FORMAT } from 'const'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Option } = Select

type AbsentRequestModalProps = {
    visible: boolean
    data?: IAbsentRequest
    toggleModal: (visible: boolean) => void
    refetchData: () => void
}

const AbsentRequestModal: FC<AbsentRequestModalProps> = ({
    visible,
    data,
    toggleModal,
    refetchData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const onClose = () => {
        toggleModal(false)
        form.resetFields()
    }
    const onSubmit = useCallback(() => {
        setLoading(true)
        AbsentRequestAPI.editAbsentRequest(data.id, {
            status: form.getFieldValue('status'),
            admin_note: form.getFieldValue('admin_note')
        })
            .then((res) => {
                notify('success', 'Update successfully')
                onClose()
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }, [loading, data, form])

    useEffect(() => {
        if (visible) {
            if (!_.isEmpty(data)) {
                form.setFieldsValue({
                    teacher_note: data.teacher_note,
                    admin_note: data.admin_note,
                    time: [moment(data.start_time), moment(data.end_time)]
                })
            }
        }
    }, [visible])

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 }
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 14 }
        }
    }

    const disabledDate = (current) =>
        // Can not select days before today and today
        current && current < moment().startOf('day')

    const renderBody = () => (
        <Form {...formItemLayout} form={form}>
            <Form.Item label='Time' name='time'>
                <RangePicker
                    allowClear={false}
                    disabledDate={disabledDate}
                    disabled
                    format={DATE_FORMAT}
                />
            </Form.Item>
            <Form.Item label='Teacher Note' name='teacher_note'>
                <TextArea readOnly />
            </Form.Item>
            <Form.Item
                label='Status'
                name='status'
                rules={[
                    {
                        required: true,
                        message: 'Please select status!'
                    }
                ]}
            >
                <Select style={{ width: '150px' }}>
                    {data?.status ===
                        EnumTeacherAbsentRequestStatus.PENDING && (
                        <>
                            <Option
                                value={EnumTeacherAbsentRequestStatus.APPROVED}
                            >
                                {_.startCase(
                                    _.get(
                                        EnumTeacherAbsentRequestStatus,
                                        EnumTeacherAbsentRequestStatus.APPROVED
                                    )
                                )}
                            </Option>
                            <Option
                                value={
                                    EnumTeacherAbsentRequestStatus.REJECT_BY_ADMIN
                                }
                            >
                                {_.startCase(
                                    _.get(
                                        EnumTeacherAbsentRequestStatus,
                                        EnumTeacherAbsentRequestStatus.REJECT_BY_ADMIN
                                    )
                                )}
                            </Option>
                        </>
                    )}
                    {data?.status ===
                        EnumTeacherAbsentRequestStatus.APPROVED && (
                        <Option
                            value={
                                EnumTeacherAbsentRequestStatus.WITHDRAWN_BY_TEACHER
                            }
                        >
                            {_.startCase(
                                _.get(
                                    EnumTeacherAbsentRequestStatus,
                                    EnumTeacherAbsentRequestStatus.WITHDRAWN_BY_TEACHER
                                )
                            )}
                        </Option>
                    )}
                </Select>
            </Form.Item>

            <Form.Item label='Admin Note' name='admin_note'>
                <TextArea placeholder='Enter your note here...' />
            </Form.Item>
        </Form>
    )

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={onClose}
            title={`Confirm teacher leave/absent request - ${data?.teacher?.user?.full_name} - ${data?.teacher?.user?.username}`}
            width={700}
            footer={[
                <Button
                    key='approve'
                    type='primary'
                    shape='round'
                    onClick={onSubmit}
                    loading={loading}
                >
                    Submit
                </Button>
            ]}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AbsentRequestModal)
