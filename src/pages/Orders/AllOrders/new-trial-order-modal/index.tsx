import { FC, useCallback, useState } from 'react'
import {
    Modal,
    Button,
    Tag,
    Table,
    Row,
    Col,
    Form,
    Divider,
    Select,
    Input,
    InputNumber,
    DatePicker,
    Tooltip
} from 'antd'
import OrderAPI from 'api/OrderAPI'
import { notify } from 'utils/notify'
import { toReadablePrice } from 'utils/price'
import { EnumPackageOrderType, IOrder, IOrderedPackage } from 'types'
import { ColumnsType } from 'antd/lib/table'
import _ from 'lodash'
import moment from 'moment'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'
import PackageAPI from 'api/PackageAPI'
import { IModalProps } from 'const/common'

const { Option } = Select

interface IProps extends IModalProps {
    refetchData: () => void
}

const NewOrderModal: FC<IProps> = ({ visible, toggleModal, refetchData }) => {
    const [loading, setLoading] = useState(false)
    const [orderedPackages, setOrderedPackages] = useState([])
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [selectedStudentId, setSelectedStudentId] = useState(null)
    const [totalPrice, setTotalPrice] = useState(0)
    const [orderStatus, setOrderStatus] = useState(1)
    const [adminNote, setAdminNote] = useState('')
    const [form] = Form.useForm()

    const onClose = () => {
        toggleModal(false)
        form.resetFields()
        setOrderedPackages([])
        setSelectedStudentId(null)
        setSelectedPackage(null)
        setTotalPrice(0)
    }

    const createOrder = useCallback(() => {
        setLoading(true)
        const package_list = orderedPackages.map((item) => {
            const tmp = {
                activation_date:
                    item.activation_date || moment().startOf('day').valueOf(),
                ordered_package_id: item.id,
                package_id: item.id,
                id: item.id,
                amount: item.amount,
                number_class: item.number_class
            }
            return tmp
        })
        OrderAPI.createOrder({
            package_list,
            user_id: selectedStudentId,
            status: orderStatus,
            admin_note: adminNote
        })
            .then((r) => {
                notify('success', 'Tạo đơn hàng thành công')
                toggleModal(false)
                refetchData()
                onClose()
            })
            .catch((e) => {
                notify('error', e.message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [orderedPackages, selectedStudentId, orderStatus, adminNote])

    const fetchStudent = useCallback(async (q) => {
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
    }, [])

    const fetchPackage = useCallback(async (search) => {
        const res = await PackageAPI.getPackages({
            page_number: 1,
            page_size: 100,
            type: EnumPackageOrderType.TRIAL,
            search,
            is_active: true
        })
        return res.data.map((i) => ({
            label: i.name,
            value: JSON.stringify(i)
        }))
    }, [])

    const addPackage = useCallback(
        (pk) => {
            if (!pk) return
            const p = JSON.parse(pk)
            p.amount = 1
            setOrderedPackages([...orderedPackages, p])
            setSelectedPackage(null)
            setTotalPrice(totalPrice + p.price * p.amount)
        },
        [orderedPackages, selectedPackage]
    )

    const removePackage = useCallback(
        (id) => {
            setOrderedPackages(orderedPackages.filter((item) => item.id !== id))
            setTotalPrice(
                totalPrice -
                    orderedPackages.find((item) => item.id === id).price *
                        orderedPackages.find((item) => item.id === id).amount
            )
        },
        [orderedPackages, selectedPackage]
    )

    const onChangeAmount = useCallback(
        (id, action) => {
            const p = orderedPackages.find((item) => item.id === id)
            if (!p) return
            if (action === 'add') {
                p.amount += 1
                setTotalPrice(totalPrice + p.price)
            } else {
                if (p.amount === 1) return
                p.amount -= 1
                setTotalPrice(totalPrice - p.price)
            }
            setOrderedPackages([...orderedPackages])
        },
        [orderedPackages, totalPrice]
    )

    const onChangeActivationDate = useCallback(
        (id, value) => {
            const p = orderedPackages.find((item) => item.id === id)
            if (!p) return
            p.activation_date = moment(value).startOf('day').valueOf()
            setOrderedPackages([...orderedPackages])
        },
        [orderedPackages]
    )

    const onChangePaidNumberClass = useCallback(
        (id, value) => {
            const p = orderedPackages.find((item) => item.id === id)
            if (!p) return
            p.paid_number_class = value
            setOrderedPackages([...orderedPackages])
        },
        [orderedPackages]
    )

    const columns: ColumnsType<IOrderedPackage> = [
        {
            title: 'Package',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            align: 'center'
        },
        {
            title: (
                <Tooltip title='If value equal 0, this means that the student has paid all of the classes.'>
                    Paid number class
                </Tooltip>
            ),
            dataIndex: 'paid_number_class',
            key: 'paid_number_class',
            width: '20%',
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    defaultValue={0}
                    value={text}
                    onChange={(v) => onChangePaidNumberClass(record.id, v)}
                    min={0}
                    max={record.number_class}
                    placeholder='If value equal 0, this means that the student has paid all of the classes.'
                />
            )
        },
        {
            title: `Activation Date`,
            dataIndex: 'activation_date',
            key: 'activation_date',
            width: '20%',
            align: 'center',
            render: (text, record: any) => (
                <DatePicker
                    defaultValue={moment(text)}
                    format='DD/MM/YYYY'
                    onChange={(v) => onChangeActivationDate(record.id, v)}
                />
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: '10%',
            align: 'center',
            render: (text, record) => toReadablePrice(text)
        },
        {
            title: `Type`,
            dataIndex: 'type',
            key: 'type',
            width: '20%',
            align: 'center',
            render: (text) => {
                if (text === EnumPackageOrderType.STANDARD)
                    return <Tag color='#108ee9'>STANDARD</Tag>
                if (text === EnumPackageOrderType.PREMIUM)
                    return <Tag color='#f50'>PREMIUM</Tag>
                if (text === EnumPackageOrderType.TRIAL)
                    return <Tag color='#87d068'>TRIAL</Tag>
            }
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: '20%',
            align: 'center',
            render: (text, record: any) => (
                <InputNumber
                    addonBefore={
                        <span
                            className='clickable'
                            onClick={() => onChangeAmount(record.id, 'remove')}
                        >
                            -
                        </span>
                    }
                    addonAfter={
                        <span
                            className='clickable'
                            onClick={() => onChangeAmount(record.id, 'add')}
                        >
                            +
                        </span>
                    }
                    min={1}
                    max={10}
                    defaultValue={record.amount}
                    value={record.amount}
                    style={{ width: '100px' }}
                    controls={false}
                />
            )
        },
        {
            title: `Action`,
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            align: 'center',
            render: (text) => (
                <Button
                    onClick={() => removePackage(text)}
                    type='default'
                    style={{
                        backgroundColor: 'red',
                        borderColor: 'red',
                        color: 'white'
                    }}
                >
                    Remove
                </Button>
            )
        }
    ]
    return (
        <Modal
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Create new trial order'
            footer={[
                <Button key='back' type='default' onClick={() => onClose()}>
                    Cancel
                </Button>,
                <Button
                    disabled={!selectedStudentId || !orderedPackages.length}
                    key='submit'
                    type='primary'
                    loading={loading}
                    onClick={() => createOrder()}
                >
                    Add
                </Button>
            ]}
            width={1200}
        >
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Table
                        dataSource={orderedPackages.map((d, i) => ({
                            key: i,
                            ...d
                        }))}
                        columns={columns}
                        pagination={false}
                    />
                </Col>
            </Row>
            <Divider />
            <Form name='basic' layout='vertical' form={form} autoComplete='off'>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Student</b>
                    </Col>
                    <Col span={16}>
                        <Form.Item required name='student'>
                            <DebounceSelect
                                placeholder='Search by student'
                                fetchOptions={fetchStudent}
                                allowClear
                                style={{ width: '100%' }}
                                onSelect={(v) => {
                                    setSelectedStudentId(v)
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <i style={{ color: 'red' }}>*required</i>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Package</b>
                    </Col>
                    <Col span={12}>
                        <Form.Item name='package'>
                            <DebounceSelect
                                placeholder='Search by package'
                                fetchOptions={fetchPackage}
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedPackage}
                                // onChange={(v) => handlerStudentFilter(v)}
                                onSelect={(v) => {
                                    setSelectedPackage(v)
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item>
                            <Button
                                key='back'
                                type='primary'
                                onClick={() => addPackage(selectedPackage)}
                            >
                                Add package to order
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Total Price</b>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='total'>
                            {toReadablePrice(totalPrice)}
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Status</b>
                    </Col>
                    <Col span={4}>
                        <Form.Item>
                            <Input value='Paid' disabled></Input>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Admin note</b>
                    </Col>
                    <Col span={4}>
                        <Form.Item name='admin_note'>
                            <Input
                                onChange={(v) => setAdminNote(v.target.value)}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default NewOrderModal
