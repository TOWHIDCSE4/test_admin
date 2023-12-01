import { useState, useEffect, FC } from 'react'
import { Modal, Form, Popconfirm, Button, Input } from 'antd'
import { notify } from 'utils/notify'
import { REGULAR_REQUEST_STATUS } from 'const/status'
import RegularRequestAPI from 'api/RegularRequestAPI'
import _ from 'lodash'
import { IRegularRequest } from 'types'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { TextArea } = Input

type Props = {
    data: IRegularRequest
    visible: boolean
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const ConfirmRegularRequestDialog: FC<Props> = ({
    data,
    visible,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({ ...data })
        }
    }, [visible])

    const onClose = () => {
        form.resetFields()
        setLoading(false)
        toggleModal(false)
    }

    const onFinish = (values) => {
        setLoading(true)
        RegularRequestAPI.editRegularRequest(data.id, {
            admin_note: values.admin_note,
            status: REGULAR_REQUEST_STATUS.CONFIRMED
        })
            .then((res) => {
                notify('success', 'Successfully')
                onClose()
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const onReject = () => {
        setLoading(true)
        RegularRequestAPI.editRegularRequest(data.id, {
            admin_note: form.getFieldValue('admin_note'),
            status: REGULAR_REQUEST_STATUS.CANCELED
        })
            .then((res) => {
                notify('success', 'Successfully')
                onClose()
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    return (
        <Modal
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Review teacher'
            width={700}
            centered
            footer={[
                checkPermission(PERMISSIONS.trr_reject) ? (
                    <Popconfirm
                        key='reject'
                        title='Are you sure to reject this teacher?'
                        onConfirm={onReject}
                        okText='Yes'
                        cancelText='No'
                    >
                        <Button
                            type='primary'
                            danger
                            disabled={
                                isLoading ||
                                data?.status !== REGULAR_REQUEST_STATUS.PENDING
                            }
                            className='mr-3'
                        >
                            Reject
                        </Button>
                    </Popconfirm>
                ) : (
                    <></>
                ),
                checkPermission(PERMISSIONS.trr_approve) ? (
                    <Popconfirm
                        key='review'
                        title='Are you sure to reviewed this teacher?'
                        onConfirm={onFinish}
                        okText='Yes'
                        cancelText='No'
                    >
                        <Button
                            type='primary'
                            disabled={
                                isLoading ||
                                data?.status !== REGULAR_REQUEST_STATUS.PENDING
                            }
                        >
                            Approve
                        </Button>
                    </Popconfirm>
                ) : (
                    <></>
                )
            ]}
        >
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
            >
                <Form.Item
                    label='Teacher'
                    name={['teacher', 'user', 'full_name']}
                    labelAlign='left'
                >
                    <Input placeholder='Teacher' disabled />
                </Form.Item>
                <Form.Item label='Note' name='admin_note' labelAlign='left'>
                    <TextArea placeholder='Admin note here' />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ConfirmRegularRequestDialog
