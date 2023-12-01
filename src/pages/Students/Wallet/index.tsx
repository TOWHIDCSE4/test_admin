import React, { useCallback, useState, useEffect } from 'react'
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    notification,
    Popover,
    Tag,
    Col,
    Row
} from 'antd'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import { IWallet } from 'types'
import WalletAPI from 'api/WalletAPI'
import { toReadablePrice } from 'utils'
import UserAPI from 'api/UserAPI'
import { POINT_VND_RATE } from 'const'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import TransactionsModal from './transactions-modal'
import Search from 'antd/lib/input/Search'
import _ from 'lodash'
import NameTeacherStudent from 'components/name-teacher-student'

const StudentWallet = () => {
    const [wallets, setWallets] = useState<IWallet[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [visibleDetail, setVisibleDetail] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [search, setSearch] = useState<string>('')
    const [selectedRecord, setSelectedRecord] = useState(null)

    const fetchWallets = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search?: string
        }) => {
            setLoading(true)
            WalletAPI.getWallets(query)
                .then((data) => {
                    setWallets(data.data)
                    setTotal(data.pagination.total)
                    setLoading(false)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                    setLoading(false)
                })
                .finally(() => setLoading(false))
        },
        []
    )

    const toggleDetailModal = useCallback(
        (record) => {
            setVisibleDetail(!visibleDetail)
            setSelectedRecord(record)
        },
        [visibleDetail]
    )

    useEffect(() => {
        fetchWallets({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [])

    const handleChangePagination = (page_number, page_size) => {
        setPageSize(page_size)
        setPageNumber(page_number)
        fetchWallets({
            page_size,
            page_number,
            search
        })
    }

    const onSearch = (val) => {
        setPageNumber(1)
        setSearch(val)
        fetchWallets({
            page_size: pageSize,
            page_number: pageNumber,
            search: val
        })
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , username , email'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

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
            title: 'Last updated',
            dataIndex: 'updated_time',
            key: 'updated_time',
            width: '15%',
            align: 'center',
            render: (text) =>
                moment(text).isValid() ? moment(text).format('DD/MM/YYYY') : ''
        },
        {
            title: 'Student',
            dataIndex: 'user',
            key: 'user',
            width: '250',
            align: 'center',
            render: (text) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {text?.email}
                            <br />
                            <b>Phone:</b> {text?.phone_number}
                            <br />
                            <b>Skype:</b> {text?.skype_account}
                        </>
                    }
                >
                    <NameTeacherStudent
                        data={text}
                        type='student'
                    ></NameTeacherStudent>
                </Popover>
            )
        },
        {
            title: 'Current Balance',
            dataIndex: 'total_balance',
            key: 'total_balance',
            align: 'center',
            render: (text) => (
                <>
                    <p>
                        <b style={{ color: 'green', fontSize: 20 }}>
                            {toReadablePrice(text)} iXu
                        </b>
                    </p>
                    <p>({toReadablePrice(text * POINT_VND_RATE)} VNĐ)</p>
                </>
            )
        },
        {
            title: 'Total income Balance',
            dataIndex: 'totalIn',
            key: 'totalIn',
            align: 'center',
            render: (text) => (
                <>
                    <p>
                        <b style={{ color: 'red', fontSize: 14 }}>
                            {toReadablePrice(text)} Points
                        </b>
                    </p>
                    <p>({toReadablePrice(text * POINT_VND_RATE)} VNĐ)</p>
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '15%',
            render: (text, record) =>
                checkPermission(PERMISSIONS.ssw_view_detail) && (
                    <Button
                        size='small'
                        type='primary'
                        onClick={() => toggleDetailModal(record)}
                        title='Detail transaction'
                    >
                        Transactions
                    </Button>
                )
        }
    ]

    return (
        <>
            <Card title={`Student's Wallet`}>
                <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={wallets.map((d, i) => ({ key: i, ...d }))}
                    bordered
                    pagination={{
                        defaultCurrent: pageNumber,
                        pageSize,
                        total,
                        onChange: handleChangePagination
                    }}
                />
            </Card>

            <TransactionsModal
                visible={visibleDetail}
                toggleModal={toggleDetailModal}
                reload={fetchWallets}
                wallet={selectedRecord}
            />
        </>
    )
}

export default StudentWallet
