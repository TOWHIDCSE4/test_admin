import {
    Button,
    Select,
    Modal,
    Form,
    Row,
    Col,
    Input,
    Upload,
    Space
} from 'antd'
import { FC, memo, useCallback, useReducer, useState } from 'react'
import {
    UploadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { DATE_FORMAT, IModalProps, encodeFilenameFromLink } from 'const'
import UploadAPI from 'api/UploadAPI'
import AdviceLetterAPI from 'api/AdviceLetterAPI'
import { notify } from 'utils/notify'
import UserAPI from 'api/UserAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import StudentAPI from 'api/StudentAPI'

const { Option } = Select
interface IProps extends IModalProps {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    updateData: () => void
}

const AddAdviceLetterModel: FC<IProps> = ({
    visible,
    data,
    toggleModal,
    updateData
}) => {
    const [form] = Form.useForm()
    const [showRequired, setShowRequired] = useState(false)
    const [loading, setLoading] = useState(false)
    const student = data?.student
    const file = data?.file
    const file_name = data?.file_name
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            student_id: null,
            file_upload: null,
            file: null
        }
    )

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        return res
    }

    const onFinish = useCallback(
        async (value) => {
            const dataPost: any = {
                id: data?._id,
                student_id:
                    value.student_id ||
                    (data?.user?.id === undefined ? undefined : data.user.id),
                file_name: value.file_name
            }

            if (values.file) {
                setLoading(true)
                const fileUpload = await uploadFile(values.file)
                dataPost.file = fileUpload
            } else {
                setShowRequired(true)
                return
            }
            AdviceLetterAPI.createAdviceLetterForLearningAssessment(dataPost)
                .then((res) => {
                    notify('success', 'Create advice letter successfully')
                    toggleModal(false)
                    form.resetFields()
                    updateData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, data, values, updateData]
    )

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const handleChange = (info) => {
        if (info.file && values.file !== 'remove') {
            setValues({ file: info.file })
            setShowRequired(false)
        } else {
            setValues({ file: null })
            form.setFieldValue('file_upload', null)
        }
    }
    console.log(values.file)
    console.log(file)

    const fetchStudent = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'STUDENT',
            q
        })

        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const onRemoveFile = () => {
        values.file = 'remove'
        setValues({ file: 'remove' })
        form.setFieldValue('file_upload', null)
    }

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 22 }}
            onFinish={onFinish}
        >
            <Row>
                <Col span={8}>
                    <div>
                        Student: <span style={{ color: 'red' }}>*</span>
                    </div>
                </Col>
                <Col span={16}>
                    <Form.Item
                        name={'student_id'}
                        initialValue={student?.id}
                        required
                    >
                        <DebounceSelect
                            placeholder='Search by student'
                            fetchOptions={fetchStudent}
                            allowClear
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row className='mt-2'>
                <Col span={8}>
                    <div>
                        File Name: <span style={{ color: 'red' }}>*</span>
                    </div>
                </Col>
                <Col span={16}>
                    <Form.Item
                        name='file_name'
                        initialValue={file_name}
                        rules={[
                            {
                                required: true,
                                message: 'Please input file name!'
                            }
                        ]}
                    >
                        <Input placeholder='Enter file name' />
                    </Form.Item>
                </Col>
            </Row>
            <Row className='mt-2'>
                <Col span={8}>
                    <div>
                        Upload file: <span style={{ color: 'red' }}>*</span>
                    </div>
                </Col>
                <Col span={16}>
                    <Form.Item
                        name='file_upload'
                        help={
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    color: 'red'
                                }}
                            >
                                File size limit 10MB. Allowed file types PDF
                            </span>
                        }
                        className='w-100 mb-2'
                    >
                        <Upload
                            listType='picture'
                            name='file'
                            accept='application/pdf'
                            onChange={handleChange}
                            onRemove={onRemoveFile}
                            beforeUpload={() => false}
                            maxCount={1}
                            // showUploadList={false}
                        >
                            <Space direction='horizontal' size={16}>
                                <Button icon={<UploadOutlined />}>
                                    Upload File
                                </Button>
                            </Space>
                        </Upload>
                    </Form.Item>
                    {showRequired && (
                        <div
                            style={{
                                fontSize: '14px',
                                color: 'red'
                            }}
                        >
                            Please upload file!
                        </div>
                    )}
                </Col>
            </Row>
        </Form>
    )

    return (
        <Modal
            centered
            closable
            // maskClosable={true}
            visible={visible}
            onCancel={() => handleClose()}
            title='Upload Thư tư vấn'
            footer={[
                <Button
                    key='Close'
                    type='primary'
                    danger
                    onClick={() => handleClose()}
                >
                    Close
                </Button>,
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Add
                </Button>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AddAdviceLetterModel)
