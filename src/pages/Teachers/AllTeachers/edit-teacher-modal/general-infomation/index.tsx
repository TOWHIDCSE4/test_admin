import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Form,
    Input,
    Checkbox,
    Col,
    Row,
    DatePicker,
    Select,
    InputNumber,
    Button
} from 'antd'
import { phoneNumberValidator } from 'utils/validator'
import moment from 'moment'
import _ from 'lodash'
import { ILocation, ITeacher, ITeacherLevel } from 'types'
import { GENDER, MODAL_TYPE } from 'const'
import UploadImage from 'core/Atoms/UploadImage'
import { notify } from 'utils/notify'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import AdministratorAPI from 'api/AdministratorAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import DepartmentAPI from 'api/DepartmentAPI'
import LocationAPI from 'api/LocationAPI'
import TeacherAPI from 'api/TeacherAPI'
import { RoleCode } from 'const/role'
import { DEPARTMENT } from 'const/department'
import CountryAPI from 'api/CountryAPI'

const { Option } = Select
const { TextArea } = Input

type Props = {
    data: ITeacher
    modalType: MODAL_TYPE
    refetchData: () => void
}
const GeneralInformation: FC<Props> = ({ data, modalType, refetchData }) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState<boolean>(false)
    const [avatar, setAvatar] = useState<string>('')
    const [teacherLocations, setTeacherLocations] = useState<ILocation[]>([])
    const [teacherLevels, setTeacherLevels] = useState<ITeacherLevel[]>([])
    const [timeZones, setTimeZones] = useState([])

    const getTimeZones = () => {
        CountryAPI.getTimeZones()
            .then((res: any) => setTimeZones(res))
            .catch((err: any) => notify('error', err.message))
    }

    const getTeacherLevels = () => {
        TeacherLevelAPI.getTeacherLevels({})
            .then((res) => {
                setTeacherLevels(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getTeacherLocations = () => {
        LocationAPI.getLocations({})
            .then((res) => {
                setTeacherLocations(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }
    const fetchAdminOptions = useCallback(
        async (search) => {
            // if (_.isEmpty(data) || !idDepartment) return []
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment: DEPARTMENT.hocthuat.id
            })
            return res.data.map((i) => ({
                label: i.fullname,
                value: i.id
            }))
        },
        [data, modalType]
    )

    useEffect(() => {
        if (!_.isEmpty(data) && modalType === MODAL_TYPE.EDIT) {
            form.setFieldsValue({
                ...data,
                ...data?.user_info,
                date_of_birth: data?.user_info?.date_of_birth
                    ? moment(data.user_info.date_of_birth)
                    : null
            })
        } else if (modalType === MODAL_TYPE.ADD_NEW) {
            form.resetFields()
            setAvatar('')
        }
        getTeacherLevels()
        getTeacherLocations()
        getTimeZones()
    }, [data, modalType])

    const afterUpload = (url) => {
        setAvatar(url)
    }

    const onRemoveAvatar = (file) => {
        setAvatar('')
        return true
    }

    const renderLocations = () =>
        teacherLocations.map((item, index) => (
            <Option key={item.id} value={item.id}>
                {item.name}
            </Option>
        ))

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const teacher_info = { ...values }
            if (avatar) {
                teacher_info.avatar = avatar
            }
            if (modalType === MODAL_TYPE.ADD_NEW) {
                TeacherAPI.createTeacher({
                    ...teacher_info,
                    role: RoleCode.TEACHER
                })
                    .then((res) => {
                        notify('success', 'Create user successfully')
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else if (modalType === MODAL_TYPE.EDIT) {
                TeacherAPI.editTeacher(data.user_id, teacher_info)
                    .then((res) => {
                        notify('success', 'Update user successfully')
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [form, modalType, data, avatar]
    )

    const renderTimeZone = () =>
        timeZones.map((item: any, index) => (
            <Option key={index} value={item.t}>
                {item.t}
            </Option>
        ))

    const onValuesChange = (changedValues, allValues) => {
        if (
            _.has(allValues, 'teacher_level_id') &&
            _.has(allValues, 'location_id')
        ) {
            const teacherLv = _.find(
                teacherLevels,
                (o) => o.id === _.get(allValues, 'teacher_level_id')
            )
            if (teacherLv) {
                const hourlyRate = _.find(
                    teacherLv.hourly_rates,
                    (o) => o.location_id === allValues?.location_id
                )
                if (hourlyRate) {
                    form.setFieldsValue({ hourly_rate: hourlyRate.hourly_rate })
                }
            }
        }
    }

    return (
        <>
            <Row className='justify-content-center'>
                <div>
                    <UploadImage
                        afterUpload={afterUpload}
                        onRemove={onRemoveAvatar}
                        defaultFileList={
                            data?.user_info?.avatar
                                ? [
                                      {
                                          url: data?.user_info?.avatar,
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
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
            >
                <Row gutter={[20, 10]}>
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
                        <Form.Item
                            label='Password'
                            name='password'
                            labelAlign='left'
                            extra='Enter password if you want to reset password. Other else leave a blank'
                            rules={[
                                {
                                    required: modalType === MODAL_TYPE.ADD_NEW,
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
                <Row gutter={[20, 10]}>
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
                            rules={[
                                { required: true, message: 'Enter last name' }
                            ]}
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
                <Row gutter={[20, 10]}>
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
                            rules={[
                                {
                                    validator: (rule: any, value: any, cb) =>
                                        phoneNumberValidator(value)
                                            ? cb()
                                            : cb('Phone number invalid')
                                }
                            ]}
                        >
                            <Input placeholder='Enter phone number' />
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
                <Row gutter={[20, 10]}>
                    <Col span={8}>
                        <Form.Item
                            name='location_id'
                            label='Teacher location'
                            rules={[
                                {
                                    required: true,
                                    message: 'Teacher location is required'
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder='Choose teacher location'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderLocations()}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='teacher_level_id'
                            label='Teacher Level'
                            rules={[
                                {
                                    required: true,
                                    message: 'Teacher Level is required'
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder='Choose teacher level'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        ?.toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {teacherLevels?.map((d) => (
                                    <Option value={d?.id} key={d?.id}>
                                        {`${d?.name}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='hourly_rate'
                            label='Hourly Rate'
                            rules={[
                                {
                                    required: true,
                                    message: 'Hourly Rate is required'
                                }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder='Hourly Rate'
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[20, 10]}>
                    <Col span={8}>
                        <Form.Item
                            name='timezone'
                            label='Time zone'
                            rules={[
                                { required: true, message: 'Enter Time zone' }
                            ]}
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
                        <Form.Item
                            labelAlign='left'
                            name='staff_id'
                            label='Staff'
                            rules={[
                                {
                                    required: true,
                                    message: 'Assign staff is required'
                                }
                            ]}
                        >
                            <DebounceSelect
                                placeholder='Choose staff'
                                fetchOptions={fetchAdminOptions}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[20, 10]}>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name='is_active'
                            label='Active Account'
                            valuePropName='checked'
                        >
                            <Checkbox name='is_active' defaultChecked={false}>
                                Activate
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
                            label='Verify Phone '
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
                        <Form.Item name='about_me' label='About teacher'>
                            <TextArea placeholder='Enter about teacher' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} className='d-flex justify-content-end'>
                        <Button type='primary' htmlType='submit'>
                            Save
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default memo(GeneralInformation)
