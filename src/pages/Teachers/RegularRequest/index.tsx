import { useEffect, useCallback, useState } from 'react'
import RegularRequestAPI from 'api/RegularRequestAPI'
import { notify } from 'utils/notify'
import ConfirmRegularRequestDialog from 'core/Atoms/Modals/ConfirmRegularRequest'
import { Table, Card, Tag, Popover, Button, Row, Col, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import moment from 'moment'
import { REGULAR_REQUEST_STATUS, REGULAR_REQUEST_TYPE } from 'const/status'
import _ from 'lodash'
import { IRegularRequest } from 'types'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import Search from 'antd/lib/input/Search'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select

const RegularRequest = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [visibleModal, setVisibleModal] = useState<boolean>(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [regularRequests, setRegularRequests] = useState<IRegularRequest[]>(
        []
    )
    const [status, setStatus] = useState<REGULAR_REQUEST_STATUS>(null)
    const [search, setSearch] = useState<string>('')

    const getRegularRequests = (query: {
        page_size: number
        page_number: number
        status?: REGULAR_REQUEST_STATUS
        search?: string
    }) => {
        setLoading(true)
        RegularRequestAPI.getRegularRequests(query)
            .then((res) => {
                setRegularRequests(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const toggleModal = useCallback(
        (value: boolean, selected?: any) => {
            setVisibleModal(value)
            setSelectedRequest(selected)
        },
        [selectedRequest, visibleModal]
    )

    const refetchData = useCallback(() => {
        getRegularRequests({
            page_number: pageNumber,
            page_size: pageSize,
            search,
            status
        })
    }, [pageSize, pageNumber, search, status])

    useEffect(() => {
        getRegularRequests({
            page_number: pageNumber,
            page_size: pageSize,
            status
        })
    }, [])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (_pageNumber !== pageNumber) {
                setPageNumber(_pageNumber)
                getRegularRequests({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search,
                    status
                })
            }
            if (_pageSize !== pageSize) {
                setPageSize(_pageSize)
                getRegularRequests({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search,
                    status
                })
            }
        },
        [pageSize, pageNumber, search, status]
    )

    const onChangeStatus = (val) => {
        setStatus(val)
        setPageNumber(1)
        getRegularRequests({
            page_number: 1,
            page_size: pageSize,
            status: val,
            search
        })
    }

    const onChangeSearch = (val) => {
        setSearch(val)
        setPageNumber(1)
        getRegularRequests({
            page_number: 1,
            page_size: pageSize,
            status,
            search: val
        })
    }

    const renderAllRegularTimes = (_regular_times: any[]) => (
        <ul style={{ height: '250px', overflow: 'auto' }} className='pr-3'>
            {_regular_times.map((item, index) => {
                const convertToLocal = getTimestampInWeekToLocal(item)
                return <li key={index}>{formatTimestamp(convertToLocal)}</li>
            })}
        </ul>
    )

    const columns: ColumnsType<IRegularRequest> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Name',
            dataIndex: 'teacher',
            key: 'teacher',
            align: 'center',
            width: 200,
            render: (text, record) => {
                return (
                    <>
                        <NameTeacherStudent
                            data={record?.teacher?.user}
                            type='teacher'
                        ></NameTeacherStudent>
                    </>
                )
            }
        },
        {
            title: 'Regular time current',
            dataIndex: 'old_regular_times',
            key: 'old_regular_times',
            align: 'center',
            width: 200,
            render: (text, record: any) => (
                <ul style={{ paddingInlineStart: '1em' }}>
                    {text &&
                        text
                            .filter((x, index) => index < 2)
                            .map((x, _index) => {
                                const convertToLocal =
                                    getTimestampInWeekToLocal(x)
                                return (
                                    <li key={_index}>
                                        {formatTimestamp(convertToLocal)}
                                    </li>
                                )
                            })}
                    {text.length > 2 && (
                        <Popover content={renderAllRegularTimes(text)}>
                            <Button type='link'>See more...</Button>
                        </Popover>
                    )}
                </ul>
            )
        },
        {
            title: 'Regular time request',
            dataIndex: 'regular_times',
            key: 'regular_times',
            align: 'center',
            width: 200,
            render: (text, record: any) => (
                <ul style={{ paddingInlineStart: '1em' }}>
                    {text &&
                        text
                            .filter((x, index) => index < 2)
                            .map((x, _index) => {
                                const convertToLocal =
                                    getTimestampInWeekToLocal(x)
                                return (
                                    <li key={_index}>
                                        {formatTimestamp(convertToLocal)}
                                    </li>
                                )
                            })}
                    {text.length > 2 && (
                        <Popover content={renderAllRegularTimes(text)}>
                            <Button type='link'>See more...</Button>
                        </Popover>
                    )}
                </ul>
            )
        },
        {
            title: 'Type',
            dataIndex: 'old_regular_times',
            key: 'old_regular_times',
            align: 'center',
            width: 200,
            render: (text, record) => {
                if (
                    record.old_regular_times.length ===
                    record.regular_times.length
                ) {
                    return (
                        <Tag color='#faad14'>
                            {_.upperCase(REGULAR_REQUEST_TYPE.EDIT)}
                        </Tag>
                    )
                }
                if (
                    record.old_regular_times.length <
                    record.regular_times.length
                ) {
                    return (
                        <Tag color='#40a9ff'>
                            {_.upperCase(REGULAR_REQUEST_TYPE.NEW)}
                        </Tag>
                    )
                }
                if (
                    record.old_regular_times.length >
                    record.regular_times.length
                ) {
                    return (
                        <Tag color='#ff4d4f'>
                            {_.upperCase(REGULAR_REQUEST_TYPE.CLOSE)}
                        </Tag>
                    )
                }
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 200,
            render: (text, record) => {
                switch (text) {
                    case REGULAR_REQUEST_STATUS.CONFIRMED:
                        return (
                            <Tag color='#52c41a'>
                                {_.upperCase(
                                    _.findKey(
                                        REGULAR_REQUEST_STATUS,
                                        (o) => o === text
                                    )
                                )}
                            </Tag>
                        )
                    case REGULAR_REQUEST_STATUS.PENDING:
                        return (
                            <Tag color='#faad14'>
                                {_.upperCase(
                                    _.findKey(
                                        REGULAR_REQUEST_STATUS,
                                        (o) => o === text
                                    )
                                )}
                            </Tag>
                        )
                    case REGULAR_REQUEST_STATUS.CANCELED:
                        return (
                            <Tag color='#ff4d4f'>
                                {_.upperCase(
                                    _.findKey(
                                        REGULAR_REQUEST_STATUS,
                                        (o) => o === text
                                    )
                                )}
                            </Tag>
                        )
                    default:
                }
            }
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            width: 200
        },
        {
            title: 'Request time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 170,
            render: (text, record) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 120,
            render: (text, record) =>
                (checkPermission(PERMISSIONS.trr_approve) ||
                    checkPermission(PERMISSIONS.trr_reject)) && (
                    <EditOutlined
                        type='button'
                        onClick={() => toggleModal(true, record)}
                        title='Edit regular request'
                    />
                )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={status}
                    onChange={onChangeStatus}
                >
                    <Option value={null} key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(REGULAR_REQUEST_STATUS)
                        .filter(
                            (key: any) =>
                                !isNaN(Number(REGULAR_REQUEST_STATUS[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={REGULAR_REQUEST_STATUS[key]}
                                key={REGULAR_REQUEST_STATUS[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , username'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onChangeSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Regular Request Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Row justify='end' className='mb-3' gutter={[20, 20]}>
                <Col xs={12} sm={12} md={8} lg={3} xl={3}></Col>
            </Row>

            <Table
                dataSource={regularRequests}
                columns={columns}
                pagination={{
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                loading={isLoading}
                scroll={{ x: 500 }}
                bordered
            />
            <ConfirmRegularRequestDialog
                visible={visibleModal}
                data={selectedRequest}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default RegularRequest
