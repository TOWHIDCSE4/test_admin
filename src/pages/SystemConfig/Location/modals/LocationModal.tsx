import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Row, InputNumber, Col, Select } from 'antd'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ILocation } from 'types'
import LocationAPI from 'api/LocationAPI'

const { TextArea } = Input

type Props = {
    data?: ILocation
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const LocationModal: FC<Props> = ({
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
            form.setFieldsValue({ is_support: false, is_active: true })
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const onFinish = useCallback(
        async (values) => {
            const payload = {
                ...values
            }
            setLoading(true)
            if (type === MODAL_TYPE.ADD_NEW) {
                LocationAPI.createLocation(payload)
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
                LocationAPI.editLocation(data.id, payload)
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
            layout='vertical'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 22 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Row>
                <Col span={8}>
                    <Form.Item
                        label='Name'
                        name='name'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <Input placeholder='Enter name' />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Currency'
                        name='currency'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <Input placeholder='Enter currency' />
                    </Form.Item>
                </Col>
            </Row>

            <Row className='border p-2 mb-2'>
                <Col span={24}>
                    <h6>Config</h6>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Accept time (minutes)'
                        name='accept_time'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Accept time is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder='Enter Accept time'
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Cancel time (minutes)'
                        name='cancel_time'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Cancel time is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder='Enter Cancel time'
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Salary student absent (percent)'
                        name='percent_salary_student_absent'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <Input placeholder='Enter Percent salary student absent' />
                    </Form.Item>
                </Col>
            </Row>

            <Row className='border p-2  mb-2'>
                <Col span={24}>
                    <h6>Bonus</h6>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Weekend (number)'
                        name='weekend_bonus'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Conversion (number)'
                        name='conversion_bonus'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Attendance (number)'
                        name='attendance_bonus'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Referral (number)'
                        name='referral_bonus'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Substitute (percent)'
                        name='percent_substitute_bonus'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
            </Row>

            <Row className='border p-2  mb-2 '>
                <Col span={24}>
                    <h6>Fine</h6>
                </Col>

                <Col span={8}>
                    <Form.Item
                        label='Trial absent (percent)'
                        name='percent_absent_punish_trial'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='First 3 premiun absent (percent)'
                        name='percent_absent_punish_first_3_slot'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label='Absent without leave request(percent)'
                        name='percent_absent_punish'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label='Absent < 1h with leave request (percent)'
                        name='percent_absent_punish_1h'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label='Absent < 2h with leave request (percent)'
                        name='percent_absent_punish_2h'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label='Absent < 3h with leave request (percent)'
                        name='percent_absent_punish_3h'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label='Absent > 3h with leave request (number)'
                        name='absent_punish_greater_3h'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label='Late memo punish (number)'
                        name='late_memo_punish'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label='Over limit punish (number)'
                        name='over_limit_punish'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'This field is required'
                            }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
            </Row>
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
                    ? 'Create new location'
                    : 'Edit location information'
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

export default memo(LocationModal)
