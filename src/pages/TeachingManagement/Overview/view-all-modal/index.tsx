import { FunctionComponent } from 'react'
import { Modal, Form, Tag } from 'antd'
import _ from 'lodash'
import { BOOKING_STATUS_OBJECT } from 'const/status'
import { IBooking } from 'types'
import moment from 'moment'
import { getColorTagByBookingStatus } from 'utils/common'
import Link from 'antd/lib/typography/Link'
import { IModalProps } from 'const/common'

interface Props extends IModalProps {
    booking: IBooking
}

const ViewAll: FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, booking } = props

    // useEffect(() => {
    //     if (booking && !_.isEmpty(booking)) {
    //         setValues({ booking })
    //     }
    // }, [show])

    const renderBody = () => (
        <>
            <Form
                name='Automatic Scheduling Form'
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                <Form.Item label='Booking Time'>
                    <span>
                        <b>
                            {booking.calendar &&
                                moment(booking.calendar.start_time).format(
                                    'HH:mm DD/MM/YYY'
                                )}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Teacher'>
                    <span>
                        <b>
                            {booking.teacher &&
                                `${booking.teacher.full_name} - ${booking.teacher.username}`}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Student'>
                    <span>
                        <b>
                            {booking.student &&
                                `${booking.student.full_name} -${booking.student.username}`}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Package'>
                    <span>
                        <b>
                            {booking.ordered_package &&
                                booking.ordered_package.package_name}
                        </b>
                    </span>
                </Form.Item>
                <Form.Item label='Course'>
                    <span>
                        <b>{booking.course && booking.course.name}</b>
                    </span>
                </Form.Item>
                <Form.Item label='Unit'>
                    <span>
                        <b>{booking.unit && booking.unit.name}</b>
                    </span>
                </Form.Item>
                <Form.Item label='Status'>
                    <Tag color={getColorTagByBookingStatus(booking.status)}>
                        {_.startCase(
                            _.findKey(
                                BOOKING_STATUS_OBJECT,
                                (o) => o === booking.status
                            )
                        )}
                    </Tag>
                </Form.Item>
                <Form.Item label='Note for teacher'>
                    <span>
                        <b>{booking.teacher_note}</b>
                    </span>
                </Form.Item>
                <Form.Item label='CS note'>
                    <span>
                        <b>{booking.cskh_note}</b>
                    </span>
                </Form.Item>
                <Form.Item label='HT & QTGV note'>
                    <span>
                        <b>{booking.admin_note}</b>
                    </span>
                </Form.Item>
                {/* <Form.Item label='Link of Classroom Meeting'>
                    <span>
                        <Link
                            href={`https://meet.englishplus.vn/${booking.id}`}
                        >
                            <a target='_blank'>Link to the Class</a>
                        </Link>
                    </span>
                </Form.Item> */}
            </Form>
        </>
    )
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='View Meeting'
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default ViewAll
