import { useEffect, memo, useState, FunctionComponent } from 'react'
import { Modal, Button, Form, Input, Row, Table } from 'antd'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import { Link, useLocation } from 'react-router-dom'
import { EnumPackageOrderType } from 'types'

const { TextArea } = Input

interface Props {
    visible: boolean
    toggleModal: (visible: boolean) => void
    data: any
}

const EditTextModal: FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, data } = props
    const [listRenew, setListRenew] = useState([])
    const [listExtend, setListExtend] = useState([])
    const [listExprire, setListExprire] = useState([])

    useEffect(() => {
        console.log(data)
        if (data?.students_renew) {
            setListRenew(data.students_renew)
        }
        if (data?.students_extend) {
            setListExtend(data.students_extend)
        }
        if (data?.students_exprire) {
            setListExprire(data.students_exprire)
        }
    }, [visible])

    const columnsStudent: ColumnsType<any> = [
        {
            title: 'Name',
            dataIndex: 'student_name',
            key: 'student_name',
            align: 'center',
            render: (text, record) => {
                return (
                    <>
                        {text} - {record.student_username}
                    </>
                )
            }
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue_renew',
            key: 'revenue_renew',
            align: 'right',
            render: (text, record) => Intl.NumberFormat('en-US').format(text)
        }
    ]

    const columnsOrderedPackage: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            render: (text, record) => {
                return <>{text}</>
            }
        },
        {
            title: 'Name',
            dataIndex: 'package_name',
            key: 'package_name',
            align: 'center',
            render: (text, record) => {
                return <>{text}</>
            }
        },
        {
            title: 'Order ID',
            dataIndex: 'orderid',
            key: 'orderid',
            align: 'center',
            render: (text, record) => {
                return <>{record?.order?.id}</>
            }
        },
        {
            title: 'Admin note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            render: (text, record) => {
                return <>{record?.order?.admin_note}</>
            }
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (text, record) =>
                Intl.NumberFormat('en-US').format(record?.order?.price)
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            align: 'right',
            render: (text, record) =>
                Intl.NumberFormat('en-US').format(record?.order?.discount)
        },
        {
            title: 'Total Bill',
            dataIndex: 'total_bill',
            key: 'total_bill',
            align: 'right',
            render: (text, record) =>
                Intl.NumberFormat('en-US').format(record?.order?.total_bill)
        }
    ]

    const columnsStudentExtend: ColumnsType<any> = [
        {
            title: 'Name',
            dataIndex: 'student_name',
            key: 'student_name',
            align: 'center',
            render: (text, record) => {
                return (
                    <>
                        {text} - {record.student_username}
                    </>
                )
            }
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue_extend',
            key: 'revenue_extend',
            align: 'right',
            render: (text, record) => Intl.NumberFormat('en-US').format(text)
        }
    ]
    const columnsStudentExtendDetail: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Package Name',
            dataIndex: 'package_name',
            key: 'package_name',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Student Note',
            dataIndex: 'student_note',
            key: 'student_note',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Admin Note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (text, record) => Intl.NumberFormat('en-US').format(text)
        }
    ]

    const columnsExprire: ColumnsType<any> = [
        {
            title: 'Name',
            dataIndex: 'student_name',
            key: 'student_name',
            align: 'center',
            render: (text, record) => {
                return (
                    <>
                        {text} - {record.student_username}
                    </>
                )
            }
        }
    ]
    const columnsExpriredPackage: ColumnsType<any> = [
        {
            title: 'Orrder ID',
            dataIndex: 'order_id',
            key: 'order_id',
            align: 'center',
            render: (text, record) => {
                return <>{text}</>
            }
        },
        {
            title: 'Orrdered Package ID',
            dataIndex: 'ordered_package_id',
            key: 'ordered_package_id',
            align: 'center',
            render: (text, record) => {
                return <>{text}</>
            }
        },
        {
            title: 'Name',
            dataIndex: 'package_name',
            key: 'package_name',
            align: 'center',
            render: (text, record) => {
                return <>{text}</>
            }
        },
        {
            title: 'Exprire At',
            dataIndex: 'expired_date',
            key: 'expired_date',
            align: 'center',
            render: (text, record) => {
                return <>{moment(text).format('DD/MM/YYYY')}</>
            }
        }
    ]

    return (
        <Modal
            centered
            closable
            maskClosable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Detail'
            footer={null}
            width={1000}
        >
            <h4 className='mt-2'>List Renew:</h4>
            <Table
                dataSource={listRenew}
                columns={columnsStudent}
                rowKey={(record) => `renew-${record.user_id}`}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                expandable={{
                    expandedRowRender: (record: any) => (
                        <>
                            <h5>List Ordered Package</h5>
                            <Table
                                pagination={{ pageSize: 3 }}
                                bordered
                                columns={columnsOrderedPackage}
                                dataSource={record.list_ordered_package.map(
                                    (d, i) => ({
                                        key: `ordered${i}`,
                                        ...d
                                    })
                                )}
                            />
                        </>
                    )
                }}
            />
            <h4 className='mt-2'>List Extend:</h4>
            <Table
                dataSource={listExtend}
                columns={columnsStudentExtend}
                rowKey={(record) => `extend-${record.user_id}`}
                scroll={{
                    x: 500,
                    y: 768
                }}
                expandable={{
                    expandedRowRender: (record: any) => (
                        <>
                            <Table
                                pagination={{ pageSize: 3 }}
                                bordered
                                columns={columnsStudentExtendDetail}
                                dataSource={record.list.map((d, i) => ({
                                    key: `extend-detail${i}`,
                                    ...d
                                }))}
                            />
                        </>
                    )
                }}
                bordered
            />
            <h4 className='mt-2'>List Exprire:</h4>
            <Table
                dataSource={listExprire}
                columns={columnsExprire}
                rowKey={(record) => `exprire-${record.user_id}`}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                expandable={{
                    expandedRowRender: (record: any) => (
                        <>
                            <h5>List Package Exprire</h5>
                            <Table
                                pagination={{ pageSize: 3 }}
                                bordered
                                columns={columnsExpriredPackage}
                                dataSource={record.package.map((d, i) => ({
                                    key: `package-exprire${i}`,
                                    ...d
                                }))}
                            />
                        </>
                    )
                }}
            />
        </Modal>
    )
}

export default EditTextModal
