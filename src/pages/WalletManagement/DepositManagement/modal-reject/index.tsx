/* eslint-disable react/no-danger */
import React, { FC, useEffect, useState, useCallback, useReducer } from 'react'
import { Button, Timeline, Modal, notification } from 'antd'
import WalletAPI from 'api/WalletAPI'
import { EnumWalletHistoryStatus } from 'const'

type Props = {
    item: any
    visible: boolean
    toggleModal: (val: boolean) => void
    refresh: () => void
}
const ModalConfirm: FC<Props> = ({ visible, item, toggleModal, refresh }) => {
    const reject = async () => {
        try {
            const res = await WalletAPI.rejectDeposit({ _id: item })
            // if (res && res.status === EnumWalletHistoryStatus.FAILED) {
            //     notification.error({
            //         message: 'Error',
            //         description: 'Something error. Please try again.'
            //     })
            // }
            // if (res && res.status === EnumWalletHistoryStatus.DONE) {
            //     notification.success({
            //         message: 'Success',
            //         description: 'Deposit success.'
            //     })
            // }
            toggleModal(false)
            refresh()
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }
    return (
        <Modal
            title='Reject'
            centered
            closable
            visible={visible}
            onCancel={() => {
                toggleModal(false)
            }}
            footer={[
                <Button
                    type='default'
                    onClick={() => {
                        toggleModal(false)
                    }}
                >
                    Close
                </Button>,
                <Button
                    type='primary'
                    danger
                    onClick={() => {
                        reject()
                    }}
                >
                    Reject
                </Button>
            ]}
        >
            {item ? (
                <>
                    <p className='text-danger'>
                        I confirm that this user has not paid any money in
                        connection with this transaction.
                    </p>
                </>
            ) : (
                <></>
            )}
        </Modal>
    )
}

export default ModalConfirm
