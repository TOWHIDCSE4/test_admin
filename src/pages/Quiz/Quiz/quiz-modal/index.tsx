import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Row,
    InputNumber,
    Col,
    Select,
    Checkbox,
    Upload,
    Space
} from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz } from 'types'
import QuizAPI from 'api/QuizAPI'
import UploadAPI from 'api/UploadAPI'
import { IModalProps } from 'const/common'

const { TextArea } = Input
const { Option } = Select

interface IProps extends IModalProps {
    data?: IQuiz
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const QuizModal: FC<IProps> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState(false)
    const [isUploadFile, setUploadFile] = useState(false)

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ price: 0, score: 0 })
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const onFinish = useCallback(
        async (values) => {
            try {
                const payload = {
                    ...values
                }
                if (isUploadFile) {
                    if (payload?.file && payload.file?.file) {
                        setLoading(true)
                        if (type === MODAL_TYPE.ADD_NEW) {
                            const resHomeWork =
                                await UploadAPI.handleUploadHomeworkFile(
                                    payload.file?.file
                                )
                            QuizAPI.createQuizByUpload(resHomeWork)
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
                            const resHomeWork =
                                await UploadAPI.handleUploadHomeworkFile(
                                    payload.file?.file
                                )
                            QuizAPI.updateQuizByUpload(resHomeWork)
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
                    }
                } else {
                    setLoading(true)
                    if (type === MODAL_TYPE.ADD_NEW) {
                        QuizAPI.createQuizNEW(payload)
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
                        QuizAPI.updateQuizNEW(data.id, payload)
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
                }
            } catch (err) {
                notify('error', err.message)
            }
        },
        [type, form, isUploadFile]
    )
    const renderLevel = () =>
        _.keys(EnumQuizLevel)
            .filter((key: any) => !isNaN(Number(EnumQuizLevel[key])))
            .map((key) => (
                <Option key={key} value={EnumQuizLevel[key]}>
                    {_.startCase(key)}
                </Option>
            ))

    const onChangeCheckBox = (e) => {
        setUploadFile(e.target.checked)
    }
    const renderBody = () => (
        <>
            <div className='d-flex justify-content-end'>
                <Checkbox onChange={onChangeCheckBox} checked={isUploadFile}>
                    Upload file
                </Checkbox>
            </div>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
                initialValues={{ is_active: true }}
            >
                {!isUploadFile ? (
                    <>
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
                                        placeholder='Enter price'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Level'
                                    name='level'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Level is required'
                                        }
                                    ]}
                                >
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder='Choose level'
                                    >
                                        {renderLevel()}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Time limit (seconds)'
                                    name='time_limit'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Time limit is required'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        placeholder='Enter time limit'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Score (total point)'
                                    name='score'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Score is required'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        placeholder='Enter score'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Passed minimum'
                                    name='passed_minimum'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Passed minimum is required'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        placeholder='Enter passed minimum'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Instruction'
                                    name='instruction'
                                    labelAlign='left'
                                >
                                    <TextArea
                                        style={{ width: '100%' }}
                                        placeholder='Enter instruction'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Row>
                        <Col span={24}>
                            <Form.Item labelAlign='left'>
                                <div>
                                    <Space direction='horizontal' size={16}>
                                        <Form.Item name='file' className='mb-0'>
                                            <Upload
                                                listType='picture'
                                                maxCount={1}
                                                beforeUpload={() => false}
                                            >
                                                <Button
                                                    icon={<UploadOutlined />}
                                                >
                                                    Upload
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                        {/* <Button type='primary'>
                                            <a
                                                href={
                                                    process.env
                                                        .REACT_APP_TEMPLATE_HOMEWORK
                                                }
                                            >
                                                <DownloadOutlined /> Template
                                            </a>
                                        </Button> */}
                                    </Space>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            fontStyle: 'italic',
                                            color: 'red'
                                        }}
                                    >
                                        File size limit 10MB. Allowed file types
                                        XLSX
                                    </p>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
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
                    ? 'Create new quiz'
                    : 'Edit quiz information'
            }
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={form.submit}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
            width={500}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(QuizModal)
