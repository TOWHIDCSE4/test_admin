import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Checkbox,
    Col,
    Row,
    DatePicker,
    Select
} from 'antd'
import { phoneNumberValidator } from 'utils/validator'
import moment from 'moment'
import _ from 'lodash'
import { IUser } from 'types'
import { GENDER, IModalProps, MODAL_TYPE, RoleCode } from 'const'
import UploadImage from 'core/Atoms/UploadImage'
import UserAPI from 'api/UserAPI'
import { notify } from 'utils/notify'
import CountryAPI from 'api/CountryAPI'
import DepartmentAPI from 'api/DepartmentAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import StudentAPI from 'api/StudentAPI'
import { useAuth } from 'contexts/Authenticate'

const { Option } = Select
const { TextArea } = Input

interface IProps extends IModalProps {
    data?: IUser
    type: MODAL_TYPE
    refetchData: () => void
}

const StudentModal: FC<IProps> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const { user } = useAuth()

    const [loading, setLoading] = useState<boolean>(false)
    const [avatar, setAvatar] = useState<string>('')
    const [countries, setCountries] = useState([])
    const [timeZones, setTimeZones] = useState([])

    const getCountries = () => {
        CountryAPI.getCountries()
            .then((res: any) => setCountries(res))
            .catch((err: any) => notify('error', err.message))
    }

    const getTimeZones = () => {
        CountryAPI.getTimeZones()
            .then((res: any) => setTimeZones(res))
            .catch((err: any) => notify('error', err.message))
    }

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth
                    ? moment(data.date_of_birth)
                    : null,
                staff_id: data?.student?.staff ? data?.student?.staff.id : null
            })
            getCountries()
            getTimeZones()
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const student_info = { ...values, role: [RoleCode.STUDENT] }
            if (avatar) student_info.avatar = avatar
            if (type === MODAL_TYPE.ADD_NEW) {
                StudentAPI.createNewStudent(student_info)
                    .then((res) => {
                        notify('success', 'Create user successfully')
                        toggleModal(false)
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else if (type === MODAL_TYPE.EDIT) {
                UserAPI.editUser(data.id, student_info)
                    .then((res) => {
                        notify('success', 'Update user successfully')
                        toggleModal(false)
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [form, type, data, avatar]
    )

    const afterUpload = (url) => {
        setAvatar(url)
    }

    const onRemoveAvatar = (file) => {
        setAvatar('')
        return true
    }

    const renderCountry = () =>
        Object.keys(countries).map((item, index) => (
            <Option key={item} value={item}>
                {_.get(countries[item], 'name')}
            </Option>
        ))

    const renderCurrency = () =>
        Object.keys(countries).map((item, index) => (
            <Option key={item} value={_.get(countries[item], 'currency')}>
                {_.get(countries[item], 'currency')}
            </Option>
        ))

    const renderTimeZone = () =>
        timeZones.map((item: any, index) => (
            <Option key={index} value={item.t}>
                {item.t}
            </Option>
        ))

    const renderBody = () => (
        <>
            <Row className='justify-content-center'>
                <div>
                    <UploadImage
                        afterUpload={afterUpload}
                        onRemove={onRemoveAvatar}
                        defaultFileList={
                            data?.avatar
                                ? [
                                      {
                                          url: data?.avatar,
                                          name: data?.full_name,
                                          uid: data?.id.toString()
                                      }
                                  ]
                                : null
                        }
                    />
                </div>
            </Row>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
            >
                <Row>
                    <Col span={8}>
                        <Form.Item
                            label='Username'
                            name='username'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Enter username'
                                }
                            ]}
                        >
                            <Input placeholder='Enter username' />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Email'
                            name='email'
                            labelAlign='left'
                            rules={[
                                { required: true, message: 'Enter email' },
                                {
                                    type: 'email',
                                    message: 'Enter email invalid'
                                }
                            ]}
                        >
                            <Input placeholder='Enter email' />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name='password1' style={{ display: 'none' }}>
                            <Input.Password placeholder='Enter password' />
                        </Form.Item>

                        <Form.Item
                            label='Password'
                            name='password'
                            labelAlign='left'
                            extra='Enter password if you want to reset password. Other else leave a blank'
                            rules={[
                                {
                                    required: type === MODAL_TYPE.ADD_NEW,
                                    message: 'Password is required'
                                }
                            ]}
                        >
                            <Input.Password
                                autoComplete={null}
                                autoCorrect={null}
                                placeholder='Enter password'
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item
                            label='First name'
                            name='first_name'
                            labelAlign='left'
                            rules={[
                                { required: true, message: 'Enter first name' }
                            ]}
                        >
                            <Input placeholder='Enter first name' />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Last name'
                            name='last_name'
                            labelAlign='left'
                            // rules={[
                            //     { required: true, message: 'Enter last name' }
                            // ]}
                        >
                            <Input placeholder='Enter last name' />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='gender'
                            label='Gender'
                            rules={[
                                {
                                    required: true,
                                    message: 'Choose gender'
                                }
                            ]}
                        >
                            <Select placeholder='Choose gender'>
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
                            label='Date of birth'
                            name='date_of_birth'
                            labelAlign='left'
                        >
                            <DatePicker
                                placeholder='Choose date of birth'
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
                            label='Phone number'
                            name='phone_number'
                            labelAlign='left'
                            rules={
                                user.username === 'admin' ||
                                user.username === 'ketoan'
                                    ? [
                                          {
                                              validator: (
                                                  rule: any,
                                                  value: any,
                                                  cb
                                              ) =>
                                                  phoneNumberValidator(value)
                                                      ? cb()
                                                      : cb(
                                                            'Phone number invalid'
                                                        )
                                          }
                                      ]
                                    : []
                            }
                        >
                            <Input
                                placeholder='Enter phone number'
                                disabled={
                                    user.username !== 'admin' &&
                                    user.username !== 'ketoan'
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Skype account'
                            name='skype_account'
                            labelAlign='left'
                        >
                            <Input placeholder='Enter skype account' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item name='country' label='Country'>
                            <Select
                                showSearch
                                placeholder='Choose country'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderCountry()}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name='timezone'
                            label='Time zone'
                            // rules={[
                            //     { required: true, message: 'Enter Time zone' }
                            // ]}
                        >
                            <Select
                                showSearch
                                placeholder='Choose timezone'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderTimeZone()}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name='currency' label='Currency'>
                            <Select
                                showSearch
                                placeholder='Choose currency'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderCurrency()}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {/* <Row>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='staff_id'
                            label='Staff'
                        >
                            <DebounceSelect
                                placeholder='Choose staff'
                                fetchOptions={fetchAdminOptions}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row> */}
                <Row>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='is_active'
                            label='Active'
                            valuePropName='checked'
                        >
                            <Checkbox name='is_active' defaultChecked={false}>
                                Activate account
                            </Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='is_verified_email'
                            label='Verify Email'
                            valuePropName='checked'
                        >
                            <Checkbox
                                name='is_verified_email'
                                defaultChecked={false}
                            >
                                Verified
                            </Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='is_verified_phone'
                            label='Verify phone '
                            valuePropName='checked'
                        >
                            <Checkbox
                                name='is_verified_phone'
                                defaultChecked={false}
                            >
                                Verified
                            </Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item name='intro' label='Biography'>
                            <TextArea placeholder='Enter biography' />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new student'
                    : 'Edit student information'
            }
            footer={[
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(StudentModal)
