import { useState, useEffect, FC } from 'react'
import { Modal, Form, Popconfirm, Button, Input, InputNumber } from 'antd'
import { notify } from 'utils/notify'
import {
    EnumTrialTestIeltsSubType,
    EnumTrialTestIeltsType,
    REGULAR_REQUEST_STATUS
} from 'const/status'
import RegularRequestAPI from 'api/RegularRequestAPI'
import _ from 'lodash'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import TrialTestIeltsResultAPI from 'api/TrialTestIeltsResultAPI'

const { TextArea } = Input
const baseTrialUrl = process.env.REACT_APP_LIBRARY_TEST_BASE_URL

type Props = {
    visible: boolean
    toggleModal: (val: boolean) => void
    data: any
    refetchData: () => void
}

const WritingGradingModal: FC<Props> = ({
    data,
    visible,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({
                note: data?.test_result_writing?.note,
                scores: data?.test_result_writing?.score
            })
        }
    }, [visible])

    const onClose = () => {
        form.resetFields()
        setLoading(false)
        toggleModal(false)
    }

    const onFinish = (values) => {
        setLoading(true)
        TrialTestIeltsResultAPI.editTrialTestIeltsResult(data.id, {
            note: values.note,
            type_result: EnumTrialTestIeltsType.IELTS_4_SKILLS,
            sub_type: EnumTrialTestIeltsSubType.WRITING,
            scores: values.scores
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
            title='Edit IELTS Writing Result'
            width={700}
            centered
            footer={[
                <Button
                    type='primary'
                    danger
                    className='mr-3'
                    onClick={onClose}
                >
                    Cancel
                </Button>,

                checkPermission(PERMISSIONS.amttir_edit) ? (
                    <Button
                        type='primary'
                        onClick={() => form.submit()}
                        loading={isLoading}
                    >
                        Save
                    </Button>
                ) : (
                    <></>
                )
            ]}
        >
            <Button
                type='primary'
                className='mb-4'
                onClick={() =>
                    window.open(
                        `${baseTrialUrl}${data?.test_result_writing?.sub_test_url}?code=${data?.test_result_writing?.test_result_code}&type=result`,
                        '_blank'
                    )
                }
            >
                View answer
            </Button>
            <br></br>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
            >
                <Form.Item
                    label='Score'
                    name='scores'
                    labelAlign='left'
                    rules={[
                        {
                            required: true,
                            message: `Score is required`
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '30%' }}
                        placeholder='score'
                        min='0'
                    />
                </Form.Item>
                <Form.Item label='Note' name='note' labelAlign='left'>
                    <TextArea placeholder='Note here' />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default WritingGradingModal
