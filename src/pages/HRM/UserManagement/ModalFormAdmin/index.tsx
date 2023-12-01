/* eslint-disable @typescript-eslint/no-unused-expressions */
import AdministratorAPI from 'api/AdministratorAPI'
import DepartmentAPI from 'api/DepartmentAPI'
import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState
} from 'react'
import { notify } from 'utils/notify'
import {
    Button,
    Modal,
    Form,
    Input,
    Checkbox,
    Col,
    Row,
    DatePicker,
    InputNumber,
    Select
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { phoneNumberValidator } from 'utils/validator'
import moment from 'moment'
import { EnumAction } from 'const/enum'
import _ from 'lodash'
import { ModalFormProps, ModalFormRef } from '../interface'
import { GENDER } from 'const'

const { Option } = Select

const ModalForm = forwardRef<ModalFormRef, ModalFormProps>(
    ({ callBack }, ref) => {
        const [visiable, setVisiable] = useState(false)
        const [viewMode, setViewMode] = useState<boolean>(false)
        const [loading, setLoading] = useState(false)
        const [admin, setAdmin] = useState(null)
        const [departments, setDepartments] = useState<any[]>([])

        const [form] = useForm()

        const showModal = useCallback((adminInput?: any, view?: boolean) => {
            if (view) setViewMode(true)
            if (adminInput) {
                setAdmin(adminInput)
                form.setFieldsValue({
                    ...adminInput,
                    bod: adminInput?.bod ? moment(adminInput?.bod) : null,
                    idDepartment: adminInput?.department?.department?.id,
                    isRole: adminInput?.department?.isRole,
                    IDCardBOD: adminInput?.IDCardBOD
                        ? moment(adminInput?.IDCardBOD)
                        : null
                })
            }
            setVisiable(true)
        }, [])

        useImperativeHandle(ref, () => ({
            showModal
        }))

        const loadDataDepartments = () => {
            setLoading(true)
            DepartmentAPI.getDepartments()
                .then((res) => {
                    setDepartments(res)
                })
                .catch((err) => notify('error', err.message))
                .finally(() => setLoading(false))
        }

        useEffect(() => {
            loadDataDepartments()
        }, [])

        const hiddenModal = useCallback(() => {
            setAdmin(null)
            form.resetFields()
            setVisiable(false)
        }, [])

        const onFinish = useCallback(
            (values) => {
                setLoading(true)
                if (!admin) {
                    let adminInfo = {
                        ...values
                    }
                    if (values?.bod)
                        adminInfo.bod = moment(values?.bod).valueOf()
                    if (values?.IDCardBOD)
                        adminInfo.IDCardBOD = moment(values?.bod).valueOf()

                    adminInfo = _.pickBy(adminInfo, _.identity)
                    if (values.gender === 0) {
                        adminInfo.gender = 0
                    }
                    AdministratorAPI.createAdministrator(
                        _.pickBy(adminInfo, _.identity)
                    )
                        .then((data) => {
                            notify('success', 'Thêm mới thành công')
                            callBack && callBack()
                            hiddenModal()
                        })
                        .catch((err) => {
                            notify('error', err.message)
                        })
                        .finally(() => setLoading(false))
                } else {
                    let diffInfo = {
                        ...values
                    }
                    if (values?.bod)
                        diffInfo.bod = moment(values?.bod).valueOf()
                    if (values?.IDCardBOD)
                        diffInfo.IDCardBOD = moment(values?.bod).valueOf()

                    diffInfo = _.pickBy(diffInfo, _.identity)
                    if (values.gender === 0) {
                        diffInfo.gender = 0
                    }
                    AdministratorAPI.editAdministrator(admin.id, diffInfo)
                        .then((data) => {
                            notify('success', 'Cập nhật thành công')
                            callBack && callBack()
                            hiddenModal()
                        })
                        .catch((err) => {
                            notify('error', err.message)
                        })
                        .finally(() => setLoading(false))
                }
            },
            [form, admin]
        )

        const editMode = useCallback(() => {
            setViewMode(false)
        }, [])

        return (
            <Modal
                visible={visiable}
                title={
                    admin
                        ? `${admin.username} - ${admin.fullname}`
                        : 'Thêm mới nhân viên'
                }
                width={700}
                centered
                closable
                maskClosable={true}
                onCancel={hiddenModal}
                footer={[
                    <Button key='back' onClick={hiddenModal}>
                        Hủy
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        loading={loading}
                        onClick={viewMode ? editMode : form.submit}
                    >
                        {viewMode ? 'Chỉnh sửa' : admin ? 'Cập nhật' : 'Lưu'}
                    </Button>
                ]}
            >
                <Form
                    name='basic'
                    layout='vertical'
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 22 }}
                    form={form}
                    onFinish={onFinish}
                    initialValues={{
                        is_active: true
                    }}
                >
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                label='Tài khoản'
                                name='username'
                                labelAlign='left'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập tài khoản'
                                    }
                                ]}
                            >
                                <Input
                                    disabled={
                                        viewMode || admin?.canUpdate === false
                                    }
                                    placeholder='Nhập tài khoản'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='password1'
                                style={{ display: 'none' }}
                            >
                                <Input.Password placeholder='Enter password' />
                            </Form.Item>
                            <Form.Item
                                label='Mật khẩu'
                                name='password'
                                labelAlign='left'
                                rules={[
                                    {
                                        required: !admin,
                                        message: 'Nhập mật khẩu'
                                    }
                                ]}
                            >
                                <Input.Password
                                    autoComplete={null}
                                    autoCorrect={null}
                                    disabled={viewMode}
                                    placeholder={admin ? '' : 'Nhập  mật khẩu'}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                label='Họ tên'
                                name='fullname'
                                labelAlign='left'
                                rules={[
                                    { required: true, message: 'Nhập họ tên' }
                                ]}
                            >
                                <Input
                                    disabled={viewMode}
                                    placeholder='Nhập  họ tên'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Email'
                                name='email'
                                labelAlign='left'
                                rules={[
                                    { required: true, message: 'Nhập email' },
                                    {
                                        type: 'email',
                                        message: 'Nhập đúng định dạng email'
                                    }
                                ]}
                            >
                                <Input
                                    disabled={viewMode}
                                    placeholder='Nhập  email'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                labelAlign='left'
                                name='gender'
                                label='Giới tính'
                            >
                                <Select
                                    disabled={viewMode}
                                    placeholder='Chọn giới tính'
                                >
                                    <Option value={GENDER.MALE}>Nam</Option>
                                    <Option value={GENDER.FEMALE}>Nữ</Option>
                                    <Option value={GENDER.OTHER}>Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                label='Ngày sinh'
                                name='bod'
                                labelAlign='left'
                            >
                                <DatePicker
                                    disabled={viewMode}
                                    placeholder='Chọn ngày sinh'
                                    style={{ width: '100%' }}
                                    disabledDate={(current) =>
                                        moment().clone().valueOf() <
                                        current?.valueOf()
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Số CMND/CCCD'
                                name='IDCard'
                                labelAlign='left'
                            >
                                <Input
                                    disabled={viewMode}
                                    style={{ width: '100%' }}
                                    placeholder='Nhập số CMND/CCCD'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Ngày cấp'
                                name='IDCardBOD'
                                labelAlign='left'
                            >
                                <DatePicker
                                    disabled={viewMode}
                                    placeholder='Chọn ngày cấp CMND/CCCD'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                label='Số điện thoại'
                                name='phoneNumber'
                                labelAlign='left'
                                rules={[
                                    {
                                        validator: (
                                            rule: any,
                                            value: any,
                                            cb
                                        ) => {
                                            if (value) {
                                                if (phoneNumberValidator(value))
                                                    cb()
                                                cb(
                                                    'Sai định dạng số điện thoại'
                                                )
                                            } else {
                                                cb()
                                            }
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    disabled={viewMode}
                                    placeholder='Nhập số điện thoại'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Số tài khoản'
                                name='bankingNumber'
                                labelAlign='left'
                            >
                                <InputNumber
                                    disabled={viewMode}
                                    style={{ width: '100%' }}
                                    placeholder='Nhập số tài khoản'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label='Tên ngân hàng'
                                name='bankingName'
                                labelAlign='left'
                            >
                                <Input
                                    disabled={viewMode}
                                    placeholder='Nhập tên ngân hàng'
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                labelAlign='left'
                                name='idDepartment'
                                label='Phòng ban'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Chọn phòng ban'
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
                                    defaultValue={
                                        admin?.department?.department?.id
                                    }
                                    disabled={
                                        viewMode || admin?.canUpdate === false
                                    }
                                >
                                    {departments?.map((d) => (
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
                        <Col span={8}>
                            <Form.Item
                                labelAlign='left'
                                name='isRole'
                                label='Chức vụ'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Chọn chức vụ'
                                    }
                                ]}
                            >
                                <Select
                                    placeholder='Chọn chức vụ'
                                    defaultValue={admin?.department?.isRole}
                                    disabled={
                                        viewMode || admin?.canUpdate === false
                                    }
                                >
                                    <Option value='manager'>
                                        Trưởng phòng
                                    </Option>
                                    <Option value='deputy_manager'>
                                        Phó phòng
                                    </Option>
                                    <Option value='leader'>Trưởng nhóm</Option>
                                    <Option value='staff'>Nhân viên</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                labelAlign='left'
                                name='is_active'
                                label='Kích hoạt'
                                valuePropName='checked'
                            >
                                <Checkbox
                                    disabled={
                                        viewMode || admin?.canUpdate === false
                                    }
                                    name='is_active'
                                    defaultChecked={true}
                                >
                                    Kích hoạt
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
)

export default memo(ModalForm)
