import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Col,
    Row,
    Select,
    notification,
    Tabs,
    Popover,
    Tag,
    Table
} from 'antd'
import _ from 'lodash'
import { CUSTOMER_TYPE } from 'const/customer'
import { DEPARTMENT } from 'const/department'
import {
    objectClassify,
    ObjectLevel,
    ArrayCause,
    EnumRecommendSection,
    EnumRecommendStatus2
} from 'const/reports'
import TextEditor from 'core/Atoms/TextEditor'
import { EnumAction } from 'const/enum'
import UserAPI from 'api/UserAPI'
import ReportAPI from 'api/ReportAPI'
import sanitizeHtml from 'sanitize-html'
import DebounceSelect from 'core/Atoms/DebounceSelect'

const { Option } = Select
const { TextArea } = Input

type Props = {
    data?: any
    refetchData: any
    listDepartmentAndStaff: any
    visible: boolean
    toggleModal: (val: boolean) => void
}
function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const ClaimModal: FC<Props> = ({
    visible,
    data,
    listDepartmentAndStaff,
    toggleModal,
    refetchData
}) => {
    const [loading, setLoading] = useState(false)
    const [selectedDepartment, setDepartment] = useState('')
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            if (data.processing_department_id) {
                setDepartment(data.processing_department_id)
            }
            form.setFieldsValue({
                ...data,
                sname: `${data?.report_user?.full_name} - ${data?.report_user?.username}`,
                section: EnumRecommendSection[data.recommend_section],
                recommend_status: data.recommend_status.toString()
            })
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            ReportAPI.updateReport({
                id: data.id,
                ...values,
                recommend_status: Number(values.recommend_status)
            })
                .then((res) => {
                    form.resetFields()
                    notification.success({
                        message: 'Update Success'
                    })
                    toggleModal(false)
                    refetchData()
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [form, data]
    )

    const renderStaff = (id) => {
        const list = listDepartmentAndStaff.find((e) => e.id === id)
        if (list) {
            return list.list.map((item: any, index) => (
                <Option key={`s${item._id}`} value={item.id}>
                    {`${item.username} - ${item.fullname}`}
                </Option>
            ))
        }
        return <></>
    }
    const renderDepartment = () => {
        if (listDepartmentAndStaff) {
            return listDepartmentAndStaff.map((item) => (
                <Option key={`s${item.id}`} value={item.id}>
                    {`${item.name}`}
                </Option>
            ))
        }
        return <></>
    }

    const fetchUser = async (q) => {
        try {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
                role: 'TEACHER',
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const findStaffByTeacher = async () => {
        try {
            const id = form.getFieldValue('teacher')
            const selectedD = form.getFieldValue('processing_department_id')
            if (DEPARTMENT.hocthuat.id === Number(selectedD)) {
                const res = await ReportAPI.findStaffByTeacher({
                    id
                })
                if (res.staff_id) {
                    form.setFieldsValue({
                        department_staff_id: res.staff_id
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    const onChangeDepartment = (val) => {
        setDepartment(val)
        form.setFieldsValue({
            department_staff_id: ''
        })
        findStaffByTeacher()
    }

    const renderBody = () => (
        <>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
            >
                <Row>
                    <Col span={24}>
                        <h4>Student</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Report user'
                            name='sname'
                            labelAlign='left'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Section'
                            name='section'
                            labelAlign='left'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Content'
                            name='content'
                            labelAlign='left'
                        >
                            <Popover
                                content={
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: sanitize(
                                                data?.recommend_content
                                            )
                                        }}
                                    />
                                }
                            >
                                <Tag>Preview</Tag>
                            </Popover>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <h4>Customer Support Leader</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Handler'
                            name='resolve_user_id'
                            labelAlign='left'
                        >
                            <Select
                                showSearch
                                placeholder='Choose staff'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    option.children
                                        .toString()
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderStaff(DEPARTMENT.phongcskh.id)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Classify'
                            name='classify'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose classify'>
                                {Object.keys(objectClassify).map((key) => {
                                    return (
                                        <Option
                                            value={objectClassify[key]}
                                            key={key}
                                        >
                                            {key}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label='Level' name='level' labelAlign='left'>
                            <Select placeholder='Choose level'>
                                {Object.keys(ObjectLevel).map((key) => {
                                    return (
                                        <Option
                                            value={ObjectLevel[key]}
                                            key={key}
                                        >
                                            {key}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Teacher'
                            name='teacher'
                            labelAlign='left'
                        >
                            <DebounceSelect
                                placeholder='Search by Teacher'
                                fetchOptions={fetchUser}
                                allowClear
                                style={{ width: '100%' }}
                                onChange={findStaffByTeacher}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <h4>Customer Support Handler</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Cause'
                            name='error_cause'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose cause'>
                                {ArrayCause.map((key) => {
                                    return (
                                        <Option value={key} key={key}>
                                            {key}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Status'
                            name='recommend_status'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose status'>
                                {Object.keys(EnumRecommendStatus2).map(
                                    (key) => {
                                        return (
                                            <Option value={key} key={key}>
                                                {EnumRecommendStatus2[key]}
                                            </Option>
                                        )
                                    }
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label='Solution'
                            name='report_solution'
                            labelAlign='left'
                        >
                            <TextEditor />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <h4>Other Handler</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Department'
                            name='processing_department_id'
                            labelAlign='left'
                        >
                            <Select
                                placeholder='Choose department'
                                optionFilterProp='children'
                                onChange={onChangeDepartment}
                            >
                                {renderDepartment()}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Handler'
                            name='department_staff_id'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose staff'>
                                {renderStaff(selectedDepartment)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label='Feedback'
                            name='department_staff_feedback'
                            labelAlign='left'
                        >
                            <TextArea></TextArea>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title='Edit User Claim and Recommendation'
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

export default memo(ClaimModal)
