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
    DatePicker,
    Tag
} from 'antd'
import { IBooking, IQuiz, EnumQuizLevel } from 'types'
import _ from 'lodash'
import ExamAPI from 'api/ExamAPI'
import QuizAPI from 'api/QuizAPI'
import CourseAPI from 'api/CourseAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import moment, { relativeTimeRounding } from 'moment'
import { EnumStudentReservationRequestStatus } from 'types/IReservation'
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
            status: 3,
            admin_note: form.getFieldValue('adminNote')
        })
        setValues({ status: 3 })
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
                status: 2,
                admin_note: form.getFieldValue('adminNote')
            }).then(() => {
                setValues({ status: 2 })
            })
        }
    }
    const updateFee = () => {
        updateFunc({
            id: request.id,
            price: form.getFieldValue('price')
        }).then(() => {
            notification.success({
                message: 'Success',
                description: 'Update fee success'
            })
        })
    }
    const renderBody = () => (
        <>
            <Form form={form} onFinish={() => {}}>
                <>
                    <Row justify='center' gutter={[24, 24]}>
                        <h3
                            style={{
                                textAlign: 'center',
                                fontSize: '25px',
                                fontWeight: '500'
                            }}
                        >
                            Reservation Request
                        </h3>
                    </Row>
                    <Divider />
                    <Row justify='center' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Created date</b>
                        </Col>
                        <Col span={18}>
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
                        <Col span={6}>
                            <b>Student</b>
                        </Col>
                        <Col span={3}>ID</Col>
                        <Col span={6}>
                            <Form.Item>
                                <Tag color='cyan'>{request?.student?.id}</Tag>
                            </Form.Item>
                        </Col>
                        <Col span={3}>Name</Col>
                        <Col span={6}>
                            <Form.Item>
                                <p>{request?.student?.full_name}</p>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Time</b>
                        </Col>
                        <Col span={3}>
                            <p>From Date</p>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Tag color='orange'>
                                    {request?.start_time &&
                                        moment(request.start_time).format(
                                            'DD/MM/YYYY'
                                        )}
                                </Tag>
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <p>To Date</p>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Tag color='orange'>
                                    {request?.end_time &&
                                        moment(request.end_time).format(
                                            'DD/MM/YYYY'
                                        )}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Package</b>
                        </Col>
                        <Col span={12}>
                            <Form.Item>
                                {request?.ordered_package?.package_name}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Student Note</b>
                        </Col>
                        <Col span={12}>
                            <Form.Item>{request?.student_note}</Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Total reservation days</b>
                        </Col>
                        <Col span={3}>
                            <Form.Item>
                                <Tag color='blue'>
                                    {(() => {
                                        const startDate = moment(
                                            request?.start_time
                                        )
                                        const endDate = moment(
                                            request?.end_time
                                        )
                                        const duration = moment.duration(
                                            endDate.diff(startDate)
                                        )
                                        return duration.asDays()
                                    })()}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Fee</b>
                        </Col>
                        <Col span={3}>
                            <Form.Item name='price'>
                                <Input />

                                {/* <Tag color='red'>{request?.price}</Tag> */}
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item>
                                <Button
                                    key='back'
                                    type='primary'
                                    onClick={updateFee}
                                >
                                    Set Fee
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Status</b>
                        </Col>
                        <Col span={3}>
                            <Form.Item>
                                <Tag color={colorStatus(values.status)}>
                                    {_.startCase(
                                        EnumStudentReservationRequestStatus[
                                            values.status
                                        ]
                                    )}
                                </Tag>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='start' gutter={[24, 24]}>
                        <Col span={6}>
                            <b>Admin note</b>
                        </Col>
                        <Col span={12}>
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
            title={`Reservation Request review form ${request?.student?.full_name}`}
            // footer={false}
            footer={[
                checkPermission(PERMISSIONS.tmrr_reject) && (
                    <Button
                        key='back'
                        type='default'
                        style={{
                            backgroundColor: 'red',
                            borderColor: 'red',
                            color: 'white'
                        }}
                        onClick={declineRequest}
                    >
                        Reject
                    </Button>
                ),
                checkPermission(PERMISSIONS.tmrr_approve) && (
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
            width='80%'
        >
            {renderBody()}
        </Modal>
    )
}

export default ApprovalModal
