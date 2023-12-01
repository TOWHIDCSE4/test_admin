/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import DepartmentAPI from 'api/DepartmentAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import TeamAPI from 'api/TeamAPI'
import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
    useMemo
} from 'react'
import { notify } from 'utils/notify'
import { Button, Modal, Form, Input, Select, Space, Row, Col } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import Table, { ColumnsType } from 'antd/lib/table'
import _ from 'lodash'
import { ModalFormDepartmentProps, ModalFormDepartmentRef } from '../interface'

const { Option } = Select

const ModalForm = forwardRef<ModalFormDepartmentRef, ModalFormDepartmentProps>(
    ({ callBack }, ref) => {
        const [visiable, setVisiable] = useState(false)
        const [loading, setLoading] = useState(false)
        const [item, setItem] = useState(null)
        const [departments, setDepartments] = useState<any[]>([])
        const [admins, setAdmins] = useState([])
        const [members, setMembers] = useState([])
        const [addMem, setAddMem] = useState(null)

        const [form] = useForm()

        const loadDataDepartments = () => {
            setLoading(true)
            DepartmentAPI.getDepartments()
                .then((res) => {
                    setDepartments(res)
                })
                .catch((err) => notify('error', err.message))
                .finally(() => setLoading(false))
        }

        const loadDataAdmin = (idDepartment) => {
            setLoading(true)
            AdministratorAPI.getAllAdministrators({ idDepartment })
                .then((res) => {
                    setAdmins(res?.data)
                })
                .catch((err) => notify('error', err.message))
                .finally(() => setLoading(false))
        }

        useEffect(() => {
            loadDataDepartments()
        }, [])

        const showModal = useCallback((item?: any) => {
            if (item) {
                setItem(item)
                loadDataAdmin(item?.department?.id)
                const member: any[] =
                    item?.members?.map((m) => ({
                        ...m,
                        role: 'Thành viên'
                    })) || []
                if (item?.leader)
                    member.unshift({ ...item?.leader, role: 'Trưởng nhóm' })
                setMembers(member)
            }
            form.setFieldsValue({
                ...item,
                idDepartment: item?.department?.id,
                idLeader: item?.leader?.id
            })
            setVisiable(true)
        }, [])

        useImperativeHandle(ref, () => ({
            showModal
        }))

        const hiddenModal = useCallback(() => {
            setItem(null)
            form.resetFields()
            setVisiable(false)
            setMembers([])
        }, [])

        const submit = (values) => {
            setLoading(true)
            if (item) {
                TeamAPI.editTeam(item?.id, {
                    ...values,
                    idMembers: members?.map((m) => m?.id) || []
                })
                    .then((res) => {
                        notify('success', 'Cập nhật thành công')
                        callBack && callBack()
                        hiddenModal()
                    })
                    .catch((err) => notify('error', err.message))
                    .finally(() => setLoading(false))
            } else
                TeamAPI.createTeam({
                    ...values,
                    idMembers: members?.map((m) => m?.id) || []
                })
                    .then((res) => {
                        notify('success', 'Thêm mới thành công')
                        callBack && callBack()
                        hiddenModal()
                    })
                    .catch((err) => notify('error', err.message))
                    .finally(() => setLoading(false))
        }

        const onFinish = useCallback(() => {
            form.validateFields()
                .then((values) => {
                    submit(values)
                })
                .catch()
        }, [form, item, members])

        const onChangeDepartment = useCallback((value: any) => {
            loadDataAdmin(value)
            form.setFieldsValue({
                idLeader: null
            })
            setMembers([])
        }, [])

        const onClearMember = useCallback(
            (mem) => {
                setMembers((ms) => {
                    const clearMem = ms.find((m) => m?.id === mem?.id)
                    if (clearMem?.role?.includes('nhóm')) return ms
                    return ms.filter((m) => m?.id !== mem?.id)
                })
            },
            [admins]
        )

        const onAddMember = useCallback(
            (value) => {
                setAddMem(null)
                const newMem = admins.find((a) => a.id === value)
                setMembers((ms) => {
                    const found = ms.find((m) => m?.id === value)
                    return found
                        ? ms
                        : [...ms, { ...newMem, role: 'Thành viên' }]
                })
            },
            [admins]
        )

        const onChangeLeader = useCallback(
            (value) => {
                const newMem = admins.find((a) => a.id === value)
                setMembers((ms) => {
                    const newArr = ms
                        .filter((m) => m?.id !== value)
                        .map((m) => ({ ...m, role: 'Thành viên' }))
                    return [{ ...newMem, role: 'Trưởng nhóm' }, ...newArr]
                })
            },
            [admins]
        )

        const columns: ColumnsType = useMemo(
            () => [
                {
                    title: 'Tài khoản',
                    dataIndex: 'username',
                    key: 'username',
                    width: 100
                },
                {
                    title: 'Họ tên',
                    dataIndex: 'fullname',
                    key: 'fullname'
                },
                {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email'
                },
                {
                    title: 'Chức vụ trong nhóm',
                    dataIndex: 'role',
                    key: 'role'
                },
                {
                    title: '',
                    key: 'action',
                    render: (_text, record: any) => (
                        <Space size='middle'>
                            <Button
                                danger
                                disabled={record?.canUpdate === false}
                                onClick={() => onClearMember(record)}
                            >
                                Xóa
                            </Button>
                        </Space>
                    )
                }
            ],
            []
        )

        return (
            <Modal
                visible={visiable}
                title={
                    item ? `${item.id} - Nhóm ${item.name}` : 'Thêm mới nhóm'
                }
                width={1000}
                style={{
                    maxHeight: 'calc(100vh - 20px)'
                }}
                centered
                closable
                onCancel={hiddenModal}
                footer={[
                    <Button key='back' onClick={hiddenModal}>
                        Hủy
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        loading={loading}
                        onClick={onFinish}
                    >
                        {item ? 'Cập nhật' : 'Lưu'}
                    </Button>
                ]}
            >
                <Form
                    name='basic'
                    layout='vertical'
                    form={form}
                    onFinish={onFinish}
                >
                    <Row gutter={[10, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label='Tên nhóm'
                                name='name'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập tên nhóm'
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label='Mô tả' name='description'>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label='Phòng/ban'
                                name='idDepartment'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Chọn phòng/ban'
                                    }
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder='Chọn phòng\ban'
                                    optionFilterProp='children'
                                    filterOption={(input, option) =>
                                        _.isString(option.children) &&
                                        option.children
                                            ?.toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                    disabled={item}
                                    onChange={onChangeDepartment}
                                >
                                    {departments.map((d) => (
                                        <Option
                                            value={d?.id}
                                            key={d?.id}
                                            disabled={
                                                d?.canUpdateManager === false
                                            }
                                        >
                                            {`${d?.id} - ${d?.name}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label='Trưởng nhóm' name='idLeader'>
                                <Select
                                    showSearch
                                    placeholder='Chọn trưởng nhóm'
                                    optionFilterProp='children'
                                    onChange={onChangeLeader}
                                    filterOption={(input, option) =>
                                        _.isString(option.children) &&
                                        option.children
                                            ?.toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {admins.map((d) => (
                                        <Option
                                            value={d?.id}
                                            key={d?.id}
                                            disabled={d?.canUpdate === false}
                                        >
                                            {`${d?.username} - ${
                                                d?.fullname || ''
                                            }`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Row gutter={[0, 2]}>
                    <Col span={24}>
                        <Row justify='end' gutter={[10, 0]}>
                            <Col>
                                <Select
                                    showSearch
                                    placeholder='Chọn thành viên'
                                    optionFilterProp='children'
                                    value={addMem}
                                    onChange={onAddMember}
                                    filterOption={(input, option) =>
                                        _.isString(option.children) &&
                                        option.children
                                            ?.toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                    defaultValue={null}
                                >
                                    {admins.map((d) => (
                                        <Option
                                            value={d?.id}
                                            key={d?.id}
                                            disabled={d?.canUpdate === false}
                                        >
                                            {`${d?.username} - ${
                                                d?.fullname || ''
                                            }`}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <Table
                            style={{
                                height: '300px',
                                maxHeight: '300px'
                            }}
                            columns={columns}
                            dataSource={members}
                            scroll={{ y: 300, x: null }}
                            pagination={false}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
)

export default memo(ModalForm)
