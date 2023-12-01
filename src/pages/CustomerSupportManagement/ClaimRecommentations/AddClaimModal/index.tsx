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
    Table
} from 'antd'
import _ from 'lodash'
import { CUSTOMER_TYPE } from 'const/customer'
import { DEPARTMENT } from 'const/department'
import TextEditor from 'core/Atoms/TextEditor'
import { EnumAction } from 'const/enum'
import ReportAPI from 'api/ReportAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'
import {
    objectClassify,
    ObjectLevel,
    ArrayCause,
    EnumRecommendSection,
    EnumReportType
} from 'const/reports'

const { Option } = Select
const { TextArea } = Input

type Props = {
    refetchData: any
    listDepartmentAndStaff: any
    visible: boolean
    toggleModal: (val: boolean) => void
}

const AddClaimModal: FC<Props> = ({
    visible,
    listDepartmentAndStaff,
    toggleModal,
    refetchData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {}, [visible])

    const handleClose = () => {
        toggleModal(false)
        form.resetFields()
    }

    const onFinish = useCallback(
        (values) => {
            values.type = EnumReportType.RECOMMEND
            ReportAPI.createReport({
                ...values
            })
                .then(async (res) => {
                    await form.resetFields()
                    refetchData()
                    notification.success({
                        message: 'Add Success'
                    })
                    toggleModal(false)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [form]
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

    const findStaffByStudent = async (studentId) => {
        try {
            const res = await ReportAPI.findStaffByStudent({ id: studentId })
            if (res.staff_id) {
                form.setFieldsValue({
                    resolve_user_id: res.staff_id
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchUser = async (q) => {
        try {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
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
                    <Col span={8}>
                        <Form.Item
                            label='Report user'
                            name='report_user'
                            labelAlign='left'
                        >
                            <DebounceSelect
                                placeholder='Search by report user'
                                fetchOptions={fetchUser}
                                allowClear
                                style={{ width: '100%' }}
                                onChange={findStaffByStudent}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Section'
                            name='recommend_section'
                            labelAlign='left'
                        >
                            <Select
                                placeholder='Section'
                                style={{ width: '100%' }}
                                allowClear
                                value=''
                            >
                                <Option value=''>All</Option>
                                {Object.values(EnumRecommendSection).map(
                                    (key) => {
                                        if (!isNaN(Number(key))) {
                                            return (
                                                <Option value={key} key={key}>
                                                    {EnumRecommendSection[key]}
                                                </Option>
                                            )
                                        }
                                        return null
                                    }
                                )}
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
                    <Col span={24}>
                        <Form.Item
                            label='Content'
                            name='recommend_content'
                            labelAlign='left'
                        >
                            <TextEditor />
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
            title='Add new User Claim and Recommendation'
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

export default memo(AddClaimModal)
