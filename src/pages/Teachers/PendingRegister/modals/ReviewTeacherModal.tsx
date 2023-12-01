import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Switch,
    InputNumber,
    Row,
    Col,
    Checkbox,
    Select,
    DatePicker,
    Tag,
    Popconfirm,
    Alert
} from 'antd'
import TeacherAPI from 'api/TeacherAPI'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { ITeacherLevel } from 'types/ITeacherLevel'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import { REVIEW_STATUS } from 'const/status'
import moment from 'moment'
import { GENDER } from 'const/gender'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import AdministratorAPI from 'api/AdministratorAPI'
import DepartmentAPI from 'api/DepartmentAPI'
import { DEPARTMENT } from 'const/department'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { Option } = Select

type Props = {
    data: any
    teacherLevels: ITeacherLevel[]
    visible: boolean
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const ReviewTeacherModal: FC<Props> = ({
    visible,
    data,
    teacherLevels,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [regularTimes, setRegularTimes] = useState([])

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            setRegularTimes(data.user ? data.user.regular_times : [])
            const teacherLv: ITeacherLevel = _.find(
                teacherLevels,
                (o) => o.id === data.teacher_level_id
            )
            const hourly_rate =
                teacherLv &&
                _.find(
                    teacherLv.hourly_rates,
                    (o) => o.location_id === data.location_id
                )
            const newUser = data.user
                ? {
                      ...data.user,
                      date_of_birth: moment(data.user.date_of_birth)
                  }
                : {}
            form.setFieldsValue({
                ...data,
                user: newUser,
                hourly_rate: hourly_rate ? hourly_rate.hourly_rate : 0
            })
        }
    }, [visible])

    useEffect(() => {}, [])
    const fetchAdminOptions = useCallback(
        async (search) => {
            if (!visible) return []
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment: DEPARTMENT.hocthuat.id
            })
            return res.data.map((i) => ({
                label: i.fullname,
                value: i.id
            }))
        },
        [visible, data]
    )

    const onClose = () => {
        form.resetFields()
        setLoading(false)
        setRegularTimes([])
        toggleModal(false)
    }

    const onFinish = useCallback(
        (_values) => {
            if (_values.user.is_verified_email) {
                const diff = {
                    is_reviewed: REVIEW_STATUS.CONFIRMED,
                    teacher_level_id: _values.teacher_level_id,
                    is_verified_email: _values.user.is_verified_email,
                    hourly_rate: _values.hourly_rate,
                    staff_id: _values.staff_id
                }
                setLoading(true)
                TeacherAPI.editTeacher(data.user_id, diff)
                    .then((res) => {
                        notify('success', 'Approve teacher successfully')
                        onClose()
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else {
                notify('error', 'Please checkbox verified email')
            }
        },
        [data, form]
    )

    const onReject = () => {
        setLoading(true)
        const setReview = {
            is_reviewed: REVIEW_STATUS.REJECT
        }
        setLoading(true)
        TeacherAPI.editTeacher(data.user_id, setReview)
            .then((res) => {
                notify('success', 'Reject teacher successfully')
                onClose()
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const onValuesChange = (changedValues, allValues) => {
        if (_.has(changedValues, 'teacher_level_id')) {
            const teacherLv = _.find(
                teacherLevels,
                (o) => o.id === _.get(changedValues, 'teacher_level_id')
            )
            if (teacherLv) {
                const hourlyRate = _.find(
                    teacherLv.hourly_rates,
                    (o) => o.location_id === data.location_id
                )
                if (hourlyRate) {
                    form.setFieldsValue({ hourly_rate: hourlyRate.hourly_rate })
                }
            }
        }
    }
    return (
        <Modal
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Review teacher'
            width={700}
            centered
            footer={[
                checkPermission(PERMISSIONS.tpr_reject) ? (
                    <Popconfirm
                        key='reject'
                        title='Are you sure to reject this teacher?'
                        onConfirm={onReject}
                        okText='Yes'
                        cancelText='No'
                    >
                        <Button type='primary' danger className='mr-2'>
                            Reject
                        </Button>
                    </Popconfirm>
                ) : (
                    <></>
                ),
                checkPermission(PERMISSIONS.tpr_approve) ? (
                    <Popconfirm
                        key='review'
                        title='Are you sure to approve this teacher?'
                        onConfirm={form.submit}
                        okText='Yes'
                        cancelText='No'
                    >
                        <Button
                            type='primary'
                            disabled={
                                isLoading || form.getFieldValue('is_reviewed')
                            }
                            className='mr-2'
                        >
                            Approve
                        </Button>
                    </Popconfirm>
                ) : (
                    <></>
                )
            ]}
        >
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 22 }}
                form={form}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
            >
                <Row>
                    <Col span={12}>
                        <Form.Item
                            label='Username'
                            name={['user', 'username']}
                            labelAlign='left'
                        >
                            <Input placeholder='Username' disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Email'
                            name={['user', 'email']}
                            labelAlign='left'
                        >
                            <Input placeholder='Email' disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item
                            label='Full Name'
                            name={['user', 'full_name']}
                            labelAlign='left'
                        >
                            <Input placeholder='Full Name' disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Phone'
                            name={['user', 'phone_number']}
                            labelAlign='left'
                        >
                            <Input placeholder='Phone number' disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Location'
                            name={['location', 'name']}
                            labelAlign='left'
                        >
                            <Input placeholder='Location' disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={8}>
                        <Form.Item
                            label='Gender'
                            name={['user', 'gender']}
                            labelAlign='left'
                        >
                            <Select
                                placeholder='Gender'
                                style={{ width: '100%' }}
                                disabled
                            >
                                {Object.keys(GENDER)
                                    .filter(
                                        (key: any) =>
                                            !isNaN(Number(GENDER[key]))
                                    )
                                    .map((key: any) => (
                                        <Option value={GENDER[key]} key={key}>
                                            {_.capitalize(key)}
                                        </Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label='Date Of Birth'
                            name={['user', 'date_of_birth']}
                            labelAlign='left'
                        >
                            <DatePicker placeholder='Date Of Birth' disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name={['user', 'is_verified_email']}
                            label='Verify email'
                            valuePropName='checked'
                        >
                            <Checkbox name='is_active' defaultChecked={false}>
                                {form.getFieldsValue([
                                    'user',
                                    'is_verified_email'
                                ])
                                    ? 'Verified'
                                    : 'Not verified'}
                            </Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item
                            labelAlign='left'
                            name={['user', 'regular_times']}
                            label='Regular Times'
                        >
                            {regularTimes.length === 0 ? (
                                <Tag color='warning'>No Regular Times</Tag>
                            ) : (
                                <ul>
                                    {regularTimes?.map((item, _index) => {
                                        const convertToLocal =
                                            getTimestampInWeekToLocal(item)
                                        return (
                                            <li key={_index}>
                                                {formatTimestamp(
                                                    convertToLocal
                                                )}
                                            </li>
                                        )
                                    })}
                                    <li>No Data</li>
                                </ul>
                            )}
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
            </Form>
            {!form.getFieldValue(['user', 'is_verified_email']) && (
                <Alert
                    message='Please verify email before approve account'
                    type='warning'
                    showIcon
                />
            )}
        </Modal>
    )
}

export default memo(ReviewTeacherModal)
