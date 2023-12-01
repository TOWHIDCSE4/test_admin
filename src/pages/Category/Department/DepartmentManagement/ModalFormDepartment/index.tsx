/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import DepartmentAPI from 'api/DepartmentAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import React, {
    forwardRef,
    memo,
    useCallback,
    useImperativeHandle,
    useState,
    useEffect
} from 'react'
import { notify } from 'utils/notify'
import { Button, Modal, Form, Input, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import _ from 'lodash'
import { ModalFormDepartmentProps, ModalFormDepartmentRef } from '../interface'

const { Option } = Select

const ModalForm = forwardRef<ModalFormDepartmentRef, ModalFormDepartmentProps>(
    ({ callBack }, ref) => {
        const [visiable, setVisiable] = useState(false)
        const [loading, setLoading] = useState(false)
        const [item, setItem] = useState(null)
        const [admins, setAdmins] = useState([])

        const [form] = useForm()

        const loadAdmin = useCallback(() => {
            AdministratorAPI.getAllAdministrators()
                .then((res) => {
                    setAdmins(res?.data || [])
                })
                .catch(() => {
                    notify('error', 'Không lấy được thông tin người quản trị')
                })
        }, [])

        useEffect(() => {
            loadAdmin()
        }, [])

        const showModal = useCallback((item?: any) => {
            if (item) setItem(item)
            form.setFieldsValue({
                ...item,
                manager: item?.manager?.id
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
        }, [])

        const submit = (values) => {
            setLoading(true)
            if (item) {
                DepartmentAPI.editDepartment(item?.id, values)
                    .then((res) => {
                        notify('success', 'Cập nhật thành công')
                        callBack && callBack()
                        hiddenModal()
                    })
                    .catch((err) => notify('error', err.message))
                    .finally(() => setLoading(false))
            } else
                DepartmentAPI.createDepartment(values)
                    .then((res) => {
                        notify('success', 'Thêm mới thành công')
                        callBack && callBack()
                        hiddenModal()
                    })
                    .catch((err) => notify('error', err.message))
                    .finally(() => setLoading(false))
        }

        const onFinish = useCallback(() => {
            form.validateFields().then((values) => {
                submit(values)
            })
        }, [form, item])

        return (
            <Modal
                visible={visiable}
                title={
                    item
                        ? `${item.id} - Phòng ${item.name}`
                        : 'Thêm mới phòng/ban'
                }
                width={700}
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
                    <Form.Item
                        label='Tên phòng/ban'
                        name='name'
                        rules={[
                            {
                                required: true,
                                message: 'Nhập tên phòng/ban'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label='Trưởng phòng/ban' name='manager'>
                        <Select
                            showSearch
                            placeholder='Chọn trưởng phòng/ban'
                            optionFilterProp='children'
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
                                    {`${d?.username} - ${d?.fullname || ''}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label='Mô tả' name='description'>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)

export default memo(ModalForm)
