/* eslint-disable jsx-a11y/control-has-associated-label */
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Form, Button, Select, Typography, Space, Tag } from 'antd'
import TeacherTrialAPI from 'api/TeacherTrialAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { ITeacherTrial, AGE_GROUP_NAMES, ITeacher } from 'types'
import { notify } from 'utils/notify'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { red, green } from '@ant-design/colors'
import { IModalProps } from 'const/common'

const { Text } = Typography

interface IProps extends IModalProps {
    data?: ITeacherTrial
    type: MODAL_TYPE
    refetchData: () => void
}

function TeacherTrialModal({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}: IProps) {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState<boolean>(false)
    const [teacher, setTeacher] = useState<ITeacher>()

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            form.setFieldsValue({
                ...data
            })
        }
    }, [visible, data])

    const onClose = (refetch: boolean) => {
        toggleModal(false)
        form.resetFields()
        setTeacher(null)
        if (refetch) {
            refetchData()
        }
    }

    const onFinish = useCallback(
        async (trialInfo) => {
            setLoading(true)
            if (type === MODAL_TYPE.ADD_NEW) {
                TeacherTrialAPI.createTrialTeacherProfile(trialInfo)
                    .then((res) => {
                        notify('success', 'Create trial profile successfully')
                        onClose(true)
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            } else if (type === MODAL_TYPE.EDIT) {
                TeacherTrialAPI.editTrialTeacherProfile(
                    trialInfo.teacher_id,
                    trialInfo
                )
                    .then((res) => {
                        notify('success', 'Update trial profile successfully')
                        onClose(true)
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [type, form]
    )

    const fetchTeacherOptions = useCallback(
        async (search) => {
            if (!visible) return []
            const teacher_id = data?.teacher_id
            const res = await TeacherTrialAPI.getTeachersNotInTrial({
                search,
                teacher_id
            })
            if (teacher_id) {
                setTeacher(res.data.find((item) => item.user_id === teacher_id))
            }
            return res.data.map((i) => ({
                label: `${i.user?.full_name} - ${i.user?.username}`,
                value: i.user_id,
                teacher: i
            }))
        },
        [visible, data]
    )
    const onTeacherChange = useCallback((value, option) => {
        if (!option) setTeacher(null)
        else setTeacher(option.teacher)
    }, [])

    const ageGroupOptions = useMemo(
        () =>
            Object.keys(AGE_GROUP_NAMES).map((i) => ({
                label: AGE_GROUP_NAMES[i],
                value: +i
            })),
        []
    )

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            destroyOnClose
            onCancel={() => onClose(false)}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new teacher trial profile'
                    : 'Edit teacher trial profile'
            }
            footer={[
                <Button
                    key='back'
                    type='default'
                    onClick={() => onClose(false)}
                >
                    Cancel
                </Button>,
                <Button
                    key='save'
                    type='primary'
                    onClick={form.submit}
                    loading={isLoading}
                >
                    Save
                </Button>
            ]}
            width={600}
        >
            <div className='row'>
                <div className='col-md-12 col-xl-12'>
                    <div className='tab-content'>
                        <Form
                            className='tab-pane fade show active'
                            layout='vertical'
                            form={form}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label='Teacher'
                                name='teacher_id'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select teacher'
                                    }
                                ]}
                            >
                                <DebounceSelect
                                    style={{ width: '100%' }}
                                    placeholder='Select a teacher'
                                    fetchOptions={fetchTeacherOptions}
                                    allowClear
                                    onChange={onTeacherChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label='Age group'
                                name='age_groups'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select age groups'
                                    }
                                ]}
                            >
                                <Select
                                    mode='multiple'
                                    style={{ width: '100%' }}
                                    placeholder='Select age groups'
                                    options={ageGroupOptions}
                                />
                            </Form.Item>
                            {teacher && (
                                <Space direction='vertical'>
                                    <Text>Degree</Text>
                                    <div>
                                        {teacher.degree ? (
                                            <a
                                                href={teacher.degree}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                <CheckOutlined
                                                    style={{
                                                        color: green.primary,
                                                        fontSize: 18
                                                    }}
                                                />
                                            </a>
                                        ) : (
                                            <CloseOutlined
                                                style={{
                                                    color: red.primary,
                                                    fontSize: 18
                                                }}
                                            />
                                        )}
                                    </div>
                                    <Text>English Certificate</Text>
                                    <div>
                                        {teacher.english_certificate?.ielts ? (
                                            <a
                                                href={teacher.degree}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                <Tag
                                                    icon={<CheckOutlined />}
                                                    color='success'
                                                >
                                                    IELTS
                                                </Tag>
                                            </a>
                                        ) : (
                                            <Tag
                                                icon={<CloseOutlined />}
                                                color='error'
                                            >
                                                IELTS
                                            </Tag>
                                        )}
                                        {teacher.english_certificate?.toeic ? (
                                            <a
                                                href={teacher.degree}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                <Tag
                                                    icon={<CheckOutlined />}
                                                    color='success'
                                                >
                                                    TOEIC
                                                </Tag>
                                            </a>
                                        ) : (
                                            <Tag
                                                icon={<CloseOutlined />}
                                                color='error'
                                            >
                                                TOEIC
                                            </Tag>
                                        )}
                                    </div>
                                    <Text>Teaching Certificate</Text>
                                    <div>
                                        {teacher.teaching_certificate?.tesol ? (
                                            <a
                                                href={teacher.degree}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                <Tag
                                                    icon={<CheckOutlined />}
                                                    color='success'
                                                >
                                                    TESOL
                                                </Tag>
                                            </a>
                                        ) : (
                                            <Tag
                                                icon={<CloseOutlined />}
                                                color='error'
                                            >
                                                TESOL
                                            </Tag>
                                        )}
                                        {teacher.teaching_certificate?.tefl ? (
                                            <a
                                                href={teacher.degree}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                <Tag
                                                    icon={<CheckOutlined />}
                                                    color='success'
                                                >
                                                    TEFL
                                                </Tag>
                                            </a>
                                        ) : (
                                            <Tag
                                                icon={<CloseOutlined />}
                                                color='error'
                                            >
                                                TEFL
                                            </Tag>
                                        )}
                                    </div>
                                </Space>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default memo(TeacherTrialModal)
