/* eslint-disable no-empty-pattern */
import React, {
    forwardRef,
    useState,
    memo,
    useCallback,
    useImperativeHandle,
    useEffect
} from 'react'
import { Checkbox, Col, Form, Modal, Row, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import DepartmentAPI from 'api/DepartmentAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import { notify } from 'utils/notify'
import { useForm } from 'antd/lib/form/Form'
import _ from 'lodash'
import Actions from './Action'
import {
    ModalFormPermissionForUserProps,
    ModalFormPermissionForUserRef
} from '../interface'
import './style.scss'

const genRole = (role: string) => {
    const obj = {
        manager: 'Truởng phòng',
        deputy_manager: 'Phó phòng',
        leader: 'Trưởng nhóm',
        staff: 'Nhân viên'
    }
    return obj[role]
}

const ModalForm = forwardRef<
    ModalFormPermissionForUserRef,
    ModalFormPermissionForUserProps
>((_props, ref) => {
    const [form] = useForm()

    const [visible, setVisible] = useState<boolean>(false)
    const [item, setItem] = useState(null)
    const [features, setFeatures] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [roleOfFeature, setRoleOfFeature] = useState(null)
    const getAdminInformation = useCallback((adminId) => {
        setLoading(true)
        AdministratorAPI.getAdminInformation(adminId)
            .then((res) => {
                const result: any = {}
                for (const iterator of res?.permissions) {
                    result[iterator] = true
                }
                form.setFieldsValue(result)
            })
            .catch((err) => {
                notify('error', 'Lỗi khi tải dữ liệu quyền')
            })
            .finally(() => setLoading(false))
    }, [])

    const showModal = useCallback((itemInput: any) => {
        if (itemInput) {
            setItem(itemInput)
            getAdminInformation(itemInput?.adminId)
        }
        setVisible(true)
    }, [])

    const loadFeature = useCallback(() => {
        DepartmentAPI.getAllFeatures()
            .then((res) => {
                const temp = []
                res.forEach((it) => {
                    it.childs.forEach((child) => {
                        const tmp = {
                            module: it.name,
                            feature: child.name,
                            permissions: child.permissions,
                            rowSpan: 0
                        }
                        temp.push(tmp)
                    })
                })
                temp?.forEach((d: any, index: number) => {
                    if (
                        !temp[index - 1] ||
                        d?.module !== temp[index - 1]?.module
                    )
                        d.rowSpan = temp.reduce(
                            (prev, current) =>
                                current?.module === d?.module ? prev + 1 : prev,
                            0
                        )
                })
                setFeatures(temp)
            })
            .catch((err) => {
                notify('error', 'Lỗi khi tải dữ liệu quyền')
            })
    }, [])

    useEffect(() => {
        loadFeature()
    }, [])

    useImperativeHandle(ref, () => ({
        showModal
    }))

    const hiddenModal = useCallback(() => {
        // setItem(null)
        form.resetFields()
        setVisible(false)
    }, [])

    const onOk = useCallback(() => {
        const values = form.getFieldsValue()
        const permissionArr = []
        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const element = values[key]
                if (element) {
                    permissionArr.push(key)
                }
            }
        }
        setLoading(true)
        AdministratorAPI.updatePermissionsForUser(item?.adminId, {
            permission: permissionArr
        })
            .then((res) => {
                notify('success', res)
                hiddenModal()
            })
            .catch((err) => notify('error', err.message))
            .finally(() => setLoading(false))
    }, [item])

    const columns: ColumnsType = [
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            width: '250px',
            render: (_text, record: any) => ({
                children: <strong>{_text}</strong>,
                props: {
                    rowSpan: record?.rowSpan ? record?.rowSpan : 0
                }
            })
        },
        {
            title: 'Tính năng',
            width: '250px',
            dataIndex: 'feature',
            key: 'feature'
        },
        {
            title: 'Phân quyền',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (text, record: any) => (
                <Actions
                    form={form}
                    record={record}
                    actions={
                        roleOfFeature ? roleOfFeature[record?.id] || [] : []
                    }
                />
            )
        }
    ]

    return (
        <Modal
            visible={visible}
            onCancel={hiddenModal}
            onOk={onOk}
            okButtonProps={{
                disabled: item?.canUpdate === false
            }}
            maskClosable={true}
            title={`Phân quyền nhân viên ${item?.fullName}`}
            okText='Cập nhật'
            width={1200}
            cancelText='Hủy'
            centered
            closable
        >
            <Row className='modal-feature-role'>
                <Col span={24}>
                    <Form form={form}>
                        <Table
                            dataSource={features || []}
                            rowKey={(v: any) => v?._id}
                            columns={columns}
                            bordered
                            loading={loading}
                            style={{
                                height: 'calc(100vh - 250px)'
                            }}
                            scroll={{
                                y: 'calc(100vh - 250px)',
                                x: 1000
                            }}
                            pagination={false}
                        />
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
})

export default memo(ModalForm)
