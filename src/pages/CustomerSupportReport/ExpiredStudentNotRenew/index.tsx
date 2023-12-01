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
    Spin
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
import { handlerExportExcel } from 'utils/export-xlsx'
import { PERMISSIONS } from 'const/permission'
import { checkPermission } from 'utils/check-permission'
import NameTeacherStudent from 'components/name-teacher-student'

const { RangePicker } = DatePicker
const { Search } = Input

const ExpiredStudentNotRenew = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isLoadingExcel, setLoadingExcel] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(1)
    const [numberClass, setNumberClass] = useState<any>(null)
    const [tableData, setTableData] = useState([])

    const [minStartTime, setMinStartTime] = useState(
        moment().subtract(1, 'month').startOf('month').valueOf()
    )
    const [maxEndTime, setMaxEndTime] = useState(
        moment().subtract(1, 'month').endOf('month').valueOf()
    )
    const [filter, setFilter] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page_size: 10,
            page_number: 1,
            search_user: '',
            number_class: null,
            min_start_time: moment()
                .subtract(1, 'month')
                .startOf('month')
                .valueOf(),
            max_end_time: moment().subtract(1, 'month').endOf('month').valueOf()
        }
    )
    const [staffs, setStaffs] = useState([])

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search_user?: string
            min_start_time?: number
            max_end_time?: number
            number_class?: any
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.getExpireStudentNotRenew(query)
                .then((res) => {
                    setTableData(res?.data)
                    setTotal(res?.pagination[0]?.total)
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
        // fetchAdminOptions('', DEPARTMENT.phongcskh.id)
    }, [])

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

    const onChangeNumberClass = useCallback(
        (item) => {
            setNumberClass(item)
        },
        [numberClass]
    )

    const filterNumberClass = () => {
        setFilter({ ...filter, number_class: numberClass })
        fetchData({
            ...filter,
            number_class: numberClass
        })
    }

    const onSearchString = useCallback(
        (s) => {
            setFilter({ ...filter, search_user: s })
            fetchData({
                ...filter,
                search_user: s
            })
        },
        [filter]
    )

    const handleRangePicker = useCallback(
        (value) => {
            if (value[0] && value[1] && value[0] < value[1]) {
                setMinStartTime(value[0].startOf('day').valueOf())
                setMaxEndTime(value[1].endOf('day').valueOf())

                setFilter({
                    ...filter,
                    min_start_time: value[0].startOf('day').valueOf(),
                    max_end_time: value[1].endOf('day').valueOf()
                })

                fetchData({
                    ...filter,
                    min_start_time: value[0].startOf('day').valueOf(),
                    max_end_time: value[1].endOf('day').valueOf()
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
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 60,
            render: (text, record: any) => text
        },
        {
            title: 'Tên HV',
            dataIndex: 'full_name',
            key: 'full_name',
            align: 'left',
            width: 250,
            render: (text, record: any) => (
                <NameTeacherStudent
                    data={record}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'SĐT',
            dataIndex: 'phone_number',
            key: 'phone_number',
            align: 'center',
            width: 150,
            render: (text, record: any) => text
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'left',
            width: 150,
            render: (text, record: any) => text
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            align: 'center',
            width: 150,
            render: (text, record: any) => {
                return <>{moment(text).format('DD/MM/YYYY')}</>
            }
        },
        {
            title: 'Ngày hết hạn gói',
            dataIndex: 'ordered_package',
            key: 'expired_date',
            align: 'center',
            width: 150,
            render: (text, record: any) => {
                if (text)
                    return (
                        <>{moment(text?.expired_date).format('DD/MM/YYYY')}</>
                    )
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

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    allowClear={false}
                    onChange={handleRangePicker}
                    value={[moment(minStartTime), moment(maxEndTime)]}
                />
            )
        },
        // {
        //     label: 'Staff',
        //     engine: (
        //         <Select
        //             defaultValue={filter.staff_id}
        //             style={{ width: '100%' }}
        //             onChange={_.debounce(onSearchStaff, 250)}
        //         >
        //             <Select.Option value=''>All</Select.Option>
        //             {staffs.map((item, index) => (
        //                 <Select.Option
        //                     key={`staff_id${index}`}
        //                     value={item.value}
        //                 >
        //                     {_.capitalize(item.label)}
        //                 </Select.Option>
        //             ))}
        //         </Select>
        //     )
        // },
        {
            label: 'Số buổi còn lại',
            engine: (
                <>
                    <InputNumber
                        style={{ width: '50%' }}
                        placeholder='score'
                        min='0'
                        max='500'
                        onChange={_.debounce(onChangeNumberClass, 250)}
                    />
                    <Button
                        style={{ marginLeft: 15 }}
                        type='primary'
                        onClick={filterNumberClass}
                    >
                        Filter
                    </Button>
                </>
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

    const handleExport = async () => {
        setLoadingExcel(true)
        try {
            filter.page_number = 1
            filter.page_size = 10000
            console.log(filter)
            const res = await CustomerSupportReportAPI.getExpireStudentNotRenew(
                filter
            )
            if (res.data) {
                const exportData = []
                // eslint-disable-next-line array-callback-return
                await res.data.map((e: any) => {
                    exportData.push([
                        e.id,
                        e.full_name,
                        e.username,
                        e.phone_number,
                        e.email,
                        e.date_of_birth
                            ? `${moment(e.date_of_birth).format('DD/MM/YYYY')}`
                            : '',
                        e.ordered_package.expired_date
                            ? `${moment(e.ordered_package.expired_date).format(
                                  'DD/MM/YYYY'
                              )}`
                            : ''
                    ])
                })
                const columnTitle = [
                    'ID',
                    'Tên HV',
                    'Username',
                    'SĐT',
                    'Email',
                    'Ngày sinh',
                    'Ngày hết hạn gói gần nhất'
                ]
                await handlerExportExcel(
                    `ExpiredStudentNotRenew_${moment().format(
                        'HH_mm_ss_DD_MM_YYYY'
                    )}`,
                    exportData,
                    columnTitle
                )
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setLoadingExcel(false)
    }

    return (
        <Card title='Danh sách học viên hết hạn không renew'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.csrles_export_excel) ? (
                        <Button
                            style={{ width: '100%' }}
                            type='primary'
                            onClick={handleExport}
                            disabled={isLoadingExcel}
                        >
                            <Spin
                                size='small'
                                className='mr-2'
                                spinning={isLoadingExcel}
                            />
                            Export Excel
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Table
                        loading={isLoading}
                        bordered
                        columns={columns}
                        dataSource={tableData}
                        pagination={{
                            // eslint-disable-next-line @typescript-eslint/no-shadow
                            showTotal: (totalData, range) => (
                                <div>
                                    Showing {range[0]}-{range[1]} of {totalData}
                                </div>
                            ),
                            showSizeChanger: true,
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

export default ExpiredStudentNotRenew
