import React, { memo, useCallback, useEffect } from 'react'
import WalletAPI from 'api/WalletAPI'
import moment from 'moment'
import {
    Card,
    Empty,
    Space,
    Table,
    TableColumnsType,
    Image,
    Row,
    Form,
    Modal,
    Button,
    notification,
    Tag,
    Col,
    Popover
} from 'antd'

interface Props {
    visible: boolean
    toggleModal: (v: boolean, record: any) => void
    detail: any
}

const TransactionsDetailModal: React.FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, detail } = props
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => toggleModal(false, null)}
            footer={[
                <Button
                    key='back'
                    type='default'
                    onClick={() => toggleModal(false, null)}
                >
                    Close
                </Button>
            ]}
        >
            <Card title='Order detail'>
                <div>
                    <b>ORDER CODE:</b> {detail?.order_code}
                </div>
                <div>
                    <b>ORDER Description:</b> {detail?.order_description}
                </div>
                <div>
                    <b>Amount:</b> {detail?.total_amount} VND
                </div>
                <div>
                    <b>TID:</b> {detail?.transaction_id}
                </div>
                <div>
                    <b>Payment Type:</b>{' '}
                    {detail?.payment_type === 1
                        ? 'Thanh toán trực tiếp'
                        : detail?.payment_type === 2
                        ? 'Thanh toán tạm giữ'
                        : 'Unknown'}
                </div>
                <div>
                    <b>Trạng thái:</b>{' '}
                    {detail?.transaction_status === '00'
                        ? 'Đã thanh toán'
                        : detail?.transaction_status === '01'
                        ? 'Giao dịch mới tạo, chưa thanh toán'
                        : detail?.transaction_status === '02'
                        ? 'Đã thanh toán, đang bị tạm giữ'
                        : detail?.transaction_status === '03'
                        ? 'Giao dịch bị huỷ'
                        : detail?.transaction_status === '04'
                        ? 'Giao dịch đã hoàn thành thành công'
                        : detail?.transaction_status}
                </div>
                <hr />
                <div>
                    <b>Receiver Email:</b> {detail?.receiver_email}
                </div>
                <hr />
                <div>
                    <b>Buyer Email:</b> {detail?.buyer_email}
                </div>
                <div>
                    <b>Buyer Address:</b> {detail?.buyer_address}
                </div>
                <div>
                    <b>Buyer Full Name:</b> {detail?.buyer_fullname}
                </div>
                <div>
                    <b>Buyer Mobile:</b> {detail?.buyer_mobile}
                </div>
                <div>
                    <b>Buyer Bank:</b> {detail?.bank_code}
                </div>
                <div>
                    <b>Payment Method:</b> {detail?.payment_method}
                </div>
            </Card>
        </Modal>
    )
}

export default TransactionsDetailModal
