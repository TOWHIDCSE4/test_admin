import React, { useCallback, useEffect, useState } from 'react'
import CustomerSupportReportAPI from 'api/CustomerSupportReportAPI'
import SignUpContactAPI from 'api/SignUpContactAPI'
import DepartmentAPI from 'api/DepartmentAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import {
    Card,
    Table,
    Row,
    Col,
    Input,
    notification,
    Popover,
    Select,
    Tag
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import _ from 'lodash'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import ConfirmModal from '../../../core/Atoms/ConfirmModal'

const { Search } = Input
const { Option } = Select

const Report = () => {
    const [isLoading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = React.useState(1)
    const [tableData, setTableData] = useState([])
    const [searchString, setSearchString] = useState('')
    const [departments, setDepartments] = useState([])
    const [searchDepartment, setSearchDepartment] = useState('')
    // const [day, setDay] = useState(null)
    // const [month, setMonth] = useState(moment().month() + 1)

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search?: string
            search_department?: string
        }) => {
            setLoading(true)
            SignUpContactAPI.getContacts(query)
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

    const initDepartment = useCallback((id?: number) => {
        DepartmentAPI.getDepartments({ idDepartment: id || '' })
            .then((res) => {
                setDepartments(res)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }, [])

    const loadDepartment = useCallback(
        async (q) => {
            const res = await DepartmentAPI.getDepartments({})
            return res.map((i) => ({
                label: i.name,
                value: i.id
            }))
        },
        [departments]
    )

    useEffect(() => {
        initDepartment()
        fetchData({ page_size: pageSize, page_number: pageNumber })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                search: searchString,
                search_department: searchDepartment
            })
        },
        [searchString, searchDepartment]
    )

    const onSearchString = useCallback(
        (s) => {
            setSearchString(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: s,
                search_department: searchDepartment
            })
        },
        [pageSize, pageNumber, searchDepartment]
    )

    // const onSearchMonth = useCallback(
    //     (_month) => {
    //         setMonth(_month)
    //         fetchData({
    //             page_size: pageSize,
    //             page_number: pageNumber,
    //             search: searchString,
    //             day,
    //             month: _month
    //         })
    //     },
    //     [pageSize, pageNumber, searchString, day, status]
    // )

    const onSearchDep = useCallback(
        (dep) => {
            setSearchDepartment(dep)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                search_department: dep
            })
        },
        [pageNumber, pageSize, searchString]
    )

    const updateStatus = useCallback(async (query?: any, record?: any) => {
        await SignUpContactAPI.updateContact(record._id, {
            department: query.id
        })
        fetchData({
            page_size: pageSize,
            page_number: pageNumber,
            search: searchString,
            search_department: searchDepartment
        })
    }, [])
    const columns: ColumnsType = [
        {
            title: 'Ngày tạo',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                moment(record.created_time).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Họ & tên',
            dataIndex: 'contact_name',
            key: 'contact_name',
            align: 'center',
            width: '10%',
            render: (text, record: any) => text
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Khoá học',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Ghi chú',
            dataIndex: 'content',
            key: 'content',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Chuyển CRM',
            dataIndex: 'change_time',
            key: 'change_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                text ? (
                    <Tag color='green'>Done</Tag>
                ) : (
                    <Tag color='red'>Pending</Tag>
                )
        },
        {
            title: 'Ngày chuyển',
            dataIndex: 'change_time',
            key: 'change_time',
            align: 'center',
            width: '5%',
            render: (text, record: any) =>
                moment(record.change_time).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
            align: 'center',
            width: '15%',
            render: (text, record: any) => (
                <Select
                    defaultValue={record?.department?.id}
                    style={{ width: '100%' }}
                    // onChange={(v) => updateStatus({ id: v }, record)}
                    // allowClear
                    onChange={(v) => {
                        ConfirmModal({
                            content: `Xác nhận chuyển phòng ban?`,
                            onOk: async () => updateStatus({ id: v }, record)
                        })
                    }}
                >
                    {departments?.map((dep) => (
                        <Option value={dep.id} key={dep.id}>
                            {dep.name}
                        </Option>
                    ))}
                </Select>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Department',
            engine: (
                <DebounceSelect
                    style={{ width: '100%' }}
                    placeholder='Department'
                    fetchOptions={loadDepartment}
                    allowClear
                    onChange={onSearchDep}
                />
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='Enter text to search'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchString, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Marketing Inbox Data'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Table
                        loading={isLoading}
                        bordered
                        columns={columns}
                        dataSource={tableData.map((d, i) => ({ key: i, ...d }))}
                        pagination={{
                            defaultCurrent: pageNumber,
                            pageSize,
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
