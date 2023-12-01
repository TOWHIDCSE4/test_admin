import React, { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, DatePicker, Form, Input, Button, Select } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { IStudentLeaveRequest } from 'types'
import StudentLeaveRequestAPI from 'api/StudentLeaveRequestAPI'
import { FULL_DATE_FORMAT } from 'const'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Option } = Select

type StudentLeaveRequestModalProps = {
    visible: boolean
    // data?: IStudentLeaveRequest
    toggleModal: (visible: boolean) => void
    refetchData: any
}

const CreateLeaveRequestModal: FC<StudentLeaveRequestModalProps> = ({
    visible,
    // data,
    toggleModal,
    refetchData
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const onClose = () => {
        toggleModal(false)
        form.resetFields()
    }
    const onSubmit = useCallback(() => {
        setLoading(true)
        StudentLeaveRequestAPI.createStudentLeaveRequest({
            student_id: form.getFieldValue('student_id'),
            start_time: new Date(form.getFieldValue('time')[0]).getTime(),
            end_time: new Date(form.getFieldValue('time')[1]).getTime(),
            admin_note: form.getFieldValue('admin_note')
        })
            .then((res) => {
                setLoading(false)
                notify('success', 'Create successfully')
                onClose()
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
                setLoading(false)
            })
            .finally(() => setLoading(false))
    }, [loading, form])

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                admin_note: '',
                time: [
                    moment().startOf('hours').add('minute', 30),
                    moment().startOf('hours').add('minute', 60)
                ]
            })
        }
    }, [visible])

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 }
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 14 }
        }
    }

    const fetchStudent = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'STUDENT',
            q
        })
        return res.data.map((i) => ({
            label: `${i.full_name} - ${i.username}`,
            value: i.id
        }))
    }, [])

    const disabledDate = (current) =>
        // Can not select days before today and today
        current && current < moment().startOf('day')

    const renderBody = () => (
        <Form {...formItemLayout} form={form}>
            <Form.Item required label='Student' name='student_id'>
                <DebounceSelect
                    placeholder='Search by student'
                    fetchOptions={fetchStudent}
                    allowClear
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <Form.Item
                label='Time'
                required
                name='time'
                initialValue={[
                    moment().startOf('hours').add('minute', 30),
                    moment().startOf('hours').add('minute', 60)
                ]}
            >
                <RangePicker
                    allowClear={false}
                    showTime={{ format: 'HH:mm' }}
                    format={FULL_DATE_FORMAT}
                    disabledDate={disabledDate}
                />
            </Form.Item>
            <Form.Item label='Admin Note' name='admin_note'>
                <TextArea placeholder='Enter your note here...' />
            </Form.Item>
        </Form>
    )

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={onClose}
            title='Create student leave request'
            width={700}
            footer={[
                <Button
                    key='approve'
                    type='primary'
                    shape='round'
                    onClick={onSubmit}
                    loading={loading}
                >
                    Submit
                </Button>
            ]}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(CreateLeaveRequestModal)
