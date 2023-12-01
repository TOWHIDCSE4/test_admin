import React, { useCallback, useEffect, useReducer, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import {
    Card,
    Table,
    Row,
    Col,
    Input,
    notification,
    Popover,
    DatePicker,
    InputNumber,
    Select,
    Button,
    Spin,
    Tag,
    Popconfirm
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { EnumPackageOrderType } from 'types'
import { TYPE_LABEL } from 'const/package'
import AdministratorAPI from 'api/AdministratorAPI'
import { DEPARTMENT } from 'const/department'
import { exportExpireSoon } from 'utils/export-xlsx'
import { PERMISSIONS } from 'const/permission'
import { checkPermission } from 'utils/check-permission'
import NameTeacherStudent from 'components/name-teacher-student'
import ZaloInteractiveHistoryAPI from 'api/ZaloInteractiveHistoryAPI'
import { DATE_FORMAT, FULL_DATE_FORMAT } from 'const'
import { AnyARecord } from 'dns'
import { notify } from 'utils/notify'
import UserAPI from 'api/UserAPI'

const { RangePicker } = DatePicker
const { Search } = Input
const { Option } = Select

export enum EnumFilterType {
    ACTIVE = 1,
    WILL_SOON_EXPIRE = 2,
    EXPIRED = 3
}

export enum ZaloHistoryStatus {
    ACTIVE = 'ACTIVE',
    WILL_SOON_EXPIRE = 'WILL SOON EXPIRE',
    EXPIRED = 'EXPIRED'
}

const Report = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isLoadingSendAll, setLoadingSendAll] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(1)
    const [tableData, setTableData] = useState([])

    const [min_start_time, setMinStartTime] = useState(
        moment().subtract(15, 'day').valueOf()
    )
    const [max_end_time, setMaxEndTime] = useState(
        moment().endOf('month').valueOf()
    )
    const [filter, setFilter] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page_size: 10,
            page_number: 1,
            search_user: '',
            min_start_time: moment().subtract(15, 'day').valueOf(),
            max_end_time: moment().endOf('month').valueOf(),
            filter_type: '',
            staff_id: ''
        }
    )
    const [staffs, setStaffs] = useState([])

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search_user: string
            min_start_time?: number
            max_end_time?: number
            filter_type?: any
            staff_id?: number
        }) => {
            setLoading(true)
            ZaloInteractiveHistoryAPI.getInteractiveHistory(query)
                .then((data) => {
                    setTableData(data?.data)
                    setTotal(data?.pagination?.total)
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

    const fetchAdminOptions = async (search, idDepartment) => {
        try {
            const res = await AdministratorAPI.getAllAdministrators({
                search,
                idDepartment
            })
            const dataStaffs = res.data.map((i) => ({
                label: `${i.fullname} - ${i.username}`,
                value: i.id,
                username: i.username,
                fullname: i.fullname,
                phoneNumber: i.phoneNumber
            }))
            setStaffs(dataStaffs)
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }

    useEffect(() => {
        fetchData({
            ...filter
        })
        fetchAdminOptions('', DEPARTMENT.phongcskh.id)
    }, [])

    const sendAllToStudent = async () => {
        setLoadingSendAll(true)
        await UserAPI.sendMessageInteractiveToAllStudent()
            .then((res) => {
                notify('success', 'Send done!')
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoadingSendAll(false))
    }

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setFilter({ ...filter, page_size, page_number })
            fetchData({
                ...filter,
                page_size,
                page_number
            })
        },
        [filter]
    )

    const onSearchString = useCallback(
        (s) => {
            setFilter({
                ...filter,
                min_start_time: s === '' ? filter.min_start_time : null,
                max_end_time: s === '' ? filter.max_end_time : null,
                filter_type: '',
                search_user: s
            })
            fetchData({
                ...filter,
                min_start_time: s === '' ? filter.min_start_time : null,
                max_end_time: s === '' ? filter.max_end_time : null,
                filter_type: '',
                search_user: s
            })
        },
        [filter]
    )

    const handleRangePicker = useCallback(
        (value) => {
            if (value[0] && value[1] && value[0] < value[1]) {
                setMinStartTime(value[0].valueOf())
                setMaxEndTime(value[1].valueOf())

                setFilter({
                    ...filter,
                    min_start_time: value[0].valueOf(),
                    max_end_time: value[1].valueOf()
                })

                fetchData({
                    ...filter,
                    min_start_time: value[0].valueOf(),
                    max_end_time: value[1].valueOf()
                })
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Invalid date range'
                })
            }
        },
        [filter]
    )

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'user_id',
            key: 'user_id',
            align: 'center',
            width: '3%',
            render: (text, record: any) => text
        },
        {
            title: 'Tên HV',
            dataIndex: 'user',
            key: 'full_name',
            align: 'left',
            width: '12%',
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={record?.user}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'SĐT',
            dataIndex: 'user.phone_number',
            key: 'phone_number',
            align: 'center',
            width: '5%',
            render: (text, record: any) => record?.user?.phone_number
        },
        {
            title: 'Staff',
            dataIndex: 'student',
            key: 'staff',
            align: 'center',
            width: '5%',
            render: (text, record: any) => record?.student?.staff?.fullname
        },
        {
            title: 'Status',
            dataIndex: 'interaction_time',
            key: 'status',
            align: 'center',
            width: '5%',
            render: (text, record) => {
                const timeCheckStart = moment().subtract(7, 'd').valueOf()
                const timeCheckEnd = moment().subtract(5, 'd').valueOf()
                if (text > timeCheckStart && text < timeCheckEnd) {
                    return (
                        <Tag color='#faad14'>
                            {ZaloHistoryStatus.WILL_SOON_EXPIRE}
                        </Tag>
                    )
                }
                if (text < timeCheckStart) {
                    return (
                        <Tag color='#ff4d4f'>{ZaloHistoryStatus.EXPIRED}</Tag>
                    )
                }
                if (text > timeCheckEnd) {
                    return <Tag color='#52c41a'>{ZaloHistoryStatus.ACTIVE}</Tag>
                }
            }
        },
        {
            title: 'Thời gian tương tác gần nhất',
            dataIndex: 'interaction_time',
            key: 'interaction_time',
            align: 'center',
            width: '8%',
            render: (text, record: any) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'interaction_time',
            key: 'expired_date',
            align: 'center',
            width: '5%',
            render: (text, record: any) => {
                const expired = moment(text).add(7, 'days')
                const hasExpired = moment().isAfter(expired)
                return <span>{moment(expired).format(FULL_DATE_FORMAT)}</span>
            }
        }
    ]

    const onSearchStaff = useCallback(
        (item) => {
            setFilter({
                ...filter,
                page_number: 1,
                staff_id: item
            })
            fetchData({
                ...filter,
                page_number: 1,
                staff_id: item
            })
        },
        [filter]
    )

    const onChangeStatus = useCallback(
        (item) => {
            setFilter({
                ...filter,
                page_number: 1,
                filter_type: item
            })
            fetchData({
                ...filter,
                page_number: 1,
                filter_type: item
            })
        },
        [filter]
    )

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Thời gian tương tác gần nhất',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    value={[moment(min_start_time), moment(max_end_time)]}
                />
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={filter.status}
                    defaultValue=''
                    onChange={onChangeStatus}
                >
                    <Option value='' key={-1}>
                        ALL
                    </Option>
                    {Object.keys(EnumFilterType)
                        .filter(
                            (key: any) => !isNaN(Number(EnumFilterType[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={EnumFilterType[key]}
                                key={EnumFilterType[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Staff',
            engine: (
                <Select
                    defaultValue={filter.staff_id}
                    style={{ width: '100%' }}
                    onChange={_.debounce(onSearchStaff, 250)}
                >
                    <Select.Option value=''>All</Select.Option>
                    {staffs.map((item, index) => (
                        <Select.Option
                            key={`staff_id${index}`}
                            value={item.value}
                        >
                            {_.capitalize(item.label)}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Student',
            engine: (
                <Search
                    placeholder='Search by name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchString, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Lịch sử học viên tương tác zalo'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>
            <Row className='mb-2'>
                {checkPermission(PERMISSIONS.zlrzi_view) && (
                    <Col span={24} className='d-flex justify-content-start'>
                        <Popconfirm
                            placement='top'
                            title='Bạn chắc chắn muốn gửi tin tương tác đến tất cả học viên có liên kết zaloOA?'
                            onConfirm={() => sendAllToStudent()}
                            okText='Gửi'
                            cancelText='Hủy'
                        >
                            <Button
                                type='primary'
                                className='mr-4'
                                disabled={isLoadingSendAll}
                                loading={isLoadingSendAll}
                            >
                                Gửi tin nhắn tương tác
                            </Button>
                        </Popconfirm>
                    </Col>
                )}
            </Row>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Table
                        loading={isLoading}
                        bordered
                        columns={columns}
                        dataSource={tableData.map((d, i) => ({ key: i, ...d }))}
                        pagination={{
                            defaultCurrent: filter.pageNumber,
                            pageSize: filter.pageSize,
                            total,
                            onChange: handleChangePagination
                        }}
                    />
                </Col>
            </Row>
        </Card>
    )
}

export default Report
