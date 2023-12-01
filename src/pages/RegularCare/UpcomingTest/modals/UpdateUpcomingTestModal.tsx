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

const UpdateUpcomingTestModal: FC<IProps> = ({
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
                    note_input: ''
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
                note: values.note_input
            }
            RegularCareAPI.updateUpcomingTest(dataPost)
                .then((res) => {
                    notify('success', 'Update upcoming test successfully')
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
                                y: 165
                            }}
                            bordered
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
            title='Update Upcoming Test'
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

export default memo(UpdateUpcomingTestModal)
