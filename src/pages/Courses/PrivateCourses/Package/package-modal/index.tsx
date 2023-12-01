import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Switch,
    InputNumber,
    Upload,
    Image,
    Col,
    Select,
    Row
} from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import PackageAPI from 'api/PackageAPI'
import UploadAPI from 'api/UploadAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import {
    EnumPackageType,
    ICoupon,
    ILocation,
    IPackage,
    ISubject,
    EnumCouponType,
    EnumStudentType,
    EnumFrequencyType
} from 'types'
import CouponAPI from 'api/CouponAPI'
import { IModalProps } from 'const/common'

const { TextArea } = Input
const { Option } = Select

interface IProps extends IModalProps {
    data?: IPackage
    type: MODAL_TYPE
    locations: ILocation[]
    subjects: ISubject[]
    refetchData: () => void
}

const PackageModal: FC<IProps> = ({
    visible,
    data,
    type,
    locations,
    subjects,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [preview, setPreview] = useState<any>()
    const [fileUpload, setFileUpload] = useState<any>()
    const [packageType, setPackageType] = useState<any>()
    const [coupons, setCoupon] = useState<ICoupon[]>([])
    const fetchDiscounts = () => {
        CouponAPI.getCoupons({
            type: EnumCouponType.DISCOUNT,
            page_size: 100
        }).then((res) => {
            setCoupon(res.data)
        })
    }

    useEffect(() => {
        if (visible) {
            fetchDiscounts()
            if (type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
                form.setFieldsValue({
                    ...data
                })
                if (data.image) {
                    setPreview(data.image)
                }
                if (data.type) {
                    setPackageType(data.type)
                }
                if (data.renew_student_coupon) {
                    form.setFieldsValue({
                        renew_student_coupon_code:
                            data.renew_student_coupon.code
                    })
                }
                if (data.new_student_coupon) {
                    form.setFieldsValue({
                        new_student_coupon_code: data.new_student_coupon.code
                    })
                }
                if (!data.learning_frequency_type) {
                    form.setFieldsValue({
                        learning_frequency_type: EnumFrequencyType.NORMAL
                    })
                }
            }
            if (type === MODAL_TYPE.ADD_NEW) {
                form.setFieldsValue({
                    is_support: false,
                    is_active: true,
                    learning_frequency_type: EnumFrequencyType.NORMAL,
                    is_show_on_student_page: true
                })
            }
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        setPreview('')
        setFileUpload('')
        form.resetFields()
    }, [])

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => callback(reader.result))
        reader.readAsDataURL(img)
    }

    const beforeUpload = (file: any) => {
        const isJpgOrPng =
            file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJpgOrPng) {
            notify('error', 'You can only upload JPG/PNG file!')
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
            notify('error', 'Image must smaller than 2MB!')
            return false
        }
        return true
    }

    const uploadButton = (
        <>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className='ml-1'>Upload</div>
        </>
    )
    const onChange = (info: any) => {
        if (beforeUpload(info.file)) {
            getBase64(info.file, (imageUrl: any) => {
                setPreview(imageUrl)
            })
            setFileUpload(info.file)
        }
    }

    const handleUploadImage = async (_file: any) => {
        try {
            const res = await UploadAPI.uploadImage(_file)
            return res
        } catch (err) {
            notify('error', err.message || 'Upload image error')
        }
    }

    const onFinish = useCallback(
        async (values) => {
            const payload = {
                ...values
            }
            setLoading(true)
            if (fileUpload) {
                const imgUrl = await handleUploadImage(fileUpload)
                payload.image = imgUrl
            }
            if (type === MODAL_TYPE.ADD_NEW) {
                PackageAPI.createPackage(payload)
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
                PackageAPI.editPackage(data.id, payload)
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
        [type, form, fileUpload]
    )

    const renderLocations = () =>
        locations.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.name}
            </Option>
        ))
    const renderSubjects = () =>
        subjects.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.name}
            </Option>
        ))
    const renderPackageTypes = () =>
        Object.keys(EnumPackageType)
            .filter((key: any) => !isNaN(Number(EnumPackageType[key])))
            .filter((key) => key !== 'ALL_TYPE')
            .reverse()
            .map((key: any) => (
                <Option value={EnumPackageType[key]} key={EnumPackageType[key]}>
                    {_.upperCase(key)}
                </Option>
            ))
    const renderDiscountForNewStudent = () =>
        coupons
            .filter(
                (x) =>
                    x.student_type === EnumStudentType.NEW &&
                    x.package_type === packageType
            )
            .map((item, index) => (
                <Option value={item.code} key={item.id}>
                    {`${_.get(EnumPackageType, item.package_type)}|${
                        item.title
                    }|${item.percentage_off}%`}
                </Option>
            ))

    const renderDiscountForReNewStudent = () =>
        coupons
            .filter(
                (x) =>
                    x.student_type === EnumStudentType.RENEW &&
                    x.package_type === _.toInteger(packageType)
            )
            .map((item, index) => (
                <Option value={item.code} key={item.id}>
                    {`${_.get(EnumPackageType, item.package_type)}|${
                        item.title
                    }|${item.percentage_off}%`}
                </Option>
            ))

    const renderLearningFrequencyTypes = () =>
        Object.keys(EnumFrequencyType)
            .filter((key: any) => !isNaN(Number(EnumFrequencyType[key])))
            .filter((key) => key !== 'ALL_TYPE')
            .reverse()
            .map((key: any) => (
                <Option
                    value={EnumFrequencyType[key]}
                    key={EnumFrequencyType[key]}
                >
                    {_.upperCase(key)}
                </Option>
            ))
    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 22 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true, is_show_on_student_page: true }}
        >
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Name'
                        name='name'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Name package is required'
                            }
                        ]}
                    >
                        <Input placeholder='Enter name package' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Description'
                        name='description'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Description is required'
                            }
                        ]}
                    >
                        <TextArea placeholder='Enter description' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label='Number classes'
                        name='number_class'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Number classes is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder='Enter Number classes'
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Day of use'
                        name='day_of_use'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Day of use is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder='Enter Day of use'
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Price'
                        name='price'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Price is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder='Enter Price'
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label='Package type'
                        name='type'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Package type is required'
                            }
                        ]}
                    >
                        <Select
                            placeholder='Choose package type'
                            onChange={(val) => {
                                setPackageType(val)
                                form.setFieldsValue({
                                    new_student_coupon_code: null,
                                    renew_student_coupon_code: null
                                })
                                if (
                                    data?.new_student_coupon &&
                                    data?.new_student_coupon.package_type ===
                                        val
                                ) {
                                    form.setFieldsValue({
                                        new_student_coupon_code:
                                            data?.new_student_coupon.code
                                    })
                                }
                                if (
                                    data?.renew_student_coupon &&
                                    data?.renew_student_coupon.package_type ===
                                        val
                                ) {
                                    form.setFieldsValue({
                                        renew_student_coupon_code:
                                            data?.renew_student_coupon.code
                                    })
                                }
                            }}
                        >
                            {renderPackageTypes()}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        label='Apply for teacher'
                        name='location_id'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Location is required'
                            }
                        ]}
                    >
                        <Select placeholder='Choose location to apply for teacher'>
                            <Option value={-1}>All</Option>
                            {renderLocations()}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Subject'
                        name='subject_id'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Subject is required'
                            }
                        ]}
                    >
                        <Select placeholder='Choose subject'>
                            {renderSubjects()}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label='Discount for new student'
                        name='new_student_coupon_code'
                        labelAlign='left'
                    >
                        <Select placeholder='Choose discount'>
                            {renderDiscountForNewStudent()}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Discount for renew student'
                        name='renew_student_coupon_code'
                        labelAlign='left'
                    >
                        <Select placeholder='Choose discount'>
                            {renderDiscountForReNewStudent()}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Learning frequency type'
                        name='learning_frequency_type'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Learning frequency type is required'
                            }
                        ]}
                    >
                        <Select
                            placeholder='Choose frequency Type'
                            defaultValue={
                                data?.learning_frequency_type ??
                                EnumFrequencyType.NORMAL
                            }
                        >
                            {renderLearningFrequencyTypes()}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label='Support Booking'
                        name='is_support'
                        labelAlign='left'
                        valuePropName='checked'
                    >
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Active package'
                        name='is_active'
                        labelAlign='left'
                        valuePropName='checked'
                    >
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label='Show on the student page'
                        name='is_show_on_student_page'
                        labelAlign='left'
                        valuePropName='checked'
                    >
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item label='Upload image' labelAlign='left'>
                        <Upload
                            name='avatar'
                            listType='picture-card'
                            accept='image/*'
                            showUploadList={false}
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={onChange}
                            className='mt-3'
                        >
                            {preview ? (
                                <Image
                                    src={preview}
                                    preview={false}
                                    width='100%'
                                />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
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
                    ? 'Create new package'
                    : 'Edit package information'
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

export default memo(PackageModal)
