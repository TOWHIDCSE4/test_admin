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
import { ColumnsType } from 'antd/lib/table'

import { blue, green, red } from '@ant-design/colors'
import _ from 'lodash'
import React, {
    useState,
    useCallback,
    useEffect,
    FunctionComponent
} from 'react'
import { IScheduledMemo } from 'types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { calculateClassification } from 'utils/string'
import moment from 'moment'
import WalletAPI from 'api/WalletAPI'
import {
    POINT_VND_RATE,
    EnumTransactionType,
    EnumTransactionStatus,
    IModalProps
} from 'const'
import { toReadablePrice } from 'utils'
import TransactionsDetailModal from '../transaction-detail-modal'

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (request: any) => void
    reload: () => void
    wallet: any
}

const TransactionsModal: FunctionComponent<IProps> = (props) => {
    const { visible, toggleModal, reload, wallet } = props

    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState<boolean>(false)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const [visibleDetail, setVisibleDetail] = useState<boolean>(false)
    const [orderInfo, setOrderInfo] = useState(null)

    const toggleDetailModal = useCallback(
        (v, record) => {
            if (v) {
                WalletAPI.getOrderInformation({
                    order_code: record._id
                })
                    .then((data) => {
                        setOrderInfo(data)
                        setVisibleDetail(v)
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
            } else {
                setOrderInfo(null)
                setVisibleDetail(v)
            }
        },
        [visibleDetail, orderInfo]
    )

    const fetchTransactions = useCallback(
        (query?: {
            page_number?: number
            page_size?: number
            user_id: number
        }) => {
            WalletAPI.getWalletTransactions(query)
                .then((res) => {
                    setTransactions(res.data)
                    setTotal(res.pagination.total)
                })
                .catch((e) => {
                    notification.error({
                        message: 'Error',
                        description: e.message
                    })
                })
                .finally(() => setLoading(false))
        },
        [transactions]
    )

    useEffect(() => {
        if (visible) {
            fetchTransactions({
                page_number: pageNumber,
                page_size: pageSize,
                user_id: wallet?.user_id
            })
        }
    }, [visible])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchTransactions({
                page_size,
                page_number,
                user_id: wallet?.user_id
            })
        },
        [wallet?.user_id]
    )

    const columns: ColumnsType = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Mã giao dịch',
            dataIndex: '_id',
            key: '_id',
            fixed: 'left',
            width: '8%',
            align: 'center',
            render: (text) => (
                <p title={text}>
                    {text.substring(text.length - 6, text.length).toUpperCase()}
                </p>
            )
        },
        {
            title: 'Check Code',
            dataIndex: '_id',
            key: '_id',
            fixed: 'left',
            width: '8%',
            align: 'center',
            render: (text) => <p>{text}</p>
        },
        {
            title: 'Time',
            dataIndex: 'updated_time',
            key: 'updated_time',
            width: '15%',
            align: 'center',
            render: (text) =>
                moment(text).isValid()
                    ? moment(text).format('hh:mm DD/MM/YYYY')
                    : ''
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text) => EnumTransactionType[text]
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            fixed: 'left',
            width: '8%',
            align: 'center',
            render: (text, record: any) => (
                <Tag
                    color={
                        record.status !== EnumTransactionStatus.DONE
                            ? 'grey'
                            : record.type === EnumTransactionType.IN
                            ? 'green'
                            : 'red'
                    }
                >
                    {record.status !== EnumTransactionStatus.DONE
                        ? ''
                        : record.type === EnumTransactionType.IN
                        ? '+'
                        : '-'}{' '}
                    {text} đ
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            fixed: 'left',
            width: '7%',
            align: 'center',
            render: (text, record: any) => EnumTransactionStatus[text]
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            fixed: 'left',
            width: '10%',
            align: 'center',
            render: (text) => text
        }
    ]

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => {
                toggleModal(null)
                reload()
            }}
            title={`Transactions history of ${wallet?.user?.full_name} - ${wallet?.user?.username}`}
            footer={[
                <Button
                    key='back'
                    type='default'
                    onClick={() => toggleModal(null)}
                >
                    Close
                </Button>
            ]}
            width='80%'
        >
            <Card loading={loading}>
                <Row className='mb-4' justify='end' gutter={[16, 16]}>
                    <Col span={24}>
                        <div className='text-center'>
                            <strong>
                                <h3>Current:</h3>
                                <Form.Item
                                    style={{
                                        fontSize: '24px',
                                        color: '#08c'
                                    }}
                                >
                                    {toReadablePrice(wallet?.total_balance)}{' '}
                                    Points
                                </Form.Item>
                            </strong>
                        </div>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={transactions.map((d, i) => ({ key: i, ...d }))}
                    bordered
                    pagination={{
                        defaultCurrent: pageNumber,
                        pageSize,
                        total,
                        onChange: handleChangePagination
                    }}
                />
            </Card>
            <TransactionsDetailModal
                visible={visibleDetail}
                detail={orderInfo}
                toggleModal={toggleDetailModal}
            />
        </Modal>
    )
}

export default TransactionsModal
