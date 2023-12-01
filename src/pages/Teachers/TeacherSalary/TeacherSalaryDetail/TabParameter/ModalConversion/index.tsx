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

const EditTextModal: FunctionComponent<Props> = memo((props) => {
    const { visible, toggleModal, data } = props

    useEffect(() => {}, [visible])

    const columns: ColumnsType<any> = [
        {
            title: 'Ordered Package ID',
            dataIndex: 'ordered_package_id',
            key: 'ordered_package_id',
            fixed: 'left',
            width: '100px',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            fixed: 'left',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Package',
            dataIndex: 'package_name',
            key: 'package_name',
            fixed: 'left',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            fixed: 'left',
            align: 'center',
            render: (text, record) => (
                <>
                    <p>{`${moment(record.start_time).format(
                        'HH:mm DD/MM/YYYY'
                    )}`}</p>
                </>
            )
        }
    ]

    return (
        <Modal
            centered
            closable
            maskClosable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='List Conversion'
            footer={null}
            width={800}
        >
            <Table
                dataSource={data}
                columns={columns}
                rowKey={(record) => record.id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
            />
        </Modal>
    )
})

export default EditTextModal
