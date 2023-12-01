import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Select } from 'antd'
import PageAPI from 'api/PageAPI'
import CategoryAPI from 'api/CategoryAPI'
import _ from 'lodash'
import { MODAL_TYPE, PAGE_STATUS } from 'const/status'
import { notify } from 'utils/notify'
import { IPage } from 'types'
import { createSlugsName } from 'utils'

const { Option } = Select

type Props = {
    data?: IPage
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const PageModal: FC<Props> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])

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

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            const category_ids = data.categories.map((item: any) => item?._id)
            form.setFieldsValue({
                ...data,
                categories: category_ids
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({
                is_support: false,
                status: PAGE_STATUS.DRAFT
            })
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
                PageAPI.createPage(payload)
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
                PageAPI.editPage(data._id, payload)
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

    const renderCategories = () =>
        categories.map((item, index) => (
            <Option key={index} value={item._id}>
                {item.name}
            </Option>
        ))
    const onValuesChange = (changedValues) => {
        if (_.has(changedValues, 'name')) {
            form.setFieldsValue({
                slug: createSlugsName(_.get(changedValues, 'name'))
            })
        }
    }
    const renderBody = () => (
        <Form
            name='basic'
            layout='horizontal'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
            onValuesChange={onValuesChange}
        >
            <Form.Item
                label='Name'
                name='name'
                labelAlign='left'
                labelCol={{ span: 4 }}
                rules={[
                    {
                        required: true,
                        message: 'Name is required'
                    }
                ]}
            >
                <Input placeholder='Enter name' />
            </Form.Item>
            <Form.Item
                label='Slug'
                name='slug'
                labelAlign='left'
                labelCol={{ span: 4 }}
                rules={[
                    {
                        required: true,
                        message: 'Slug is required'
                    }
                ]}
            >
                <Input placeholder='Enter slug' />
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
                    placeholder='Choose category for your page'
                >
                    {renderCategories()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Status'
                name='status'
                labelAlign='left'
                labelCol={{ span: 4 }}
            >
                <Select placeholder='Choose status for your page'>
                    <Option key={0} value={1}>
                        DRAFT
                    </Option>
                    <Option key={1} value={2}>
                        PUBLISH
                    </Option>
                </Select>
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
                    ? 'Create new Page'
                    : 'Edit page information'
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

export default memo(PageModal)
