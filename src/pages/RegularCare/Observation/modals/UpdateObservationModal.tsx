import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Col,
    Row,
    Select,
    Table,
    Popover
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { notify } from 'utils/notify'
import moment from 'moment'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import Link from 'antd/lib/typography/Link'
import { IModalProps } from 'const'
import RegularCareAPI from 'api/RegularCareAPI'

const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

interface IProps extends IModalProps {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    updateData: () => void
}

const UpdateObservationModal: FC<IProps> = ({
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
                    classroom_teacher:
                        data.detail_data?.classroom_teacher.content || '',
                    camera: data.detail_data?.camera?.content || '',
                    on_time: data.detail_data?.on_time?.content || '',
                    attitude_and_cooperation_in_the_classroom:
                        data.detail_data
                            ?.attitude_and_cooperation_in_the_classroom
                            ?.content || '',
                    progress_according_to_reviews_of_cs:
                        data.detail_data?.progress_according_to_reviews_of_cs
                            ?.content || ''
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
                detail_data: {
                    classroom_teacher: {
                        content: values.classroom_teacher
                    },
                    camera: {
                        content: values.camera
                    },
                    on_time: {
                        content: values.on_time
                    },
                    attitude_and_cooperation_in_the_classroom: {
                        content:
                            values.attitude_and_cooperation_in_the_classroom
                    },
                    progress_according_to_reviews_of_cs: {
                        content: values.progress_according_to_reviews_of_cs
                    }
                },
                note: values.note_input
            }
            RegularCareAPI.updateObservation(dataPost)
                .then((res) => {
                    notify('success', 'Update observation successfully')
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
                        <div>Giáo viên đứng lớp :</div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name='classroom_teacher'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Camera:</div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name='camera'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Đúng giờ:</div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name='on_time'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Thái độ, sự hợp tác trong lớp học:</div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name='attitude_and_cooperation_in_the_classroom'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <div>Sự tiến bộ theo đánh giá của CS:</div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name='progress_according_to_reviews_of_cs'>
                            <TextArea rows={2}></TextArea>
                        </Form.Item>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={4}>
                        <div>Note:</div>
                    </Col>
                    <Col span={20}>
                        <Form.Item name='note_input'>
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
            title='Update Observation'
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

export default memo(UpdateObservationModal)
