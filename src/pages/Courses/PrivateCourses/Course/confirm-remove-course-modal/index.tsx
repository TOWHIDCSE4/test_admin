import { FC, memo, useCallback } from 'react'
import { Table, Button, Modal, Popover, Tag, Alert } from 'antd'
import _ from 'lodash'
import { BOOKING_STATUS_OBJECT } from 'const/status'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import { ColumnsType } from 'antd/lib/table'
import { PhoneOutlined, SkypeOutlined } from '@ant-design/icons'
import moment from 'moment'
import { IModalProps } from 'const/common'
import NameTeacherStudent from 'components/name-teacher-student'

interface IProps extends IModalProps {
    data: any
}

const ConfirmRemoveCourse: FC<IProps> = ({ visible, data, toggleModal }) => {
    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const columnsRegularCalendars: ColumnsType = [
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 200,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            width: 200,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 200,
            render: (text, record) => text && text.name
        },
        {
            title: 'Regular Time',
            dataIndex: 'regular_start_time',
            key: 'regular_start_time',
            width: 150,
            fixed: 'right',
            render: (text, record) => {
                const convertToLocal = getTimestampInWeekToLocal(text)
                return formatTimestamp(convertToLocal)
            }
        }
    ]

    const colorStatus = (status) => {
        switch (status) {
            case BOOKING_STATUS_OBJECT.COMPLETED:
                return 'success'
            case BOOKING_STATUS_OBJECT.PENDING:
                return 'warning'
            case BOOKING_STATUS_OBJECT.UPCOMING:
                return 'cyan'
            case BOOKING_STATUS_OBJECT.TEACHING:
                return 'processing'
            case BOOKING_STATUS_OBJECT.STUDENT_ABSENT ||
                BOOKING_STATUS_OBJECT.TEACHER_ABSENT:
                return 'volcano'
            case BOOKING_STATUS_OBJECT.CANCEL_BY_STUDENT ||
                BOOKING_STATUS_OBJECT.CANCEL_BY_TEACHER:
                return 'error'
            default:
                break
        }
    }

    const columnsBooking: ColumnsType = [
        {
            title: 'Booking type',
            dataIndex: 'is_regular_booking',
            key: 'is_regular_booking',
            align: 'left',
            width: 150,
            render: (text, record, index) =>
                text ? (
                    <Tag color='red'>REGULAR</Tag>
                ) : (
                    <Tag color='green'>FLEXIBLE</Tag>
                )
        },
        {
            title: 'Time',
            dataIndex: 'calendar',
            key: 'calendar',
            align: 'left',
            width: 150,
            render: (text, record) =>
                text && moment(text.start_time).format('HH:mm DD/MM/YYYY')
        },
        {
            title: 'Class',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                            <br />
                            <SkypeOutlined className='mr-2' />{' '}
                            {record.communicate_tool &&
                                record.communicate_tool.teacher_account}
                            <br />
                            <b>Student:</b>{' '}
                            <NameTeacherStudent
                                data={record?.student}
                                type='student'
                            ></NameTeacherStudent>
                            <br />
                            <PhoneOutlined className='mr-2' />{' '}
                            {record.student && record.student.phone_number}
                            <br />
                            <SkypeOutlined className='mr-2' />{' '}
                            {record.communicate_tool &&
                                record.communicate_tool.student_account}
                        </>
                    }
                >
                    <div>
                        <p className='mb-2'>
                            <b>Teacher:</b>{' '}
                            <NameTeacherStudent
                                data={text}
                                type='teacher'
                            ></NameTeacherStudent>
                        </p>
                    </div>
                    <p>
                        <b>Student:</b>{' '}
                        <NameTeacherStudent
                            data={record?.student}
                            type='student'
                        ></NameTeacherStudent>
                    </p>
                </Popover>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            align: 'left',
            width: 200,
            render: (text, record: any) => (
                <Popover
                    title=''
                    content={
                        <>
                            11/60
                            <br />
                            <b>Course: {text && text.name}</b>
                            <br />
                            <b>Unit: {record.unit && record.unit.name}</b>
                        </>
                    }
                >
                    <span>{text && text.name}</span>
                </Popover>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            width: 100,
            fixed: 'right',
            render: (text, record) => (
                <Tag color={colorStatus(text)}>
                    {_.startCase(
                        _.findKey(BOOKING_STATUS_OBJECT, (o) => o === text)
                    )}
                </Tag>
            )
        }
    ]

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Confirm remove/deactivated course'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>
                // <Button key='submit' type='primary'>
                //     Confirm remove
                // </Button>
            ]}
            width={768}
        >
            <div>
                <Alert
                    message='Course is not deactivated or removed because of booking or regular calendars available'
                    type='error'
                    className='mb-3'
                />
                {!_.isEmpty(data?.bookings) && (
                    <Table
                        bordered
                        dataSource={data?.bookings}
                        columns={columnsBooking}
                        rowKey={(record: any) => record?._id}
                        scroll={{
                            x: 500,
                            y: 300
                        }}
                        title={() => 'Bookings'}
                    />
                )}
                {!_.isEmpty(data?.regular_calendars) && (
                    <Table
                        bordered
                        dataSource={data?.regular_calendars}
                        columns={columnsRegularCalendars}
                        rowKey={(record: any) => record?._id}
                        scroll={{
                            x: 500,
                            y: 300
                        }}
                        title={() => 'Regular calendars'}
                    />
                )}
            </div>
        </Modal>
    )
}

export default memo(ConfirmRemoveCourse)
