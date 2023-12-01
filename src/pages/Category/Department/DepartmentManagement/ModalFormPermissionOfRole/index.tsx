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
import { notify } from 'utils/notify'
import { useForm } from 'antd/lib/form/Form'
import _ from 'lodash'
import Actions from './Action'
import { ModalFormPermissionProps, ModalFormPermissionRef } from '../interface'
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

const ModalForm = forwardRef<ModalFormPermissionRef, ModalFormPermissionProps>(
    (_props, ref) => {
        const [visible, setVisible] = useState<boolean>(false)
        const [item, setItem] = useState(null)
        const [features, setFeatures] = useState<any[]>([])
        const [loading, setLoading] = useState<boolean>(false)
        const [roleOfFeature, setRoleOfFeature] = useState(null)
        const [form] = useForm()

        const getDepartment = useCallback((id, role) => {
            setLoading(true)
            DepartmentAPI.getDepartment(id)
                .then((res) => {
                    const result: any = {}
                    res?.permissionOfMember[role]?.forEach((POM) => {
                        result[POM?.feature?.id] = POM?.actions
                    })
                    Object.keys(result).forEach(
                        (k) => (result[k] = _.uniq(result[k]))
                    )
                    setRoleOfFeature(result)
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
                getDepartment(itemInput?.id, itemInput?.role)
            }
            setVisible(true)
        }, [])

        const loadFeature = useCallback(() => {
            DepartmentAPI.getAllFeatures()
                .then((res) => {
                    const chars = _.sortBy(res, ['codeGroupModule'], ['asc']) // Use Lodash to sort array by 'name'
                    chars?.forEach((d, index: number) => {
                        if (
                            !chars[index - 1] ||
                            d?.codeGroupModule !==
                                chars[index - 1]?.codeGroupModule
                        )
                            d.rowSpan = chars.reduce(
                                (prev, current) =>
                                    current?.codeGroupModule ===
                                    d?.codeGroupModule
                                        ? prev + 1
                                        : prev,
                                0
                            )
                    })
                    setFeatures(chars)
                })
                .catch((err) => {
                    notify('warning', 'Không thể tải tính năng')
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
            const payload = _.flattenDeep(
                Object.keys(values).map((key) => {
                    if (!values[key]) return null
                    const p = values[key]?.map((v) => ({
                        permissionCode: key,
                        action: v
                    }))
                    return p
                })
            ).filter((s) => s)
            setLoading(true)
            DepartmentAPI.updatePermissionOfDepartment(item?.id, {
                role: item?.role,
                permission: payload
            })
                .then((res) => {
                    notify('success', res)
                })
                .catch((err) => notify('error', err.message))
                .finally(() => setLoading(false))
        }, [item])

        const columns: ColumnsType = [
            {
                title: 'Module',
                dataIndex: 'groupModule',
                key: 'groupModule',
                width: '180px',
                render: (_text, record: any) => ({
                    children: <strong>{_text}</strong>,
                    props: {
                        rowSpan: record?.rowSpan ? record?.rowSpan : 0
                    }
                })
            },
            {
                title: 'Tính năng',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Phân quyền',
                dataIndex: 'permission',
                key: 'permission',
                width: '350px',
                render: (text, record: any) => (
                    <Actions
                        text={text}
                        form={form}
                        record={record}
                        actions={
                            roleOfFeature ? roleOfFeature[record?.id] || [] : []
                        }
                    />
                )
            },
            {
                title: 'Ghi chú',
                dataIndex: 'note',
                key: 'note'
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
                title={`Phòng ${item?.departmentName} - ${
                    genRole(item?.role) || ''
                }`}
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
    }
)

export default memo(ModalForm)
