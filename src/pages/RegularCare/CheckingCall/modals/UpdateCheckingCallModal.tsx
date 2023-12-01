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
    Popover
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { notify } from 'utils/notify'
import moment from 'moment'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import Link from 'antd/lib/typography/Link'
import { CriteriaList, REGULAR_CARE_STATUS } from 'const/regular-care'
import { IModalProps } from 'const'
import RegularCareAPI from 'api/RegularCareAPI'
import { resolve } from 'path'

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

const UpdateCheckingCallModal: FC<IProps> = ({
    visible,
    data,
    toggleModal,
    updateData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const { user } = useAuth()

    const [valueDetail, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_note: [],
            usernameStudent: ''
        }
    )

    useEffect(() => {
        if (visible && data) {
            if (data.note_history && data.note_history.length > 0) {
                const arrStaff = []
                // eslint-disable-next-line array-callback-return
                data.note_history.map((value, index) => {
                    if (!arrStaff.includes(value.staff_id)) {
                        arrStaff.push(value.staff_id)
                    }
                })
                RegularCareAPI.getListStaffContactHistory({ arrStaff })
                    .then((res) => {
                        if (res) {
                            const dataAdmin = res
                            data.note_history.map(async (value, index) => {
                                console.log(value.staff_id)
                                const indexAdmin = dataAdmin.findIndex(
                                    (q) => q.id === value.staff_id
                                )
                                data.note_history[index].user_name =
                                    dataAdmin[indexAdmin].username
                                data.note_history[index].full_name =
                                    dataAdmin[indexAdmin].fullname
                            })
                        }
                    })
                    .catch((err) => {})
                    .finally()
            }
            setTimeout(() => {
                setValues({
                    data_note: data.note_history,
                    usernameStudent: data.username_student
                })
                form.setFieldsValue({
                    teacher_review__status:
                        data.detail_checking?.teacher_review?.status || '',
                    teacher_review__reason:
                        data.detail_checking?.teacher_review?.reason || '',
                    curriculum_review__status:
                        data.detail_checking?.curriculum_review?.status || '',
                    overall_assessment_of_the_lesson__status:
                        data.detail_checking?.overall_assessment_of_the_lesson
                            ?.status || '',
                    overall_assessment_of_the_lesson__reason:
                        data.detail_checking?.overall_assessment_of_the_lesson
                            ?.reason || '',
                    information_about_the_system_of_self_study_materials__status:
                        data.detail_checking
                            ?.information_about_the_system_of_self_study_materials
                            ?.status || '',
                    information_about_the_system_of_self_study_materials__reason:
                        data.detail_checking
                            ?.information_about_the_system_of_self_study_materials
                            ?.reason || '',
                    note_checking_call: ''
                })
            }, 300)
        }
    }, [visible])

    const renderLinkStudent = () => {
        return `/students/all?search=${valueDetail.usernameStudent}`
    }

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const dataPost = {
                _id: data._id,
                detail_checking: {
                    teacher_review: {
                        status: values.teacher_review__status,
                        reason: values.teacher_review__reason
                    },
                    curriculum_review: {
                        status: values.curriculum_review__status
                    },
                    overall_assessment_of_the_lesson: {
                        status: values.overall_assessment_of_the_lesson__status,
                        reason: values.overall_assessment_of_the_lesson__reason
                    },
                    information_about_the_system_of_self_study_materials: {
                        status: values.information_about_the_system_of_self_study_materials__status,
                        reason: values.information_about_the_system_of_self_study_materials__reason
                    }
                },
                note: values.note_checking_call
            }
            RegularCareAPI.updateCheckingCall(dataPost)
                .then((res) => {
                    notify('success', 'Update checking call successfully')
                    toggleModal(false)
                    updateData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, data]
    )

    const columns: any = [
        {
            title: 'STT',
            dataIndex: 'stt_contact',
            key: 'stt_contact',
            width: 50,
            align: 'left',
            render: (e, record: any, index) => {
                console.log(record)
                return <div>{index + 1}</div>
            }
        },
        {
            title: 'Time',
            dataIndex: 'time_contact',
            key: 'time_contact',
            width: 120,
            align: 'left',
            render: (e, record: any) => {
                return record && record.created_time ? (
                    moment(record?.created_time).format('HH:mm DD-MM-YYYY')
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Supporter',
            dataIndex: 'supporter_contact',
            key: 'supporter_contact',
            width: '35%',
            align: 'left',
            render: (e, record: any) => {
                return record && record.user_name ? (
                    <div>
                        {record.full_name} - {record.user_name}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Note',
            dataIndex: 'note_contact',
            key: 'note_contact',
            width: '35%',
            align: 'left',
            render: (e, record: any) => {
                return record && record.note && record?.note.length > 30 ? (
                    <Popover content={record?.note}>
                        <a>
                            <div className='text-truncate'>{record?.note}</div>
                        </a>
                    </Popover>
                ) : record && record.note && record?.note.length <= 30 ? (
                    <div className='text-truncate'>{record?.note}</div>
                ) : (
                    <></>
                )
            }
        }
    ]

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
                        <div>Tiêu chí:</div>
                    </Col>
                    <Col span={8}>
                        <div>Cảm nhận, đánh giá về giáo viên:</div>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='teacher_review__status'>
                            <Select>
                                <Option value=''>---</Option>
                                <Option value='good'>Tốt</Option>
                                <Option value='not_good'>Không tốt</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <div>Lý do:</div>
                    </Col>
                    <Col span={10}>
                        <Form.Item name='teacher_review__reason'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Cảm nhận, đánh giá về giáo trình:</div>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='curriculum_review__status'>
                            <Select>
                                <Option value=''>---</Option>
                                <Option value='difficult'>Khó</Option>
                                <Option value='suitable'>Phù hợp</Option>
                                <Option value='easy'>Dễ</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}></Col>
                    <Col span={8}>
                        <div>Đánh giá chung về buổi học:</div>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='overall_assessment_of_the_lesson__status'>
                            <Select>
                                <Option value=''>---</Option>
                                <Option value='good'>Tốt</Option>
                                <Option value='normal'>Bình thường</Option>
                                <Option value='not_good'>Không tốt</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <div>Lý do:</div>
                    </Col>
                    <Col span={10}>
                        <Form.Item name='overall_assessment_of_the_lesson__reason'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Thông tin về hệ thống học liệu tự học:</div>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='information_about_the_system_of_self_study_materials__status'>
                            <Select>
                                <Option value=''>---</Option>
                                <Option value='understood'>Đã nắm rõ</Option>
                                <Option value='not_understood'>
                                    Chưa nắm rõ
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <div>Lý do:</div>
                    </Col>
                    <Col span={10}>
                        <Form.Item name='information_about_the_system_of_self_study_materials__reason'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={4}>
                        <div>Note:</div>
                    </Col>
                    <Col span={20}>
                        <Form.Item name='note_checking_call'>
                            <TextArea rows={3}></TextArea>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <div>Contact history:</div>
                    </Col>
                    <Col span={24}>
                        <Table
                            dataSource={valueDetail.data_note}
                            columns={columns}
                            pagination={false}
                            scroll={{
                                y: 500
                            }}
                            rowKey={(record: any) => record.id}
                        />
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
            title='Update Checking Call'
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

export default memo(UpdateCheckingCallModal)
