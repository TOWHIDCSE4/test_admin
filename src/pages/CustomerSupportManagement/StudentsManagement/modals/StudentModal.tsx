import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import { Button, Modal, Form, Input, Col, Row, Select, Tabs, Table } from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import CustomerSupportManagementAPI from 'api/CustomerSupportManagementAPI'
import { notify } from 'utils/notify'
import moment from 'moment'
import { CUSTOMER_TYPE } from 'const/customer'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

type Props = {
    staffs: any
    data?: any
    studentLevels: any
    visible: boolean
    toggleModal: (val: boolean) => void
    updateData: (item) => void
}

const StudentModal: FC<Props> = ({
    staffs,
    studentLevels,
    visible,
    data,
    toggleModal,
    updateData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const { user } = useAuth()

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            const renderInputData = () => {
                const loop = data.cs_info?.customer_care
                const res = {}
                for (let index = 0; index < loop.length; index++) {
                    const iterator = loop[index]
                    res[`customer_care_customer_type${index}`] =
                        iterator.customer_type
                            ? Number(iterator.customer_type)
                            : ''
                    res[`customer_care_parent_opinion${index}`] =
                        iterator.parent_opinion
                    res[`customer_care_teacher_feedback${index}`] =
                        iterator.teacher_feedback
                    res[`customer_care_type${index}`] = iterator.type
                        ? Number(iterator.type)
                        : ''
                    res[`customer_care_video_feedback${index}`] =
                        iterator.video_feedback
                    res[`customer_care_note${index}`] = iterator.note
                    res[`customer_care_input_level${index}`] =
                        iterator.input_level

                    res[`customer_care_output_level${index}`] =
                        iterator.output_level
                }
                return res
            }
            setTimeout(() => {
                const temp = renderInputData()
                form.setFieldsValue({
                    ...temp,
                    ref_event: data.cs_info?.ref?.event,
                    ref_name: data.cs_info?.ref?.name,
                    ref_phone: data.cs_info?.ref?.phone
                    // supporter_greeting_call:
                    //     data.cs_info?.supporter?.greeting_call || 0,
                    // supporter_checking_call:
                    //     data.cs_info?.supporter?.checking_call || 0,
                    // supporter_scheduled:
                    //     data.cs_info?.supporter?.scheduled || 0,
                    // supporter_staff_id: data.cs_info?.supporter?.staff_id
                })
            }, 300)
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const renderStaff = () =>
        staffs.map((item: any, index) => (
            <Option key={`s${item.value}`} value={item.value}>
                {item.label}
            </Option>
        ))

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const dataPost = {
                user_id: data.id,
                supporter: {
                    staff_id: data?.student?.staff_id
                    // greeting_call: values.supporter_greeting_call,
                    // checking_call: values.supporter_checking_call,
                    // scheduled: values.supporter_scheduled
                },
                customer_care: [],
                ref: {
                    name: values.ref_name,
                    phone: values.ref_phone,
                    event: values.ref_event
                }
            }
            const loop = data.cs_info?.customer_care
            for (let index = 0; index < loop.length; index++) {
                const history = loop[index].history || []
                const objectPush = {
                    date: loop[index].date,
                    customer_type: Number(
                        values[`customer_care_customer_type${index}`]
                    ),
                    type: Number(values[`customer_care_type${index}`]),
                    parent_opinion:
                        values[`customer_care_parent_opinion${index}`],
                    video_feedback:
                        values[`customer_care_video_feedback${index}`],
                    teacher_feedback:
                        values[`customer_care_teacher_feedback${index}`],
                    note: values[`customer_care_note${index}`],
                    input_level: Number(
                        values[`customer_care_input_level${index}`]
                    ),
                    output_level: Number(
                        values[`customer_care_output_level${index}`]
                    )
                }
                const lastHistory = history[history.length - 1]
                if (
                    lastHistory?.customer_type !== objectPush.customer_type ||
                    lastHistory?.type !== objectPush.type ||
                    lastHistory?.parent_opinion !== objectPush.parent_opinion ||
                    lastHistory?.video_feedback !== objectPush.video_feedback ||
                    lastHistory?.teacher_feedback !==
                        objectPush.teacher_feedback ||
                    lastHistory?.input_level !== objectPush.input_level ||
                    lastHistory?.output_level !== objectPush.output_level
                ) {
                    history.push({
                        ...objectPush,
                        createAt: Date.now(),
                        cs: `${user.username} - ${user.fullname}` || ''
                    })
                }

                dataPost.customer_care.push({ ...objectPush, history })
            }
            CustomerSupportManagementAPI.updateData(dataPost)
                .then((res) => {
                    notify('success', 'Update info successfully')
                    toggleModal(false)
                    const staff = staffs.find(
                        (e) => e.value === dataPost.supporter.staff_id
                    )
                    data = null
                    updateData({ dataPost, staff })
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, data]
    )
    const renderLevel = () => {
        const options = []
        studentLevels.forEach((element, index) => {
            options.push(
                <Option key={index} value={Number(element.id)}>
                    {element.id} - {element.name}
                </Option>
            )
        })
        return options
    }

    const renderCustomerType = () => {
        const options = []
        // eslint-disable-next-line guard-for-in
        for (const property in CUSTOMER_TYPE) {
            const value = CUSTOMER_TYPE[property]
            options.push(
                <Option key={property} value={Number(property)}>
                    {value}
                </Option>
            )
        }
        return options
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
                {/* <Row>
                    <Col span={24}>
                        <h4>Supporter</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Username'
                            name='supporter_staff_id'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Enter username'
                                }
                            ]}
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
                                disabled={
                                    !checkPermission(
                                        PERMISSIONS.csmsm_update_supporter
                                    )
                                }
                            >
                                {renderStaff()}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={16}></Col>
                    <Col span={8}>
                        <Form.Item
                            label='Greeting call'
                            name='supporter_greeting_call'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose type'>
                                <Option value={1}>Done</Option>
                                <Option value={0}>Not Done</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Scheduled'
                            name='supporter_scheduled'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose scheduled'>
                                <Option value={1}>Done</Option>
                                <Option value={0}>Not Done</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Checking call'
                            name='supporter_checking_call'
                            labelAlign='left'
                        >
                            <Select placeholder='Choose type'>
                                <Option value={1}>Done</Option>
                                <Option value={0}>Not Done</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row> */}
                <Row>
                    <Col span={24}>
                        <h4>Customer care</h4>
                    </Col>
                    <div className='border p-2 w-100 mb-3'>
                        <Tabs
                            defaultActiveKey={
                                data &&
                                (
                                    data.cs_info?.customer_care.length - 1
                                ).toString()
                            }
                        >
                            {data &&
                                data.cs_info?.customer_care.map(
                                    (item, index) => (
                                        <TabPane
                                            tab={moment(
                                                new Date(item.date)
                                            ).format('MM-YYYY')}
                                            key={index}
                                        >
                                            <div className=' w-100 d-flex flex-wrap'>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Customer Type'
                                                        name={`customer_care_customer_type${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <Select placeholder='Choose customer type'>
                                                            {renderCustomerType()}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Type'
                                                        name={`customer_care_type${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <Select placeholder='Choose type'>
                                                            <Option value={0}>
                                                                Call
                                                            </Option>
                                                            <Option value={1}>
                                                                Message
                                                            </Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Input level'
                                                        name={`customer_care_input_level${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <Select placeholder='Choose level'>
                                                            {renderLevel()}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Output level'
                                                        name={`customer_care_output_level${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <Select placeholder='Choose level'>
                                                            {renderLevel()}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label="Parent's opinion"
                                                        name={`customer_care_parent_opinion${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <TextArea
                                                            rows={4}
                                                        ></TextArea>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Teacher feedback'
                                                        name={`customer_care_teacher_feedback${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <TextArea
                                                            rows={4}
                                                        ></TextArea>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label='Video feedback'
                                                        name={`customer_care_video_feedback${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <TextArea
                                                            rows={4}
                                                        ></TextArea>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        className='w-100'
                                                        label='Note'
                                                        name={`customer_care_note${index}`}
                                                        labelAlign='left'
                                                    >
                                                        <TextArea
                                                            rows={4}
                                                        ></TextArea>
                                                    </Form.Item>
                                                </Col>
                                            </div>
                                            <Table
                                                className='student-management-table'
                                                size='small'
                                                dataSource={item.history}
                                                rowKey={(record: any) =>
                                                    record.createAt
                                                }
                                                scroll={{
                                                    x: 500,
                                                    y: 200
                                                }}
                                                sticky
                                                pagination={false}
                                                bordered
                                                expandable={{
                                                    expandedRowRender: (
                                                        record
                                                    ) => {
                                                        return (
                                                            <ul className='pt-3'>
                                                                <li>
                                                                    <b>
                                                                        Parent's
                                                                        opinion
                                                                        :
                                                                    </b>
                                                                    {
                                                                        record.parent_opinion
                                                                    }
                                                                </li>
                                                                <li>
                                                                    <b>
                                                                        Teacher
                                                                        feedback
                                                                        :
                                                                    </b>
                                                                    {
                                                                        record.teacher_feedback
                                                                    }
                                                                </li>
                                                                <li>
                                                                    <b>
                                                                        Video
                                                                        feedback:
                                                                    </b>
                                                                    {
                                                                        record.video_feedback
                                                                    }
                                                                </li>
                                                                <li>
                                                                    <b>
                                                                        Note :
                                                                    </b>
                                                                    {
                                                                        record.note
                                                                    }
                                                                </li>
                                                            </ul>
                                                        )
                                                    }
                                                }}
                                            >
                                                <Column
                                                    width={100}
                                                    title='Time'
                                                    dataIndex='createAt'
                                                    key='createAt'
                                                    render={(
                                                        createAt: any,
                                                        record: any
                                                    ) => {
                                                        return (
                                                            <div className='max-height text-center'>
                                                                {moment(
                                                                    new Date(
                                                                        createAt
                                                                    )
                                                                ).format(
                                                                    'HH:mm DD-MM-YYYY'
                                                                )}
                                                            </div>
                                                        )
                                                    }}
                                                />
                                                <Column
                                                    width={100}
                                                    title='CS'
                                                    dataIndex='cs'
                                                    key='cs'
                                                    render={(
                                                        cs: any,
                                                        record: any
                                                    ) => {
                                                        return (
                                                            <div className='max-height text-center'>
                                                                {cs}
                                                            </div>
                                                        )
                                                    }}
                                                />
                                                <Column
                                                    width={100}
                                                    title='Customer Type'
                                                    dataIndex='customer_type'
                                                    key='customer_type'
                                                    render={(
                                                        customer_type: any,
                                                        record: any
                                                    ) => {
                                                        const customer_name =
                                                            CUSTOMER_TYPE[
                                                                customer_type
                                                            ]

                                                        return (
                                                            <div className='max-height text-center'>
                                                                {customer_name}
                                                            </div>
                                                        )
                                                    }}
                                                />
                                                <Column
                                                    width={100}
                                                    title='Input Level'
                                                    dataIndex='input_level'
                                                    key='input_level'
                                                    render={(
                                                        input_level: any,
                                                        record: any
                                                    ) => {
                                                        const level =
                                                            studentLevels.find(
                                                                (e) =>
                                                                    e.id ===
                                                                    input_level
                                                            )
                                                        return (
                                                            level && (
                                                                <div className='max-height text-center'>
                                                                    {level.id} -{' '}
                                                                    {level.name}
                                                                </div>
                                                            )
                                                        )
                                                    }}
                                                />
                                                <Column
                                                    width={100}
                                                    title='Output Level'
                                                    dataIndex='output_level'
                                                    key='output_level'
                                                    render={(
                                                        output_level: any,
                                                        record: any
                                                    ) => {
                                                        const level =
                                                            studentLevels.find(
                                                                (e) =>
                                                                    e.id ===
                                                                    output_level
                                                            )

                                                        return (
                                                            level && (
                                                                <div className='max-height text-center'>
                                                                    {level.id} -{' '}
                                                                    {level.name}
                                                                </div>
                                                            )
                                                        )
                                                    }}
                                                />
                                            </Table>
                                        </TabPane>
                                    )
                                )}
                        </Tabs>
                    </div>
                </Row>
                <Row>
                    <Col span={24}>
                        <h4>Referred by</h4>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Name'
                            name='ref_name'
                            labelAlign='left'
                        >
                            <Input placeholder='Input name  - username'></Input>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Phone'
                            name='ref_phone'
                            labelAlign='left'
                        >
                            <Input placeholder='Input phone'></Input>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Event'
                            name='ref_event'
                            labelAlign='left'
                        >
                            <Input placeholder='Input event'></Input>
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
            // maskClosable={true}
            visible={visible}
            onCancel={() => handleClose()}
            title='Edit info'
            footer={[
                <>
                    <Button
                        key='Close'
                        type='primary'
                        danger
                        onClick={() => handleClose()}
                    >
                        Close
                    </Button>
                    {checkPermission(PERMISSIONS.csmsm_update) && (
                        <Button
                            key='save'
                            type='primary'
                            onClick={() => form.submit()}
                            loading={loading}
                        >
                            Save
                        </Button>
                    )}
                </>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(StudentModal)
