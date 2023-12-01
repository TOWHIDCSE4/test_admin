import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Upload, Image } from 'antd'
import CategoryAPI from 'api/CategoryAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ICategory } from 'types'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import UploadAPI from 'api/UploadAPI'

const { TextArea } = Input

type Props = {
    data?: ICategory
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const CategoryModal: FC<Props> = ({
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

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
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
                CategoryAPI.createCategory(payload)
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
                CategoryAPI.editCategory(data._id, payload)
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
                        message: 'Name category is required'
                    }
                ]}
            >
                <Input placeholder='Enter name category' />
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
            <Form.Item label='Upload image' labelAlign='left'>
                <Upload
                    name='image'
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
                    ? 'Create new Category'
                    : 'Edit category information'
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

export default memo(CategoryModal)
