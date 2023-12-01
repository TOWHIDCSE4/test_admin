import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Upload, Image, Select, Switch } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import CourseAPI from 'api/CourseAPI'
import UploadAPI from 'api/UploadAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import {
    EnumCourseTag,
    EnumCourseType,
    ICourse,
    ICurriculum,
    IPackage,
    ISubject
} from 'types'
import { IModalProps } from 'const/common'

const { TextArea } = Input
const { Option } = Select

interface IProps extends IModalProps {
    data?: ICourse
    type: MODAL_TYPE
    packages: IPackage[]
    subjects: ISubject[]
    curriculums: ICurriculum[]
    refetchData: () => void
    toggleModalConfirm?: (val: any) => void
    setValidateRemoveCourse?: (val: any) => void
}

const CourseModal: FC<IProps> = ({
    visible,
    data,
    type,
    packages,
    subjects,
    curriculums,
    toggleModal,
    refetchData,
    toggleModalConfirm,
    setValidateRemoveCourse
}) => {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)
    const [preview, setPreview] = useState<any>()
    const [fileUpload, setFileUpload] = useState<any>()

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            if (data && !data.course_type) {
                data.course_type = EnumCourseType.Regular
            }
            form.setFieldsValue({
                ...data
            })
            if (data.image) {
                setPreview(data.image)
            }
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ is_support: false, is_active: true })
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
            } else if (data && data.image) {
                payload.image = data.image
            }
            if (type === MODAL_TYPE.ADD_NEW) {
                CourseAPI.createCourse(payload)
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
                CourseAPI.editCourse(data.id, payload)
                    .then((res) => {
                        if (
                            !_.isEmpty(res) &&
                            !_.isEmpty(res.booked_data) &&
                            (!_.isEmpty(res.booked_data.bookings) ||
                                !_.isEmpty(res.booked_data.regular_calendars))
                        ) {
                            if (setValidateRemoveCourse)
                                setValidateRemoveCourse(res.booked_data)
                            if (toggleModalConfirm) toggleModalConfirm(true)
                            onClose()
                        } else {
                            notify('success', 'Update successfully')
                            refetchData()
                            onClose()
                        }
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [type, form, fileUpload]
    )

    const renderPackages = () =>
        packages
            .filter((x) => x.is_active)
            .map((item, index) => (
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

    const renderTags = () =>
        Object.keys(EnumCourseTag).map((key: any) => (
            <Option value={EnumCourseTag[key]} key={key}>
                {_.startCase(EnumCourseTag[key])}
            </Option>
        ))

    const renderCurriculums = () =>
        curriculums.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.name}
            </Option>
        ))

    const onChangePackages = (val) => {
        if (val.includes('all')) {
            form.setFieldsValue({
                package_id_list: packages
                    .filter((x) => x.is_active)
                    .map((item) => item.id)
            })
        }
    }

    const renderCourseType = () =>
        Object.keys(EnumCourseType).map((key: any) => (
            <Option value={EnumCourseType[key]} key={key}>
                {_.startCase(key)}
            </Option>
        ))

    const renderBody = () => (
        <Form
            name='basic'
            layout='horizontal'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
                        message: 'Name package is required'
                    }
                ]}
            >
                <Input placeholder='Enter name package' />
            </Form.Item>
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
                <Select placeholder='Choose subject'>{renderSubjects()}</Select>
            </Form.Item>
            <Form.Item
                label='Course type'
                name='course_type'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Course type is required'
                    }
                ]}
            >
                <Select placeholder='Choose course type'>
                    {renderCourseType()}
                </Select>
            </Form.Item>
            <Form.Item label='Tags' name='tags' labelAlign='left'>
                <Select placeholder='Choose tags' mode='tags'>
                    {renderTags()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Package'
                name='package_id_list'
                labelAlign='left'
                extra='If empty, course will apply to all package, includes In-active package and Active package'
            >
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: '100%', width: 'auto' }}
                    placeholder='Choose packages'
                    optionFilterProp='children'
                    mode='tags'
                    onChange={onChangePackages}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Option value='all'>Choose All</Option>
                    {renderPackages()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Curriculums'
                name='curriculum_id'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Curriculums is required'
                    }
                ]}
            >
                <Select placeholder='Choose Curriculums'>
                    {renderCurriculums()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Active'
                name='is_active'
                labelAlign='left'
                valuePropName='checked'
            >
                <Switch />
            </Form.Item>
            <Form.Item label='Upload image' labelAlign='left'>
                <Upload
                    name='avatar'
                    listType='picture-card'
                    accept='image/*'
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={onChange}
                >
                    {preview ? (
                        <Image src={preview} preview={false} width='100%' />
                    ) : (
                        uploadButton
                    )}
                </Upload>
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
                    ? 'Create new course'
                    : 'Edit course information'
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

export default memo(CourseModal)
