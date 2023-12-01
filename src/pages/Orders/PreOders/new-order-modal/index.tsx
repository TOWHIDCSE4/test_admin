import { FC, useCallback, useEffect, useState } from 'react'
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
    Tooltip,
    Alert
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
import WalletAPI from 'api/WalletAPI'
import LocationAPI from 'api/LocationAPI'
import { IModalProps } from 'const/common'

const { Option } = Select

const NewOrderModal = ({ visible, toggleModal, refetchData }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [orderedPackages, setOrderedPackages] = useState([])
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [selectedStudentId, setSelectedStudentId] = useState(null)
    const [totalPrice, setTotalPrice] = useState(0)
    const [orderStatus, setOrderStatus] = useState(1)
    const [adminNote, setAdminNote] = useState('')
    const [typePackage, setTypePackage] = useState(EnumPackageOrderType.TRIAL)
    const [studentBalance, setStudentBalance] = useState(0)
    const [typeLocation, setTypeLocation] = useState('')
    const [number_class, setNumber_class] = useState('')
    const [listLocation, setListLocation] = useState([])
    const [revenue, setRevenue] = useState(0)

    const onClose = () => {
        setTypeLocation('')
        setTypePackage(EnumPackageOrderType.TRIAL)
        setOrderedPackages([])
        setStudentBalance(0)
        setSelectedStudentId(null)
        setSelectedPackage(null)
        setTotalPrice(0)
        setRevenue(0)
        setNumber_class('')
        setAdminNote('')
        form.resetFields()
        setTimeout(() => {
            toggleModal(false)
        }, 100)
    }
    const createOrder = async () => {
        setLoading(true)
        try {
            const package_list = orderedPackages.map((item) => {
                const tmp = {
                    activation_date:
                        item.activation_date ||
                        moment().startOf('day').valueOf(),
                    ordered_package_id: item.id,
                    package_id: item.id,
                    id: item.id,
                    amount: item.amount,
                    number_class: item.number_class,
                    paid_number_class: item.paid_number_class
                }
                return tmp
            })
            const res = await OrderAPI.createPreOrderWithRevenue({
                package_list,
                user_id: selectedStudentId,
                status: orderStatus,
                admin_note: adminNote,
                revenue
            })

            if (res) {
                onClose()
                refetchData()
                notify('success', 'Tạo đơn hàng thành công')
            }
        } catch (error) {
            notify('error', error.message)
        }
        setLoading(false)
    }

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

    const fetchPackage = async (query?) => {
        const res = await PackageAPI.getPackages({
            page_number: 1,
            page_size: 100,
            type: typePackage,
            location_id: typeLocation,
            number_class,
            search: '',
            is_active: true,
            ...query
        })

        return res.data.map((i) => ({
            label: i.name,
            value: JSON.stringify(i)
        }))
    }

    const addPackage = (pk) => {
        if (!pk) return
        const p = JSON.parse(pk)
        p.amount = 1
        p.paid_number_class = p.number_class
        setOrderedPackages([...orderedPackages, p])
        setSelectedPackage(null)
        setTotalPrice(totalPrice + p.price * p.amount)
    }

    const removePackage = (id) => {
        setOrderedPackages(orderedPackages.filter((item) => item.id !== id))
        setTotalPrice(
            totalPrice -
                orderedPackages.find((item) => item.id === id).price *
                    orderedPackages.find((item) => item.id === id).amount
        )
    }

    const onChangeAmount = (id, action) => {
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
    }

    const onChangeActivationDate = (id, value) => {
        const p = orderedPackages.find((item) => item.id === id)
        if (!p) return
        p.activation_date = moment(value).startOf('day').valueOf()
        setOrderedPackages([...orderedPackages])
    }

    const onChangePaidNumberClass = (id, value) => {
        const p = orderedPackages.find((item) => item.id === id)

        if (!p) return
        p.paid_number_class = value
        setOrderedPackages([...orderedPackages])
    }

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
    const getLocation = async () => {
        try {
            const res = await LocationAPI.getLocations()
            if (res) {
                setListLocation(res.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setRevenue(totalPrice)
        form.setFieldValue('revenue', totalPrice)
    }, [totalPrice])

    useEffect(() => {
        onClose()
        getLocation()
    }, [])
    const changeType = (val) => {
        fetchPackage({ type: val })
        setTypePackage(val)
    }
    const changeLocation = (val) => {
        fetchPackage({ location_id: val })
        setTypeLocation(val)
    }
    const changeNumberClass = (val) => {
        fetchPackage({ number_class: val.target.value })
        setNumber_class(val.target.value)
    }
    const changeRevenue = (val) => {
        setRevenue(val.target.value)
    }
    const getBalance = async (id) => {
        try {
            const res = await WalletAPI.getBalance({ id })
            if (res) {
                setStudentBalance(res.total_balance)
            } else {
                setStudentBalance(0)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Modal
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => onClose()}
            title='Create new pre order'
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
                    <Col span={8}>
                        <Form.Item required name='studentId'>
                            <DebounceSelect
                                placeholder='Search by student'
                                fetchOptions={fetchStudent}
                                allowClear
                                style={{ width: '100%' }}
                                onSelect={(v) => {
                                    setSelectedStudentId(v)
                                    getBalance(v)
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <b>Student Balance</b>
                    </Col>
                    <Col span={8}>{toReadablePrice(studentBalance)}</Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Type Package</b>
                    </Col>
                    <Col span={8}>
                        <Form.Item required name='type'>
                            <Select
                                placeholder='Choose type package'
                                optionFilterProp='children'
                                defaultValue={typePackage}
                                value={typePackage}
                                onChange={changeType}
                            >
                                <Option value={EnumPackageOrderType.TRIAL}>
                                    {_.findKey(
                                        EnumPackageOrderType,
                                        (o) => o === EnumPackageOrderType.TRIAL
                                    )}
                                </Option>
                                <Option value={EnumPackageOrderType.STANDARD}>
                                    {_.findKey(
                                        EnumPackageOrderType,
                                        (o) =>
                                            o === EnumPackageOrderType.STANDARD
                                    )}
                                </Option>
                                <Option value={EnumPackageOrderType.PREMIUM}>
                                    {_.findKey(
                                        EnumPackageOrderType,
                                        (o) =>
                                            o === EnumPackageOrderType.PREMIUM
                                    )}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <b>Location</b>
                    </Col>
                    <Col span={8}>
                        <Form.Item required name='location'>
                            <Select
                                placeholder='Choose location'
                                optionFilterProp='children'
                                defaultValue={typeLocation}
                                value={typeLocation}
                                onChange={changeLocation}
                            >
                                <Option value=''>All</Option>
                                {listLocation.map((e, index) => (
                                    <Option value={e.id}>{e.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Number class</b>
                    </Col>
                    <Col span={8}>
                        <Form.Item name='number_class'>
                            <Input type='number' onChange={changeNumberClass} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <b>Package</b>
                    </Col>
                    <Col span={8}>
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
                    <Col span={4}></Col>
                    <Col span={8}>
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
                    <Col span={8}>
                        <Form.Item name='total_price'>
                            {toReadablePrice(totalPrice)}
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Revenue</b>
                    </Col>
                    <Col span={8}>
                        <Form.Item name='revenue'>
                            <Input
                                value={revenue}
                                type='number'
                                onChange={changeRevenue}
                            ></Input>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <b>Admin note</b>
                    </Col>
                    <Col span={8}>
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
