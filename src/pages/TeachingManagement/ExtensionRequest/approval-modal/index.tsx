import { FunctionComponent, useCallback, useEffect, useReducer } from 'react'
import {
    Modal,
    Row,
    Col,
    Form,
    Input,
    Button,
    notification,
    Divider,
    Tag
} from 'antd'
import { IBooking, IQuiz, EnumQuizLevel } from 'types'
import _ from 'lodash'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import moment, { relativeTimeRounding } from 'moment'
import { EnumStudentExtensionRequestStatus } from 'types/IExtensionRequest'
import { IModalProps } from 'const/common'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (request: any) => void
    reload: () => void
    request: any
    colorStatus: any
    updateFunc: (request: any) => Promise<any>
}

const ApprovalModal: FunctionComponent<IProps> = (props) => {
    const [form] = Form.useForm()

    const { visible, toggleModal, reload, request, colorStatus, updateFunc } =
        props

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            status: request?.status
        }
    )

    useEffect(() => {
        form.resetFields()
        form.setFieldsValue({ price: request?.price })
        setValues({ status: request?.status })
    }, [visible])

    const onFinish = useCallback((formValues) => {}, [visible])

    const approveRequest = () => {
        updateFunc({
            id: request.id,
            status: EnumStudentExtensionRequestStatus.APPROVED,
            admin_note: form.getFieldValue('adminNote')
        })
        setValues({ status: 3 })
        toggleModal(false)
    }

    const declineRequest = () => {
        if (!form.getFieldValue('adminNote')) {
            notification.error({
                message: 'Error',
                description: 'Please input admin note'
            })
        } else {
            updateFunc({
                id: request.id,
                status: EnumStudentExtensionRequestStatus.REJECTED,
                admin_note: form.getFieldValue('adminNote')
            }).then(() => {
                setValues({ status: 2 })
                toggleModal(false)
            })
        }
    }

    const renderBody = () => (
        <>
            <Form form={form} onFinish={() => {}}>
                <>
                    <Row justify='center' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Created date</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>
                                <Tag color='orange'>
                                    {request?.created_time &&
                                        moment(request.created_time).format(
                                            'DD/MM/YYYY'
                                        )}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='center' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Student</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>
                                <p>{request?.student?.full_name}</p>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Package</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>
                                {request?.ordered_package?.package_name}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Student Note</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>{request?.student_note}</Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Total extension days</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>
                                <Tag color='blue'>
                                    {request?.number_of_days}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Fee</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item name='price'>
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Status</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item>
                                <Tag color={colorStatus(values.status)}>
                                    {_.startCase(
                                        EnumStudentExtensionRequestStatus[
                                            values.status
                                        ]
                                    )}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={8}>
                            <b>Admin note</b>
                        </Col>
                        <Col span={16}>
                            <Form.Item name='adminNote'>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => {
                toggleModal(null)
                reload()
            }}
            title={`Extension Request review for ${request?.student?.full_name} - ${request?.student?.username}`}
            // footer={false}
            footer={[
                checkPermission(PERMISSIONS.tmer_reject) && (
                    <Button
                        key='back'
                        type='primary'
                        danger
                        onClick={declineRequest}
                    >
                        Reject
                    </Button>
                ),
                checkPermission(PERMISSIONS.tmer_approve) && (
                    <Button
                        key='submit'
                        type='primary'
                        style={{ background: 'green', borderColor: 'green' }}
                        onClick={approveRequest}
                    >
                        Approve
                    </Button>
                )
            ]}
            width='600px'
        >
            {renderBody()}
        </Modal>
    )
}

export default ApprovalModal
