import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Upload, Image, Select } from 'antd'
import PostAPI from 'api/PostAPI'
import UploadAPI from 'api/UploadAPI'
import CategoryAPI from 'api/CategoryAPI'
import AuthAPI from 'api/AuthAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { IPost } from 'types'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import './index.css'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'

const { Option } = Select

const { TextArea } = Input

interface IProps extends IModalProps {
    data?: IPost
    type: MODAL_TYPE
    refetchData: () => void
}

const PostModal: FC<IProps> = ({
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
    const [categories, setCategories] = useState([])
    const [author, setAuthor] = useState([])

    const getCategories = () => {
        CategoryAPI.getCategories()
            .then((res) => {
                setCategories(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getCategories()
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

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            const category_ids = data.categories.map((item: any) => item?._id)
            form.setFieldsValue({
                ...data,
                categories: category_ids
            })
            if (data.image) {
                setPreview(data.image)
            }
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ is_support: false, is_active: true })
            form.setFieldsValue({
                author
            })
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
                PostAPI.createPost(payload)
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
                PostAPI.editPost(data._id, payload)
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

    const renderCategories = () =>
        categories.map((item, index) => (
            <Option key={index} value={item._id}>
                {item.name}
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
                label='Title'
                name='title'
                labelAlign='left'
                labelCol={{ span: 4 }}
                rules={[
                    {
                        required: true,
                        message: 'Title is required'
                    }
                ]}
            >
                <Input placeholder='Enter title' />
            </Form.Item>
            <Form.Item
                label='Category'
                name='categories'
                labelAlign='left'
                labelCol={{ span: 4 }}
                rules={[
                    {
                        required: true,
                        message: 'Category is required'
                    }
                ]}
            >
                <Select
                    mode='multiple'
                    placeholder='Choose category for your post'
                >
                    {renderCategories()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Author'
                name='author'
                labelAlign='left'
                labelCol={{ span: 4 }}
                rules={[
                    {
                        required: true,
                        message: 'Author is required'
                    }
                ]}
            >
                <Input placeholder='Enter author' />
            </Form.Item>
            <Form.Item
                label='Description'
                name='description'
                labelAlign='left'
                labelCol={{ span: 4 }}
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
                label='Status'
                name='status'
                labelAlign='left'
                labelCol={{ span: 4 }}
            >
                <Select placeholder='Choose status for your post'>
                    <Option key={0} value={0}>
                        DRAFT
                    </Option>
                    <Option key={1} value={1}>
                        PUBLIC
                    </Option>
                </Select>
            </Form.Item>
            <Form.Item
                label='Content'
                name='content'
                labelAlign='left'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[
                    {
                        required: true,
                        message: 'Content is required'
                    }
                ]}
            >
                <TextEditor />
            </Form.Item>
            <Form.Item
                label='Upload image'
                labelAlign='left'
                labelCol={{ span: 4 }}
            >
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
            className='customModal'
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new Post'
                    : 'Edit post information'
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

export default memo(PostModal)
