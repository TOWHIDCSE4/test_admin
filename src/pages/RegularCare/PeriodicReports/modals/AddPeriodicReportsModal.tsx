import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Col,
    Row,
    Select,
    Tabs,
    Table,
    Tooltip,
    Popover,
    DatePicker,
    Upload,
    Space,
    Tag
} from 'antd'
import {
    UploadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { notify } from 'utils/notify'
import moment from 'moment'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import Link from 'antd/lib/typography/Link'
import { CriteriaList, REGULAR_CARE_STATUS } from 'const/regular-care'
import { DATE_FORMAT, IModalProps, encodeFilenameFromLink } from 'const'
import { red } from '@ant-design/colors'
import RegularCareAPI from 'api/RegularCareAPI'
import { resolve } from 'path'
import { EnumLAReportType } from 'types/ILearningAssessmentReports'
import UploadAPI from 'api/UploadAPI'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

interface IProps extends IModalProps {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    updateData: () => void
}

const AddPeriodicReportsModal: FC<IProps> = ({
    visible,
    data,
    toggleModal,
    updateData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const { user } = useAuth()
    const { RangePicker } = DatePicker
    const [isDeleteFile, setDeleteFile] = useState(false)
    const [showRequired, setShowRequired] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            student_id: null,
            // from_date: moment().subtract(30, 'day').startOf('day'),
            // to_date: moment().endOf('day'),
            package_id: null,
            type_report: EnumLAReportType.PERIODIC,
            file: null
        }
    )

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        return res
    }

    useEffect(() => {
        if (visible && data) {
            if (
                data.lesson === 20 ||
                data.lesson === 25 ||
                data.lesson === 70 ||
                data.lesson === 75
            ) {
                setValues({ type_report: EnumLAReportType.PERIODIC })
                form.setFieldValue('type_report', EnumLAReportType.PERIODIC)
            } else if (
                data.lesson === 40 ||
                data.lesson === 45 ||
                data.lesson === 90 ||
                data.lesson === 95
            ) {
                setValues({ type_report: EnumLAReportType.END_TERM })
                form.setFieldValue('type_report', EnumLAReportType.END_TERM)
            }
        }
    }, [visible])

    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                from_date: value[0],
                to_date: value[1]
            })
        }
    }

    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const confirmDeleteFile = (filePath) => {
        if (filePath) {
            setValues({ file: null })
            form.setFieldValue('file_upload', null)
        }
    }

    const onChangeFile = (info: any) => {
        if (info.file && values.file !== 'remove') {
            setValues({ file: info.file })
            setShowRequired(false)
        } else {
            setValues({ file: null })
            form.setFieldValue('file_upload', null)
        }
    }

    const onRemoveFile = (info: any) => {
        values.file = 'remove'
        setValues({ file: 'remove' })
        form.setFieldValue('file_upload', null)
    }

    const onFinish = useCallback(
        async (value) => {
            const dataPost: any = {
                _id: data._id,
                student_id: data?.user?.id,
                package_id: data?.package?.id,
                // from_date: moment(value.duration[0]).startOf('day').valueOf(),
                // to_date: moment(value.duration[1]).endOf('day').valueOf(),
                type_report: value.type_report
            }
            if (values.file) {
                setLoading(true)
                const fileUpload = await uploadFile(values.file)
                dataPost.file = fileUpload
            } else {
                setShowRequired(true)
                return
            }
            RegularCareAPI.createPeriodicReportsForLearningAssessment(dataPost)
                .then((res) => {
                    notify('success', 'create periodic reports successfully')
                    toggleModal(false)
                    updateData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, data, values]
    )

    const renderBody = () => (
        <>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
                initialValues={{
                    // duration: [values.from_date, values.to_date],
                    type_report: values.type_report,
                    file_upload: null
                }}
            >
                <Row>
                    <Col span={3}>
                        <div>Student:</div>
                    </Col>
                    <Col span={12}>
                        <div>
                            {`${data?.user?.full_name}-
                            ${data?.user?.username}`}
                        </div>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={3}>
                        <div>Package:</div>
                    </Col>
                    <Col span={20}>{data?.package?.package_name}</Col>
                </Row>
                {/* <Row className='mt-2'>
                    <Col span={3}>
                        <div>Duration:</div>
                    </Col>
                    <Col span={12}>
                        <Form.Item name='duration'>
                            <RangePicker
                                allowClear={false}
                                format={DATE_FORMAT}
                                style={{ width: '100%' }}
                                disabledDate={(current) => current > moment()}
                                clearIcon={false}
                                onChange={handleChangeDate}
                            />
                        </Form.Item>
                    </Col>
                </Row> */}
                <Row className='mt-2'>
                    <Col span={3}>
                        <div>Type:</div>
                    </Col>
                    <Col span={12}>
                        <Form.Item name='type_report'>
                            <Select>
                                <Option value={EnumLAReportType.PERIODIC}>
                                    Báo cáo định kỳ
                                </Option>
                                <Option value={EnumLAReportType.END_TERM}>
                                    Báo cáo cuối kỳ
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={3}>
                        <div>Upload file :</div>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            labelAlign='left'
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
                                accept='application/pdf'
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={onChangeFile}
                                onRemove={onRemoveFile}
                            >
                                <Space direction='horizontal' size={16}>
                                    <Button icon={<UploadOutlined />}>
                                        Upload
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
                                Vui lòng upload file báo cáo!
                            </div>
                        )}
                    </Col>
                </Row>
            </Form>
        </>
    )

    return (
        <Modal
            centered
            closable
            // maskClosable={true}
            visible={visible}
            onCancel={() => handleClose()}
            title='Add Periodic Reports'
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
                    Save
                </Button>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AddPeriodicReportsModal)
