/* eslint-disable react/no-danger */
import React, { FC, useEffect, useState, useCallback, useReducer } from 'react'
import { Button, Timeline, Modal } from 'antd'

import moment from 'moment'

type Props = {
    timeLine: any
    visible: boolean
    toggleModal: (val: boolean) => void
}
const ModalHistory: FC<Props> = ({ visible, timeLine, toggleModal }) => {
    return (
        <Modal
            title='History'
            visible={visible}
            centered
            closable
            onCancel={() => {
                toggleModal(false)
            }}
            footer={[
                <Button
                    type='primary'
                    onClick={() => {
                        toggleModal(false)
                    }}
                >
                    Close
                </Button>
            ]}
        >
            <Timeline>
                {timeLine.map((e) => {
                    return (
                        <Timeline.Item color='green'>
                            <strong>
                                {`${e.action} - ${moment(e.time).format(
                                    'HH:mm DD/MM/YYYY'
                                )}`}
                            </strong>
                            <p>{` ${e.description}`}</p>
                        </Timeline.Item>
                    )
                })}
            </Timeline>
        </Modal>
    )
}

export default ModalHistory
