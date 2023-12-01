import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Row,
    Col,
    Form,
    Input,
    Button,
    notification,
    Divider,
    Tag,
    Select,
    Upload,
    Space
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import _ from 'lodash'
import UserAPI from 'api/UserAPI'
import OrderAPI from 'api/OrderAPI'
import ExtensionAPI from 'api/ExtensionAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import moment from 'moment'
import { POINT_VND_RATE, EnumOrderType, IModalProps } from 'const'
import UploadAPI from 'api/UploadAPI'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { Option } = Select

interface IProps extends IModalProps {
    reload: () => void
    createFunc: (payload: any) => Promise<any>
}

const AddExtensionModal: FunctionComponent<IProps> = (props) => {
    const [form] = Form.useForm()

    const { visible, toggleModal, reload, createFunc } = props

    const [orders, setOrders] = useState(null)
    const [formFee, setFormFee] = useState<number>(0)
    const [days, setFormDays] = useState<number>(0)
    const [isLoading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(false)
        form.resetFields()
    }, [visible])

    const onCreate = useCallback(
        async (values) => {
            setLoading(true)
            createFunc(values)
        },
        [form]
    )

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

    const fetchOrderPackages = async (val: string) => {
        return orders?.map((i) => ({
            label: `(${i.order_id}) ${i.package_name} - Expire ${moment(
                i.expired_date
            ).format('DD/MM/YYYY')}`,
            value: i.id
        }))
    }

    const getFee = useCallback((id) => {
        ExtensionAPI.getFee({
            ordered_package_id: id,
            student_id: form.getFieldValue('student_id')
        })
            .then((res) => {
                form.setFieldsValue({
                    price1: Intl.NumberFormat('en-US').format(
                        res.price / POINT_VND_RATE
                    )
                })
                form.setFieldsValue({ price: 0 })
                form.setFieldsValue({ days: res.number_of_days })
                setFormFee(res.price)
                setFormDays(res.number_of_days)
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
                expired: 'any',
                gte_number_class: 1,
                // status: 1,
                type: [EnumOrderType.STANDARD, EnumOrderType.PREMIUM]
            })
            setOrders(res.data)
        },
        [orders]
    )

    const renderBody = () => (
        <Form form={form} onFinish={onCreate}>
            <>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={8}>Student</Col>
                    <Col span={16}>
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
                    <Col span={8}>Package</Col>
                    <Col span={16}>
                        <Form.Item
                            name='order'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <DebounceSelect
                                fetchOptions={fetchOrderPackages}
                                showSearch={false}
                                onChange={getFee}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={8}>Days</Col>
                    <Col span={16}>
                        <Form.Item
                            name='days'
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
                    <Col span={8}>Student Note</Col>
                    <Col span={16}>
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
                    <Col span={8}>Original Fee(Beans)</Col>
                    <Col span={16}>
                        <Form.Item
                            name='price1'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={8}>Fee(Beans)</Col>
                    <Col span={16}>
                        <Form.Item
                            name='price'
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify='start' gutter={[24, 24]}>
                    <Col span={8}>File</Col>
                    <Col span={16}>
                        <Form.Item
                            name='proof_files'
                            labelAlign='left'
                            help={
                                <span
                                    style={{
                                        fontSize: '12px',
                                        fontStyle: 'italic',
                                        color: 'red'
                                    }}
                                >
                                    File size limit 10MB. Allowed file types:
                                    jpg | jpeg | png | pdf | xlsx | pptx | xls |
                                    ppt | mp3
                                </span>
                            }
                            className='w-100 mb-2'
                        >
                            <Upload
                                listType='picture'
                                multiple={true}
                                maxCount={30}
                                beforeUpload={() => false}
                            >
                                <Space direction='horizontal' size={16}>
                                    <Button icon={<UploadOutlined />}>
                                        Upload
                                    </Button>
                                </Space>
                            </Upload>
                        </Form.Item>
                    </Col>
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
            title='New Extension Request'
            width='800px'
            footer={[
                checkPermission(PERMISSIONS.tmer_create_pro) && (
                    <Button
                        key='submit'
                        type='primary'
                        loading={isLoading}
                        style={{ background: 'green', borderColor: 'green' }}
                        onClick={() => form.submit()}
                    >
                        Pro Submit
                    </Button>
                ),
                !checkPermission(PERMISSIONS.tmer_create_pro) && (
                    <Button
                        key='submit'
                        type='primary'
                        loading={isLoading}
                        style={{ background: 'green', borderColor: 'green' }}
                        onClick={() => form.submit()}
                    >
                        Submit
                    </Button>
                )
            ]}
        >
            {renderBody()}
        </Modal>
    )
}

export default AddExtensionModal
