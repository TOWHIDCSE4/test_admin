import {
    Button,
    DatePicker,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tag,
    Tooltip
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import OrderAPI from 'api/OrderAPI'
import { IModalProps, MODAL_TYPE } from 'const'
import { DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { red, yellow } from '@ant-design/colors'
import _ from 'lodash'
import moment from 'moment'
import { FC, useCallback, useEffect, useReducer, useState } from 'react'
import { EnumPackageOrderType, IOrder, IOrderedPackage } from 'types'
import { toReadableDatetime } from 'utils/datetime'
import { notify } from 'utils/notify'
import { toReadablePrice } from 'utils/price'
import PackageAPI from 'api/PackageAPI'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

interface IProps extends IModalProps {
    data?: IOrder
    type: MODAL_TYPE
    refetchData: () => void
}

const EditOrderModal: FC<IProps> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            order_info: {
                new_status: ''
            }
        }
    )

    const [order, setOrder] = useState<IOrder>()
    const [orderedPackages, setOrderedPackages] = useState<IOrderedPackage[]>(
        []
    )

    const fetchDetailOrder = (id: number) => {
        OrderAPI.getDetailOrder(id).then((res) => {
            if (res.order) {
                setOrder(res.order)
            }
            if (res.ordered_packages) {
                setOrderedPackages(res.ordered_packages)
            }
        })
    }

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            setValues({
                isShown: true,
                order_info: { ...data, new_status: '' }
            })
            fetchDetailOrder(data.id)
        }
    }, [visible])

    const removeOrderedPackages = async (item) => {
        try {
            const res = await PackageAPI.removeOrderedPackages({
                _id: item?._id
            })
            if (res) {
                notify('success', 'Xóa ordered package thành công')
                fetchDetailOrder(data.id)
            }
        } catch (error) {
            console.log(error)
            notify('error', error.message)
        }
    }

    const stopOrderedPackages = async (item) => {
        try {
            const res = await PackageAPI.stopOrderedPackages({ _id: item?._id })
            if (res) {
                notify('success', 'Đã dừng ordered package')
                fetchDetailOrder(data.id)
            }
        } catch (error) {
            console.log(error)
            notify('error', error.message)
        }
    }

    const onChangeForm = (key) => (e) => {
        const value =
            e.target.type === 'checkbox' ? e.target.checked : e.target.value
        const { order_info } = values
        order_info[key] = value
        setValues({ order_info })
    }

    const onClose = () => {
        toggleModal(false)
        setValues({
            isLoading: false,
            order_info: {
                new_status: ''
            }
        })
    }

    const onSave = async (e) => {
        if (e) e.preventDefault()
        const { order_info } = values
        setValues({ isLoading: true })
        let package_list = orderedPackages.map((item) => {
            const tmp = {
                ordered_package_id: item.id,
                paid_number_class: item.paid_number_class,
                id: item.id
            }
            return tmp
        })
        const diff: any = {
            admin_note: order_info.admin_note,
            package_list
        }
        if (order_info.status === 2 && order_info.new_status) {
            diff.status = _.toInteger(order_info.new_status)
            package_list = orderedPackages.map((item) => {
                const tmp = {
                    activation_date: moment().valueOf(),
                    ordered_package_id: item.id,
                    paid_number_class: item.paid_number_class,
                    id: item.id
                }
                return tmp
            })
            diff.package_list = package_list
        }
        OrderAPI.updateStatusOrder(order_info.id, { ...diff })
            .then((res) => {
                notify('success', 'Updated Successfully')
                toggleModal(false)
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const onChangeActivationDate = useCallback(
        (id, value) => {
            const { order_info } = values
            const p = orderedPackages.find((item) => item.id === id)
            if (!p) return
            p.activation_date = moment(value).startOf('day').valueOf()
            const package_list = orderedPackages.map((item) => {
                const tmp = {
                    activation_date: item.activation_date,
                    ordered_package_id: item.id,
                    id: item.id
                }
                return tmp
            })
            OrderAPI.updateStatusOrder(order_info.id, { package_list })
                .then((res) => {
                    notify('success', 'Updated Activation date successfully')
                    // toggleModal(false)
                    refetchData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setValues({ isLoading: false }))
            setOrderedPackages([...orderedPackages])
        },
        [orderedPackages]
    )

    const onChangePaidNumberClass = useCallback(
        (id, value) => {
            const p = orderedPackages.find((item) => item.id === id)
            if (!p) return
            p.paid_number_class = value
            const package_list = orderedPackages.map((item) => {
                const tmp = {
                    ...item,
                    paid_number_class: item.paid_number_class,
                    ordered_package_id: item.id,
                    id: item.id
                }
                return tmp
            })
            setOrderedPackages([...package_list])
        },
        [orderedPackages]
    )

    const columns: ColumnsType<IOrderedPackage> = [
        {
            title: 'Package',
            dataIndex: 'package_name',
            key: 'package_name',
            width: '20%',
            align: 'center'
        },
        {
            title: `Usage`,
            dataIndex: 'number_class',
            key: 'number_class',
            width: '10%',
            align: 'center',
            render: (text, record) =>
                `${record.original_number_class - text}/${
                    record.original_number_class
                }`
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
                <>
                    <InputNumber
                        disabled
                        defaultValue={0}
                        value={text}
                        onChange={(v) => onChangePaidNumberClass(record.id, v)}
                        min={0}
                        max={record.original_number_class}
                        placeholder='If value equal 0, this means that the student has paid all of the classes.'
                    />
                </>
            )
        },
        {
            title: `Activation Date`,
            dataIndex: 'activation_date',
            key: 'activation_date',
            width: '20%',
            align: 'center',
            render: (text, record) => {
                if (!text)
                    return (
                        <DatePicker
                            format='DD/MM/YYYY'
                            onChange={(v) =>
                                onChangeActivationDate(record.id, v)
                            }
                        />
                    )
                return (
                    <DatePicker
                        value={moment(text)}
                        format='DD/MM/YYYY'
                        onChange={(v) => onChangeActivationDate(record.id, v)}
                    />
                )
            }
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
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (text, record: any) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.ompo_approve) &&
                        record.type !== EnumPackageOrderType.TRIAL &&
                        record.original_number_class > record.number_class &&
                        record.number_class > 0 && (
                            <Popconfirm
                                placement='topLeft'
                                title='Bạn có chắc chắn muốn dừng ordered package này không?'
                                onConfirm={() => stopOrderedPackages(record)}
                                overlayInnerStyle={{ maxWidth: '300px' }}
                                okText='Chấp nhận'
                                cancelText='Đóng'
                            >
                                <StopOutlined
                                    style={{ color: yellow.primary }}
                                    type='button'
                                    title='Stop ordered package'
                                />
                            </Popconfirm>
                        )}
                    {checkPermission(PERMISSIONS.omao_op_delete) &&
                        orderedPackages &&
                        orderedPackages.length > 1 &&
                        record.type !== EnumPackageOrderType.TRIAL &&
                        record.original_number_class ===
                            record.number_class && (
                            <Popconfirm
                                placement='topLeft'
                                title='Xóa order package sẽ xóa lịch sử trong báo cáo tái ký. Bạn có chắc chắn muốn xóa không?'
                                onConfirm={() => removeOrderedPackages(record)}
                                overlayInnerStyle={{ maxWidth: '300px' }}
                                okText='Chấp nhận'
                                cancelText='Đóng'
                            >
                                <DeleteOutlined
                                    style={{ color: red.primary }}
                                    type='button'
                                    title='Delete ordered package'
                                />
                            </Popconfirm>
                        )}
                </Space>
            )
        }
    ]
    const renderBody = () => (
        <>
            <Table
                dataSource={orderedPackages}
                columns={columns}
                pagination={{
                    defaultCurrent: 1,
                    pageSize: 10,
                    total: orderedPackages.length
                }}
                scroll={{
                    y: 500
                }}
                rowKey={(record: any) => record.id}
            />
            <div className='form-group row'>
                <div className='col-sm-3'>
                    <span className='control-label font-weight-bolder'>
                        Total Bill
                    </span>
                </div>
                <div className='col-sm-9'>
                    <input
                        type='text'
                        className='form-control'
                        placeholder='Total Bill'
                        name='total_bill'
                        readOnly
                        value={
                            values.order_info.total_bill &&
                            toReadablePrice(values.order_info.total_bill)
                        }
                    />
                </div>
            </div>
            <div className='form-group row'>
                <div className='col-sm-3'>
                    <span className='control-label font-weight-bolder'>
                        Created Date
                    </span>
                </div>
                <div className='col-sm-9'>
                    <input
                        type='text'
                        className='form-control'
                        name='created_time'
                        readOnly
                        value={
                            values.order_info.created_time &&
                            toReadableDatetime(values.order_info.created_time)
                                .date
                        }
                    />
                </div>
            </div>
            <div className='form-group row'>
                <div className='col-sm-3'>
                    <span className='control-label font-weight-bolder'>
                        Paid Status
                    </span>
                </div>
                <div className='col-sm-9'>
                    {values.order_info.status === 1 ? (
                        <span className='badge badge-success'>Paid</span>
                    ) : values.order_info.status === 2 ? (
                        <span className='badge badge-warning'>UnPaid</span>
                    ) : null}
                </div>
            </div>
            <div className='form-group row'>
                <div className='col-sm-3'>
                    <span className='control-label font-weight-bolder'>
                        Admin Note
                    </span>
                </div>
                <div className='col-sm-9'>
                    <textarea
                        className='form-control'
                        placeholder='Admin Note'
                        name='admin_note'
                        value={values.order_info.admin_note}
                        onChange={onChangeForm('admin_note')}
                    />
                </div>
            </div>
            <div className='row ml-1'>
                <p
                    style={{
                        color: '#ff4d4f',
                        fontSize: '13px',
                        fontStyle: 'italic'
                    }}
                >
                    Note: If Paid number classes equal 0, this means that the
                    student has paid all of the classes
                </p>
            </div>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new order'
                    : 'Edit order information'
            }
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Close
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={onSave}
                    loading={values.isLoading}
                >
                    Save
                </Button>
            ]}
            width={1200}
        >
            {renderBody()}
        </Modal>
    )
}

export default EditOrderModal
