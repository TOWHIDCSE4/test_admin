import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Input, Upload, Button, Form, Select } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import TextArea from 'antd/lib/input/TextArea'
import TextEditor from 'core/Atoms/TextEditor'
import EmailAPI from 'api/EmailAPI'
import TemplateAPI from 'api/TemplateAPI'
import { EnumTemplateType, ITemplate } from 'types'
import _ from 'lodash'
import UploadAPI from 'api/UploadAPI'
import { notify } from 'utils/notify'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const SendEmailMarketing = () => {
    const [fileList, setFileList] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [templates, setTemplates] = useState<ITemplate[]>([])
    const [templateId, setTemplateId] = useState()
    const [emailLists, setEmailList] = useState([])
    const fetchEmailTemplates = () => {
        TemplateAPI.getTemplates({
            type: EnumTemplateType.EMAIL,
            page_size: 100
        }).then((res) => {
            setTemplates(res.data)
        })
    }

    useEffect(() => {
        fetchEmailTemplates()
    }, [])

    const handleUpload = () => {
        setLoading(true)
        UploadAPI.handleEmailMarketingFile(fileList[0])
            .then((res) => {
                setEmailList(res)
                form.setFieldsValue({
                    emails: res.reduce((p, c) => `${p + c}\n`, '')
                })
                setFileList([])
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }
    const onFinish = (values) => {
        setLoading(true)
        EmailAPI.sendMulticastWithTemplate({
            emails: emailLists,
            body: values.body,
            subject: values.subject
        })
            .then((res) => {
                notify('success', 'Send email successfully')
                form.setFieldsValue({ emails: '', emailLists: [] })
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const onChangeTemplate = (val) => {
        setTemplateId(val)
    }

    const handleLoadTemp = () => {
        const temp = _.find(templates, (o) => o._id === templateId)
        if (temp) {
            form.setFieldsValue({
                subject: temp.title,
                body: temp.content
            })
        }
    }
    const renderTemplate = () =>
        templates.map((item, index) => (
            <Select.Option value={item._id} key={index}>
                {item.title}
            </Select.Option>
        ))
    return (
        <Card title='Email Marketing by Template'>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
            >
                <Row justify='end' className='mb-3' gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                        <Card bordered>
                            <p className='mb-3'>
                                Upload email file ({`< 2.000`} mail){' '}
                                <Link
                                    to='/static/files/Template-Email-Marketing.xlsx'
                                    target='_blank'
                                    download
                                >
                                    <DownloadOutlined
                                        title='Download template'
                                        className='clickable ml-2'
                                        style={{
                                            fontSize: '20px',
                                            color: 'green'
                                        }}
                                    />
                                </Link>
                            </p>
                            <div className='d-flex mb-3'>
                                <div style={{ maxWidth: '130px' }}>
                                    <Upload
                                        accept='.txt,.xls,.xlsx,.csv'
                                        onRemove={(file: any) => {
                                            const index = fileList.indexOf(file)
                                            const newFileList = fileList.slice()
                                            newFileList.splice(index, 1)
                                            setFileList(newFileList)
                                        }}
                                        beforeUpload={(file: any) => {
                                            setFileList([file])
                                        }}
                                        fileList={fileList}
                                    >
                                        <Button
                                            icon={<UploadOutlined />}
                                            shape='round'
                                            disabled={loading}
                                        >
                                            Select File
                                        </Button>
                                    </Upload>
                                </div>
                                <Button
                                    type='primary'
                                    onClick={handleUpload}
                                    disabled={fileList.length === 0}
                                    loading={loading}
                                    shape='round'
                                    className='ml-4'
                                >
                                    {loading ? 'Uploading' : 'Start Upload'}
                                </Button>
                            </div>
                            <Form.Item
                                label='1. List emails'
                                name='emails'
                                labelAlign='left'
                                rules={[
                                    {
                                        required: true,
                                        message: 'List emails is required'
                                    }
                                ]}
                            >
                                <TextArea
                                    style={{
                                        minHeight: '350px',
                                        maxHeight: '350px',
                                        overflow: 'auto'
                                    }}
                                    readOnly
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                        <Card>
                            <div className='mb-3'>
                                <p className='mb-2'>2. Chọn mẫu email</p>
                                <Row gutter={[10, 10]}>
                                    <Col span={18}>
                                        <Select
                                            onChange={onChangeTemplate}
                                            value={templateId}
                                            placeholder='Chọn mẫu email có sẵn'
                                            style={{ width: '100%' }}
                                        >
                                            {renderTemplate()}
                                        </Select>
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            type='primary'
                                            shape='round'
                                            onClick={handleLoadTemp}
                                            disabled={!templateId}
                                        >
                                            Load
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                            <div className='mb-3'>
                                <Form.Item
                                    label='3. Tiêu đề email'
                                    name='subject'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Subject is required'
                                        }
                                    ]}
                                >
                                    <Input placeholder='Tiêu đề email' />
                                </Form.Item>
                            </div>
                            <div className='mb-3'>
                                <Form.Item
                                    label='4. Biên tập nội dung email'
                                    name='body'
                                    labelAlign='left'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Content is required'
                                        }
                                    ]}
                                >
                                    <TextEditor />
                                </Form.Item>
                            </div>
                            <div className='d-flex justify-content-end'>
                                {checkPermission(
                                    PERMISSIONS.mem_send_email
                                ) && (
                                    <Button
                                        type='primary'
                                        loading={loading}
                                        shape='round'
                                        className='ml-4'
                                        htmlType='submit'
                                    >
                                        Send
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}

export default SendEmailMarketing
