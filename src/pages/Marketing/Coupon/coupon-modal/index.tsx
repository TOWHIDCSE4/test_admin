import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    InputNumber,
    Row,
    Col,
    Select,
    DatePicker
} from 'antd'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import {
    EnumCouponType,
    EnumPackageType,
    EnumStudentType,
    ICoupon
} from 'types'
import UploadImage from 'core/Atoms/UploadImage'
import moment from 'moment'
import CouponAPI from 'api/CouponAPI'
import { FULL_DATE_FORMAT, IModalProps } from 'const'
import { renderUid } from 'utils/common'

const { Option } = Select
const { TextArea } = Input

interface IProps extends IModalProps {
    data?: ICoupon
    type: MODAL_TYPE
    refetchData: () => void
}

const CouponModal: FC<IProps> = ({
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
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data,
                start_time_shown: moment(data.start_time_shown),
                end_time_shown: moment(data.end_time_shown),
                start_time_applied: moment(data.start_time_applied),
                end_time_applied: moment(data.end_time_applied)
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({
                code: renderUid().toUpperCase().substring(0, 8)
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
            const payload = {
                ...values,
                start_time_shown: values.start_time_shown.valueOf(),
                end_time_shown: values.end_time_shown.valueOf(),
                start_time_applied: values.start_time_applied.valueOf(),
                end_time_applied: values.end_time_applied.valueOf()
            }
            if (image) payload.image = image
            if (type === MODAL_TYPE.ADD_NEW) {
                CouponAPI.createCoupon(payload)
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
                CouponAPI.editCoupon(data.id, payload)
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
        [type, form, image]
    )

    const onChangeForm = (changedValues, allValues) => {
        if (allValues?.code) {
            form.setFieldsValue({
                code: _.get(allValues, 'code').toUpperCase()
            })
        }
        if (allValues?.start_time_shown) {
            form.setFieldsValue({
                start_time_shown: _.get(allValues, 'start_time_shown').startOf(
                    'd'
                )
            })
        }
        if (allValues?.start_time_applied) {
            form.setFieldsValue({
                start_time_applied: _.get(
                    allValues,
                    'start_time_applied'
                ).startOf('d')
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

    const afterUpload = (url) => {
        setImage(url)
    }

    const onRemoveAvatar = (file) => {
        setImage('')
        return true
    }

    const renderBody = () => (
        <>
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
                                          uid: data?.id.toString()
                                      }
                                  ]
                                : null
                        }
                    />
                </div>
            </Row>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
                onValuesChange={onChangeForm}
            >
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        <Form.Item
                            label='Coupon Code'
                            name='code'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Enter Coupon Code'
                                }
                            ]}
                        >
                            <Input placeholder='Enter Coupon Code' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Title'
                            name='title'
                            labelAlign='left'
                            rules={[{ required: true, message: 'Enter title' }]}
                        >
                            <Input placeholder='Enter title' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[10, 10]}>
                    <Col span={24}>
                        <Form.Item
                            label='Content'
                            name='content'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Enter content'
                                }
                            ]}
                        >
                            <TextArea placeholder='Enter content' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        <Form.Item
                            label='Type'
                            name='type'
                            labelAlign='left'
                            rules={[
                                { required: true, message: 'Type is required' }
                            ]}
                        >
                            <Select placeholder='Choose type'>
                                <Option value={EnumCouponType.DISCOUNT}>
                                    {_.startCase(
                                        _.get(
                                            EnumCouponType,
                                            EnumCouponType.DISCOUNT
                                        )
                                    )}
                                </Option>
                                <Option value={EnumCouponType.SALE_OFF}>
                                    {_.startCase(
                                        _.get(
                                            EnumCouponType,
                                            EnumCouponType.SALE_OFF
                                        )
                                    )}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Percentage off (%)'
                            name='percentage_off'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Percentage off is required'
                                }
                            ]}
                        >
                            <InputNumber
                                className='w-100'
                                placeholder='Enter Percentage off'
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        <Form.Item
                            label='Apply for package'
                            name='package_type'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Apply for package is required'
                                }
                            ]}
                        >
                            <Select placeholder='Choose Apply for package'>
                                <Option value={EnumPackageType.ALL_TYPE}>
                                    {_.startCase(
                                        _.get(
                                            EnumPackageType,
                                            EnumPackageType.ALL_TYPE
                                        )
                                    )}
                                </Option>
                                <Option value={EnumPackageType.TRIAL}>
                                    {_.startCase(
                                        _.get(
                                            EnumPackageType,
                                            EnumPackageType.TRIAL
                                        )
                                    )}
                                </Option>
                                <Option value={EnumPackageType.STANDARD}>
                                    {_.startCase(
                                        _.get(
                                            EnumPackageType,
                                            EnumPackageType.STANDARD
                                        )
                                    )}
                                </Option>
                                <Option value={EnumPackageType.PREMIUM}>
                                    {_.startCase(
                                        _.get(
                                            EnumPackageType,
                                            EnumPackageType.PREMIUM
                                        )
                                    )}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Apply for student'
                            name='student_type'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Apply for student is required'
                                }
                            ]}
                        >
                            <Select placeholder='Choose Apply for student'>
                                <Option value={EnumStudentType.ALL_TYPE}>
                                    {_.startCase(
                                        _.get(
                                            EnumStudentType,
                                            EnumStudentType.ALL_TYPE
                                        )
                                    )}
                                </Option>
                                <Option value={EnumStudentType.RENEW}>
                                    {_.startCase(
                                        _.get(
                                            EnumStudentType,
                                            EnumStudentType.RENEW
                                        )
                                    )}
                                </Option>
                                <Option value={EnumStudentType.NEW}>
                                    {_.startCase(
                                        _.get(
                                            EnumStudentType,
                                            EnumStudentType.NEW
                                        )
                                    )}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        <Form.Item
                            label='Min age'
                            name='min_age'
                            labelAlign='left'
                        >
                            <InputNumber
                                className='w-100'
                                placeholder='Enter Min age'
                                min={1}
                                max={100}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Max age'
                            name='max_age'
                            labelAlign='left'
                        >
                            <InputNumber
                                className='w-100'
                                placeholder='Enter Max age'
                                min={1}
                                max={100}
                            />
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
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        <Form.Item
                            labelAlign='left'
                            name='start_time_applied'
                            label='Start time applied'
                            rules={[
                                {
                                    required: true,
                                    message: 'Start time applied is required'
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
                            name='end_time_applied'
                            label='End time applied'
                            rules={[
                                {
                                    required: true,
                                    message: 'End time applied is required'
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
            </Form>
        </>
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
                    ? 'Create new coupon'
                    : 'Edit coupon information'
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

export default memo(CouponModal)
