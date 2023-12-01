import { FunctionComponent, useEffect, useReducer } from 'react'
import { Modal, Form, Tag } from 'antd'
import _ from 'lodash'
import { IBooking } from 'types'
import Jitsi from 'core/Atoms/react-jitsi/dist'
import { IModalProps } from 'const/common'

interface Props extends IModalProps {
    booking: IBooking
}

const Meeting: FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, booking } = props

    const titleModal = String(
        `Meeting of Booking ${booking.id} | Student ${booking.student?.full_name} - ${booking.student?.username} | Teacher  ${booking.teacher?.full_name} - ${booking.teacher?.username}`
    )
    const renderBody = () => (
        <>
            <Jitsi
                config={{
                    toolbarButtons: [
                        'camera',
                        'chat',
                        'microphone',
                        'desktop',
                        'select-background',
                        'settings',
                        'toggle-camera'
                    ]
                }}
                roomName={String(booking.id)}
                displayName='admin'
                domain='meet.englishplus.vn'
                containerStyle={{ width: '100%', height: '675px' }}
            />
        </>
    )
    return (
        <div style={{ top: '-100px' }}>
            <Modal
                centered
                closable
                visible={visible}
                onCancel={() => {
                    toggleModal(false)
                }}
                title={titleModal}
                footer={null}
                width={1200}
            >
                {renderBody()}
            </Modal>
        </div>
    )
}

export default Meeting
