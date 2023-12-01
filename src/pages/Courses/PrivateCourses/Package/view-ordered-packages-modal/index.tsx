import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Switch,
    InputNumber,
    Upload,
    Image,
    Col,
    Select,
    Row,
    Table,
    Tag
} from 'antd'
import { IOrder, IOrderedPackage } from 'types'
import PackageAPI from 'api/PackageAPI'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import { DAY_TO_MS } from 'const'
import { Link } from 'react-router-dom'

type Props = {
    visible: boolean
    packageId: number
    close: () => void
}

const ViewOrderedPackagesModal: FC<Props> = ({ visible, packageId, close }) => {
    const [isLoading, setLoading] = useState(false)
    const [orderedPackages, setOrderedPackages] = useState<IOrderedPackage[]>(
        []
    )

    useEffect(() => {
        const fetchData = async () => {
            if (!visible || !packageId) {
                return
            }
            setLoading(true)
            const res = await PackageAPI.getOrderedPackagesByPackageId(
                packageId
            )
            setOrderedPackages(res)

            setLoading(false)
        }

        fetchData()
    }, [visible, packageId])

    const onClose = useCallback(() => {
        setLoading(false)
        setOrderedPackages([])
        close()
    }, [])

    const columns: ColumnsType = [
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            key: 'order_id',
            width: 80,
            align: 'center',
            render: (text) => (
                <Link
                    to={`/all-orders?id=${text}`}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {text}
                </Link>
            )
        },
        {
            title: 'User ID',
            dataIndex: 'user_id',
            key: 'user_id',
            width: 80,
            align: 'center'
        },
        {
            title: 'Number Class',
            dataIndex: 'number_class',
            key: 'number_class',
            width: 100,
            align: 'center'
        },
        {
            title: 'Activation Date',
            dataIndex: 'activation_date',
            key: 'activation_date',
            width: 100,
            align: 'center',
            render: (text) => {
                return (
                    <p>
                        {text === 0
                            ? ''
                            : moment(text).format('HH:mm DD/MM/YYYY')}
                    </p>
                )
            }
        },
        {
            title: 'Expired Date',
            dataIndex: 'expired_date',
            key: 'expired_date',
            width: 100,
            align: 'center',
            render: (text, record: IOrderedPackage) => {
                return (
                    <p>
                        {record.activation_date === 0
                            ? ''
                            : moment(
                                  record.activation_date +
                                      record.day_of_use * DAY_TO_MS
                              ).format('HH:mm DD/MM/YYYY')}
                    </p>
                )
            }
        }
    ]

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='View Ordered Package'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>
            ]}
            width={768}
        >
            <Table
                dataSource={orderedPackages}
                columns={columns}
                loading={isLoading}
                scroll={{
                    x: 500
                }}
            />
        </Modal>
    )
}

export default memo(ViewOrderedPackagesModal)
