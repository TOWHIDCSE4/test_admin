import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Switch,
    InputNumber,
    Space,
    Row,
    Col
} from 'antd'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ILocation } from 'types'

type Props = {
    data?: any
    visible: boolean
    type: MODAL_TYPE
    locations: ILocation[]
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const TeacherLevelModal: FC<Props> = ({
    visible,
    data,
    type,
    locations,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            const newLocations: any = [...locations].map((x: ILocation) => {
                const check = _.find(data.hourly_rates, function (o) {
                    return o.location_id === x.id
                })
                if (check) {
                    return check
                }
                const tmp = {
                    location_id: x.id
                }
                return tmp
            })
            form.setFieldsValue({
                ...data,
                hourly_rates: [...newLocations]
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            const newLocations: any = [...locations].map((x: ILocation) => {
                const tmp = {
                    location_id: x.id
                }
                return tmp
            })
            form.setFieldsValue({ hourly_rates: newLocations })
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
                TeacherLevelAPI.createTeacherLevel(values)
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
                TeacherLevelAPI.editTeacherLevel(data.id, values)
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

    const getLocationName = (location_id: number) => {
        const location = locations.filter(
            (x: ILocation) => x.id === location_id
        )
        if (location[0]) return location[0].name
    }
    const renderBody = () => (
        <Form
            name='basic'
            layout='horizontal'
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
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
                        message: 'Name level is required'
                    }
                ]}
            >
                <Input placeholder='Enter name level' />
            </Form.Item>
            <Form.Item
                label='Min open slots/Circle'
                name='min_calendar_per_circle'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Min open slots is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder='Enter Min open slots'
                />
            </Form.Item>
            <Form.Item
                label='Min peak time slots/Circle'
                name='min_peak_time_per_circle'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Min peak time slots is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder='Enter Min peak time slots'
                />
            </Form.Item>
            <Form.Item
                label='Max missed classes/Circle'
                name='max_missed_class_per_circle'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Max missed classes is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder='Enter Max missed classes'
                />
            </Form.Item>
            <Form.Item
                label='Max request Absent/Circle'
                name='max_absent_request_per_circle'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Max request Absent is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder='Enter Max request Absent'
                />
            </Form.Item>
            <Form.Item
                label='Accumulated classes for promotion'
                name='class_accumulated_for_promotion'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Accumulated classes is required'
                    }
                ]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder='Enter Accumulated classes for promotion'
                />
            </Form.Item>
            <Form.Item
                label='Active'
                name='is_active'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Active is required'
                    }
                ]}
            >
                <Switch defaultChecked />
            </Form.Item>
            <Form.Item label='Rate for location' labelAlign='left' />
            <Form.List name='hourly_rates'>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field) => (
                            <Row key={field.key}>
                                <Col span={10}>
                                    <Form.Item
                                        name={[field.name, 'location_id']}
                                        // fieldKey={[
                                        //     field.fieldKey,
                                        //     'location_id'
                                        // ]}
                                        labelCol={{ span: 0 }}
                                    >
                                        <b>
                                            {getLocationName(
                                                form.getFieldValue(
                                                    `hourly_rates`
                                                )[field.name].location_id
                                            )}
                                        </b>
                                    </Form.Item>
                                </Col>
                                <Col span={14}>
                                    <Form.Item
                                        name={[field.name, 'hourly_rate']}
                                        // fieldKey={[
                                        //     field.fieldKey,
                                        //     'hourly_rate'
                                        // ]}
                                        labelCol={{ span: 0 }}
                                        wrapperCol={{ span: 24 }}
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Hourly Rate is required'
                                            }
                                        ]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            placeholder='Hourly Rate for each location'
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}
                    </>
                )}
            </Form.List>
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
                    ? 'Create new teacher level'
                    : 'Edit teacher level information'
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

export default memo(TeacherLevelModal)
