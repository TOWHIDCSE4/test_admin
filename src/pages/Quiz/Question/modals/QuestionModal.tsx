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
    Spin,
    Space,
    Upload,
    Tag
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumQuestionType, IAnswers, IQuestion } from 'types'
import QuestionAPI from 'api/QuestionAPI'
import UploadAPI from 'api/UploadAPI'
import Answer from './Answer'

const { TextArea } = Input
const { Option } = Select
type Props = {
    data?: IQuestion
    visible: boolean
    type: MODAL_TYPE
    typeSearch: any
    toggleModal: (val: boolean) => void
    refetchData: (typeSearch: any) => void
}

const QuestionModal: FC<Props> = ({
    visible,
    data,
    type,
    typeSearch,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [answers, setAnswers] = useState<IAnswers[]>([])

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
            setAnswers(data.answers)
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ price: 0, score: 0 })
        }
    }, [visible])

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        return res
    }

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const onChangeAnswer = useCallback(
        (_values) => {
            setAnswers(_values)
        },
        [answers]
    )
    const onFinish = useCallback(
        async (values) => {
            const payload = {
                ...values,
                answers
            }
            if (payload.image && payload.image.file) {
                const imageUploaded = await uploadFile(payload.image.file)
                payload.image = imageUploaded
            }
            if (payload.audio && payload.audio.file) {
                const audioUploaded = await uploadFile(payload.audio.file)
                payload.audio = audioUploaded
            }
            if (payload.video && payload.video.file) {
                const videoUploaded = await uploadFile(payload.video.file)
                payload.video = videoUploaded
            }
            if (answers && answers.length > 0) {
                const count = answers.filter((x) => x?.is_correct)
                if (count.length === 0) {
                    notify(
                        'error',
                        'The question requires at least 1 correct answer'
                    )
                } else if (
                    count.length > 1 &&
                    form.getFieldValue('question_type') ===
                        EnumQuestionType.ONE_CHOICE
                ) {
                    notify(
                        'error',
                        'The once choice question requires only 1 correct answer'
                    )
                } else {
                    setLoading(true)
                    if (type === MODAL_TYPE.ADD_NEW) {
                        QuestionAPI.createQuestionNEW(payload)
                            .then((res) => {
                                notify('success', 'Create successfully')
                                onClose()
                                refetchData(typeSearch)
                            })
                            .catch((err) => {
                                notify('error', err.message)
                            })
                            .finally(() => setLoading(false))
                    } else if (type === MODAL_TYPE.EDIT) {
                        QuestionAPI.editQuestionNEW(data.id, payload)
                            .then((res) => {
                                notify('success', 'Update successfully')
                                onClose()
                                refetchData(typeSearch)
                            })
                            .catch((err) => {
                                notify('error', err.message)
                            })
                            .finally(() => setLoading(false))
                    }
                }
            } else {
                notify('error', 'The question requires at least 1 answer')
            }
        },
        [type, form, answers]
    )
    const renderQuestionType = () =>
        _.keys(EnumQuestionType)
            .filter((key: any) => !isNaN(Number(EnumQuestionType[key])))
            .map((key) => (
                <Option key={key} value={EnumQuestionType[key]}>
                    {_.startCase(key)}
                </Option>
            ))
    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }
    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
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
                        <TextArea placeholder='Enter question' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Description'
                        name='description'
                        labelAlign='left'
                    >
                        <TextArea placeholder='Enter description' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Question type'
                        name='question_type'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Question type is required'
                            }
                        ]}
                    >
                        <Select
                            style={{ width: '100%' }}
                            placeholder='Choose question type'
                        >
                            {renderQuestionType()}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            {/* <Row>
                <Col span={24}>
                    <Form.Item
                        label='Display order'
                        name='display_order'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'Display order is required'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            placeholder='Enter display order'
                        />
                    </Form.Item>
                </Col>
            </Row> */}
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Image'
                        name='image'
                        labelAlign='left'
                        help={
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    color: 'red'
                                }}
                            >
                                File size limit 10MB.
                            </span>
                        }
                        className='mb-2'
                    >
                        <Upload
                            listType='picture'
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Space direction='horizontal' size={16}>
                                <Button icon={<UploadOutlined />}>
                                    Upload
                                </Button>
                                {data?.image && (
                                    <div
                                        className='clickable'
                                        onClick={() =>
                                            window.open(
                                                hasHttpUrl(data?.image)
                                                    ? data.image
                                                    : `https://ispeak.vn/${data?.image}`,
                                                '_blank'
                                            )
                                        }
                                        title={data?.image || 'View image'}
                                    >
                                        <Tag color='processing'>
                                            Current image
                                        </Tag>
                                    </div>
                                )}
                            </Space>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Audio'
                        name='audio'
                        labelAlign='left'
                        help={
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    color: 'red'
                                }}
                            >
                                File size limit 10MB.
                            </span>
                        }
                        className='mb-2'
                    >
                        <Upload
                            listType='text'
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Space direction='horizontal' size={16}>
                                <Button icon={<UploadOutlined />}>
                                    Upload
                                </Button>
                                {data?.audio && (
                                    <div
                                        className='clickable'
                                        onClick={() =>
                                            window.open(
                                                hasHttpUrl(data?.audio)
                                                    ? data.audio
                                                    : `https://ispeak.vn/${data?.audio}`,
                                                '_blank'
                                            )
                                        }
                                        title={data?.audio || 'Listen audio'}
                                    >
                                        <Tag color='processing'>
                                            Current audio
                                        </Tag>
                                    </div>
                                )}
                            </Space>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item
                        label='Video'
                        name='video'
                        labelAlign='left'
                        help={
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    color: 'red'
                                }}
                            >
                                File size limit 10MB
                            </span>
                        }
                        className='mb-2'
                    >
                        <Upload
                            listType='text'
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Space direction='horizontal' size={16}>
                                <Button icon={<UploadOutlined />}>
                                    Upload
                                </Button>
                                {data?.video && (
                                    <div
                                        className='clickable'
                                        onClick={() =>
                                            window.open(
                                                hasHttpUrl(data?.video)
                                                    ? data.video
                                                    : `https://ispeak.vn/${data?.video}`,
                                                '_blank'
                                            )
                                        }
                                        title={data?.video || 'View video'}
                                    >
                                        <Tag color='processing'>
                                            Current video
                                        </Tag>
                                    </div>
                                )}
                            </Space>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Answer
                    data={answers}
                    type={form.getFieldValue('question_type')}
                    onChange={onChangeAnswer}
                    modalType={type}
                />
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
                    ? 'Create new question'
                    : 'Edit question information'
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

export default memo(QuestionModal)
