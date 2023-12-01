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
    Tag,
    notification,
    Spin
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
import { DATE_FORMAT, IModalProps, encodeFilenameFromLink } from 'const'
import { red } from '@ant-design/colors'
import RegularCareAPI from 'api/RegularCareAPI'
import { resolve } from 'path'
import {
    EnumLAModalType,
    EnumLAReportType
} from 'types/ILearningAssessmentReports'
import UploadAPI from 'api/UploadAPI'
import LearningAssessmentReportsAPI from 'api/LearningAssessmentReportsAPI'
import OrderAPI from 'api/OrderAPI'
import StudentAPI from 'api/StudentAPI'
import PackageAPI from 'api/PackageAPI'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

interface IProps extends IModalProps {
    data?: any
    visible: boolean
    modalType?: any
    toggleModal: (val: boolean) => void
    updateData: () => void
}

const ActionPeriodicLearningAssessmentReportsModal: FC<IProps> = ({
    visible,
    data,
    modalType,
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
            ordered_package_id: null,
            type_report: EnumLAReportType.PERIODIC,
            file: null,
            students: [],
            studentPackages: [],
            filter: {
                student: {
                    total: 0,
                    page_number: 1,
                    search: ''
                },
                package: {
                    total: 0,
                    page_number: 1,
                    search: ''
                }
            }
        }
    )

    const getAllStudents = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, students } = values
            setValues({ isSearching: true })
            StudentAPI.getStudentsOfSupported({
                status: 'active',
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    filter.student.total = res.pagination.total
                    if (res?.data && res?.data?.length > 0) {
                        let newStudents = [...res.data]
                        if (query.page_number > 1) {
                            newStudents = [...students, ...res.data]
                        }
                        setValues({
                            students: newStudents,
                            filter
                        })
                    } else {
                        setValues({
                            students: res.data,
                            filter
                        })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isSearching: false }))
        },
        [values]
    )

    const getOrderedPackagesByStudentId = useCallback(
        (query: {
            student_id: number
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            const { filter, studentPackages } = values
            setValues({ isLoading: true })
            OrderAPI.getAllOrderedPackagesByUserId(query.student_id, {
                ...query
            })
                .then((res) => {
                    filter.package.total = res.pagination.total
                    let newPackages = [...res.data]
                    if (query.page_number > 1) {
                        newPackages = [...studentPackages, ...res.data]
                    }
                    setValues({
                        studentPackages: newPackages,
                        filter
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        return res
    }

    useEffect(() => {
        form.resetFields()
        if (visible) {
            if (data) {
                form.setFieldValue('type_report', data.type)
            }
            if (modalType === EnumLAModalType.NEW) {
                getAllStudents({
                    page_number: values.filter.student.page_number,
                    page_size: values.page_size
                })
            }
        }
    }, [visible])

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

    const loadMore = (key) => (event) => {
        const { target } = event
        if (
            !values.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { filter, page_size } = values
            if (filter[key].total > page_size * filter[key].page_number) {
                filter[key].page_number += 1
                setValues({ filter })
                switch (key) {
                    case 'student':
                        getAllStudents({
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    case 'package':
                        getOrderedPackagesByStudentId({
                            student_id: values.getFieldValue('student_id'),
                            page_number: filter[key].page_number,
                            search: filter[key].search,
                            page_size
                        })
                        break
                    default:
                        break
                }
            }
        }
    }

    const onSearchFilter = (key) => (value: string) => {
        const { filter, page_size } = values

        filter[key].search = value

        switch (key) {
            case 'student':
                filter[key].page_number = 1
                getAllStudents({
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            case 'package':
                filter[key].page_number = 1
                getOrderedPackagesByStudentId({
                    student_id: form.getFieldValue('student_id'),
                    page_number: filter[key].page_number,
                    page_size,
                    search: value
                })
                break
            default:
                break
        }
        setValues({ filter })
    }

    const renderSelect = (key) => {
        if (_.isArray(values[key]) && values[key].length > 0) {
            return values[key].map((item, index) => {
                if (key === 'students') {
                    return (
                        <Option key={index} value={item.id}>
                            {item && `${item?.full_name} - ${item?.username}`}
                        </Option>
                    )
                }
                return (
                    <Option key={index} value={item.id}>
                        {`${item?.id} - ${item?.package_name}` ||
                            `${item?.id} - ${item?.name}` ||
                            `${item?.full_name} - ${item?.username}`}
                    </Option>
                )
            })
        }
    }

    const onChangeStudent = useCallback(
        (changedValues) => {
            if (_.isEmpty(changedValues)) {
                getOrderedPackagesByStudentId({
                    student_id: changedValues,
                    page_number: 1,
                    page_size: values.page_size
                })
                form.resetFields()
                setValues({
                    ...values,
                    ordered_package_id: '',
                    student_id: changedValues
                })
                form.setFieldsValue({
                    ordered_package_id: '',
                    student_id: changedValues
                })
            }
        },
        [form, values]
    )

    const onChangeOrderedPackage = useCallback(
        async (changedValues, type?: any) => {
            if (_.isEmpty(changedValues) && changedValues) {
                PackageAPI.getOrderedPackageById(changedValues, {})
                    .then((res) => {
                        setValues({
                            ...values,
                            ordered_package_id: changedValues
                        })
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
                    .finally()
            }
        },
        [form, values]
    )

    const onRemoveFile = (info: any) => {
        values.file = 'remove'
        setValues({ file: 'remove' })
        form.setFieldValue('file_upload', null)
    }

    const onFinish = useCallback(
        async (value) => {
            const dataPost: any = {
                type_report: value.type_report
            }
            if (modalType === EnumLAModalType.NEW) {
                if (values.file) {
                    setLoading(true)
                    const fileUpload = await uploadFile(values.file)
                    dataPost.file = fileUpload
                } else {
                    setShowRequired(true)
                    return
                }
                dataPost.type = data?.type
                dataPost.student_id = value?.student_id
                dataPost.ordered_package_id = value?.ordered_package_id
                LearningAssessmentReportsAPI.createLAReportsByAdmin(dataPost)
                    .then((res) => {
                        notify('success', 'create reports successfully')
                        toggleModal(false)
                        updateData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else if (modalType === EnumLAModalType.EDIT) {
                setLoading(true)
                if (values.file) {
                    const fileUpload = await uploadFile(values.file)
                    dataPost.file = fileUpload
                }
                LearningAssessmentReportsAPI.editLAReport(data.id, dataPost)
                    .then((res) => {
                        notify(
                            'success',
                            'create periodic reports successfully'
                        )
                        toggleModal(false)
                        updateData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
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
                    type_report: values.type_report,
                    file_upload: null
                }}
            >
                <Row>
                    <Col span={3}>
                        <div>Student:</div>
                    </Col>
                    <Col span={12}>
                        {modalType === EnumLAModalType.NEW && (
                            <Form.Item name='student_id' className='mb-0 w-100'>
                                <Select
                                    placeholder='Choose student'
                                    className='filter-lesson-statistics'
                                    // style={{ width: '100%' }}
                                    showSearch
                                    filterOption={false}
                                    loading={values.isLoading}
                                    onPopupScroll={loadMore('student')}
                                    onSearch={_.debounce(
                                        onSearchFilter('student'),
                                        300
                                    )}
                                    onChange={onChangeStudent}
                                >
                                    {renderSelect('students')}
                                    {values.isLoading && (
                                        <Option key='loading' value=''>
                                            <Spin size='small' />
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        )}
                        {modalType === EnumLAModalType.EDIT && (
                            <div>
                                {data?.student?.full_name}-
                                {data?.student?.username}
                            </div>
                        )}
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col span={3}>
                        <div>Package:</div>
                    </Col>
                    <Col span={12}>
                        {modalType === EnumLAModalType.NEW && (
                            <Form.Item
                                name='ordered_package_id'
                                className='mb-0 w-100'
                            >
                                <Select
                                    placeholder='Choose package'
                                    showSearch
                                    className='filter-lesson-statistics'
                                    // style={{ width: '100%' }}
                                    filterOption={false}
                                    // defaultValue={
                                    //     values.ordered_package_id
                                    // }
                                    loading={values.isLoading}
                                    onPopupScroll={loadMore('package')}
                                    onChange={onChangeOrderedPackage}
                                    onSearch={_.debounce(
                                        onSearchFilter('package'),
                                        300
                                    )}
                                >
                                    {values.studentPackages?.length > 0 && (
                                        <Option key='all' value=''>
                                            ALL
                                        </Option>
                                    )}
                                    {renderSelect('studentPackages')}
                                    {/* {values.isLoading && (
                                                <Option key='loading' value=''>
                                                    <Spin size='small' />
                                                </Option>
                                            )} */}
                                </Select>
                            </Form.Item>
                        )}
                        {modalType === EnumLAModalType.EDIT && (
                            <div>{data?.ordered_package?.package_name}</div>
                        )}
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col span={3}>
                        <div>Type:</div>
                    </Col>
                    <Col span={12}>
                        {modalType === EnumLAModalType.EDIT && (
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
                        )}
                        {modalType === EnumLAModalType.NEW &&
                            data?.type === EnumLAReportType.PERIODIC && (
                                <div>Báo cáo định kỳ</div>
                            )}
                        {modalType === EnumLAModalType.NEW &&
                            data?.type === EnumLAReportType.END_TERM && (
                                <div>Báo cáo cuối kỳ</div>
                            )}
                    </Col>
                </Row>
                <Row className='mt-4'>
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
            title={
                modalType === EnumLAModalType.EDIT
                    ? 'Update Reports'
                    : 'Create reports'
            }
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

export default memo(ActionPeriodicLearningAssessmentReportsModal)
