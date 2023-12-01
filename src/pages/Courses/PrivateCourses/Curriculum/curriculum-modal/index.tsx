import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Image, Upload, Select } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ICurriculum } from 'types'
import UploadAPI from 'api/UploadAPI'
import CurriculumAPI from 'api/CurriculumAPI'
import { IModalProps } from 'const/common'

const { TextArea } = Input
const { Option } = Select

interface IProps extends IModalProps {
    data?: ICurriculum
    type: MODAL_TYPE
    refetchData: () => void
}

const CurriculumModal: FC<IProps> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [preview, setPreview] = useState<any>()
    const [fileUpload, setFileUpload] = useState<any>()

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
            if (data.image) {
                setPreview(data.image)
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
            setLoading(true)
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
                CurriculumAPI.createCurriculum(payload)
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
                CurriculumAPI.editCurriculum(data.id, payload)
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
                label='Age list'
                name='age_list'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Age list is required'
                    }
                ]}
            >
                <Select
                    mode='multiple'
                    style={{ width: '100%' }}
                    placeholder='Please select'
                >
                    <Option value={1}>KINDERGARTEN</Option>
                    <Option value={2}>KIDS</Option>
                    <Option value={3}>TEENS</Option>
                    <Option value={4}>ADULT</Option>
                </Select>
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
            maskClosable={true}
            centered
            closable
            visible={visible}
            onCancel={onClose}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new curriculum'
                    : 'Edit curriculum information'
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

export default memo(CurriculumModal)
