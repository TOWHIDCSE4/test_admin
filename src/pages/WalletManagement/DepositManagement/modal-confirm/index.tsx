/* eslint-disable react/no-danger */
import React, { FC, useEffect, useState, useCallback, useReducer } from 'react'
import { Button, Timeline, Modal, notification, Alert } from 'antd'
import WalletAPI from 'api/WalletAPI'
import { EnumWalletHistoryStatus } from 'const'

type Props = {
    item: any
    visible: boolean
    toggleModal: (val: boolean) => void
    refresh: () => void
}
const ModalConfirm: FC<Props> = ({ visible, item, toggleModal, refresh }) => {
    const accept = async () => {
        try {
            const res = await WalletAPI.acceptDeposit({ _id: item })
            if (res && res.status === EnumWalletHistoryStatus.FAILED) {
                notification.error({
                    message: 'Error',
                    description: 'Something error. Please try again.'
                })
            }
            if (res && res.status === EnumWalletHistoryStatus.DONE) {
                notification.success({
                    message: 'Success',
                    description: 'Deposit success.'
                })
            }
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
            centered
            closable
            title='Confirm'
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
                    onClick={() => {
                        accept()
                    }}
                >
                    Accept
                </Button>
            ]}
        >
            {item ? (
                <>
                    <div className='border p-2 mb-2'>
                        <p>Full Name : {item.user?.full_name}</p>
                        <p>Phone Number : {item.user?.phone_number}</p>
                        <p>Username : {item.user?.username}</p>
                        <p>Source : {item.source}</p>
                        <p>
                            Price :{' '}
                            {Intl.NumberFormat('en-US').format(item.price)}
                        </p>
                        <p>
                            iXu : {Intl.NumberFormat('en-US').format(item.coin)}
                        </p>
                    </div>

                    <Alert
                        message='Warning'
                        description={
                            <>
                                <p>
                                    - This action will be recognized as revenue.
                                </p>
                            </>
                        }
                        type='warning'
                        showIcon
                        className='mb-3 w-100'
                    />
                </>
            ) : (
                <></>
            )}
        </Modal>
    )
}

export default ModalConfirm
