import {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
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
    Tag,
    Select
} from 'antd'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import OrderAPI from 'api/OrderAPI'
import ReservationAPI from 'api/ReservationAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import moment, { relativeTimeRounding } from 'moment'
import { IModalProps } from 'const/common'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { EnumOrderType } from 'const'

const { Option } = Select

interface IProps extends IModalProps {
    reload: () => void
    colorStatus: any
    createFunc: (payload: any) => Promise<any>
}

const AddReservationModal: FunctionComponent<IProps> = (props) => {
    const [form] = Form.useForm()

    const { visible, toggleModal, reload, colorStatus, createFunc } = props

    const [formTotalDays, setFormTotalDay] = useState<number>(0)
    const [orders, setOrders] = useState(null)
    const [formFee, setFormFee] = useState<number>(0)

    useEffect(() => {
        form.resetFields()
    }, [visible])

    const fetchStudent = useCallback(
        async (q) => {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
                role: 'STUDENT',
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        },
        [orders]
    )

    const getFee = useCallback((id) => {
        ReservationAPI.getFee({
            ordered_package_id: id,
            student_id: form.getFieldValue('student_id')
        })
            .then((res) => {
                form.setFieldsValue({ price: res.price })
                setFormFee(res.price)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }, [])

    const fetchOrders = useCallback(
        async (val: number) => {
            const res = await OrderAPI.getOrderedPackagesByUserId(val, {
                page_number: 1,
                page_size: 100,
                status: 1,
                type: [EnumOrderType.STANDARD, EnumOrderType.PREMIUM]
            })
            setOrders(res.data)
        },
        [orders]
    )

    function disabledStartDate(current) {
        // Can not select days before today and today
        return (
            (current && current < moment().endOf('day')) ||
            (form.getFieldValue('end_time') &&
                current &&
                current >
                    moment(form.getFieldValue('end_time').valueOf()).endOf(
                        'day'
                    ))
        )
    }

    function disabledEndDate(current) {
        return (
            current &&
            current <
                moment(form.getFieldValue('start_time')?.valueOf()).endOf('day')
        )
    }
    const changeStartEndTime = () => {
        const startDate = moment(
            form.getFieldValue('start_time')?.startOf('day').valueOf()
        )
        const endDate = moment(
            form.getFieldValue('end_time')?.startOf('day').valueOf()
        )
        const duration =
            startDate && endDate && moment.duration(endDate.diff(startDate))
        setFormTotalDay(duration.asDays())
    }

    const renderBody = () => (
        <Form form={form} onFinish={createFunc}>
            <>
                <Row justify='center' gutter={[24, 24]}>
                    <h3
                        style={{
                            textAlign: 'center',
                            fontSize: '25px',
                            fontWeight: 500
                        }}
                    >
                        New Reservation
                    </h3>
                </Row>
                <Divider />
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={6}>
                        <b>Student</b>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name='student_id'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <DebounceSelect
                                fetchOptions={fetchStudent}
                                onChange={(val) => {
                                    fetchOrders(val)
                                    form.setFieldsValue({ order: null })
                                }}
                            />
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
                        <Form.Item
                            name='start_time'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <DatePicker
                                onChange={changeStartEndTime}
                                picker='date'
                                // eslint-disable-next-line react/jsx-no-bind
                                disabledDate={disabledStartDate}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <p>To Date</p>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name='end_time'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <DatePicker
                                onChange={changeStartEndTime}
                                picker='date'
                                // eslint-disable-next-line react/jsx-no-bind
                                disabledDate={disabledEndDate}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={6}>
                        <b>Package</b>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name='order'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <Select onChange={getFee}>
                                {orders?.map((i) => (
                                    <Option key={i.id} value={i.id}>
                                        {i.package_name} - Expire At{' '}
                                        {moment(i.expired_date).format(
                                            'DD/MM/YYYY'
                                        )}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={6}>
                        <b>Student Note</b>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name='student_note'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={6}>
                        <b>Total reservation days</b>
                    </Col>
                    <Col span={3}>
                        <Form.Item>
                            {/* <Input disabled /> */}
                            <Tag color='blue'>{formTotalDays}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={6}>
                        <b>Fee</b>
                    </Col>
                    <Col span={3}>
                        <Form.Item>
                            <Tag color='red'>{formFee}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider />
                <Row justify='end' gutter={[24, 24]}>
                    {checkPermission(PERMISSIONS.tmrr_create) && (
                        <Form.Item>
                            <Button type='primary' htmlType='submit'>
                                Submit
                            </Button>
                        </Form.Item>
                    )}
                </Row>
            </>
        </Form>
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
            title='New Reservation Request'
            footer={false}
            width='80%'
        >
            {renderBody()}
        </Modal>
    )
}

export default AddReservationModal
