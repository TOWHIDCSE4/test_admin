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
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: '100px',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Student',
            dataIndex: 'full_name',
            key: 'full_name',
            fixed: 'left',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Package',
            dataIndex: 'package',
            key: 'package',
            fixed: 'left',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Slot Time',
            dataIndex: 'time',
            key: 'time',
            fixed: 'left',
            align: 'center',
            render: (text, record) => (
                <>
                    <p>{`${moment(record.timestamp).format(
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
            title='List regular calendar'
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
