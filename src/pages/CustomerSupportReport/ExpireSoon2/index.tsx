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
import { exportExpireSoon } from 'utils/export-xlsx'
import { PERMISSIONS } from 'const/permission'
import { checkPermission } from 'utils/check-permission'
import NameTeacherStudent from 'components/name-teacher-student'

const { RangePicker } = DatePicker
const { Search } = Input

const Report = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isLoadingExcel, setLoadingExcel] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(1)
    const [tableData, setTableData] = useState([])

    const [filter, setFilter] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page_size: 10,
            page_number: 1,
            search_user: '',
            number_lesson_left: 10,
            exprire: '1',
            number_class_greater: 30,
            type: EnumPackageOrderType.PREMIUM,
            staff_id: ''
        }
    )
    const [staffs, setStaffs] = useState([])

    const fetchData = useCallback(
        (query?: {
            page_size: number
            page_number: number
            search_user?: string
            number_lesson_left?: number
            exprire?: number
            number_class_greater?: number
            type?: number
        }) => {
            setLoading(true)
            CustomerSupportReportAPI.getExpireSoonClass(query)
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

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            const temp = {
                ...filter,
                page_size,
                page_number
            }
            setFilter(temp)
            fetchData(temp)
        },
        [filter]
    )

    const onSearchString = useCallback(
        (text) => {
            const temp = {
                ...filter,
                search_user: text
            }
            setFilter(temp)
            fetchData(temp)
        },
        [filter]
    )

    const onSearchRemain = useCallback(
        (s) => {
            if (!s) {
                s = 10
            }
            setFilter({ ...filter, number_lesson_left: s })
            fetchData({ ...filter, number_lesson_left: s })
        },
        [filter]
    )

    const onSearchNumberClass = useCallback(
        (s) => {
            if (!s) {
                s = 30
            }
            setFilter({ ...filter, number_class_greater: s })
            fetchData({ ...filter, number_class_greater: s })
        },
        [filter]
    )

    const columns: ColumnsType = [
        {
            title: 'Mã Order',
            dataIndex: 'order_id',
            key: 'order_id',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Khóa học',
            dataIndex: 'package_name',
            key: 'package_name',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        // {
        //     title: 'Mã HV',
        //     dataIndex: 'user_id',
        //     key: 'user_id',
        //     align: 'center',
        //     width: '5%',
        //     render: (text, record: any) => text
        // },

        {
            title: 'Tên HV',
            dataIndex: 'full_name',
            key: 'full_name',
            align: 'left',
            width: '10%',
            render: (text, record: any) => (
                <Popover
                    content={
                        <>
                            <b>Email:</b> {record.student.email}
                            <br />
                            <b>Phone:</b> {record?.student.phone_number}
                            <br />
                            <b>Skype:</b> {record?.student.skype_account}
                        </>
                    }
                >
                    <NameTeacherStudent
                        data={record?.student}
                        type='student'
                    ></NameTeacherStudent>
                </Popover>
            )
        },
        {
            title: 'Số buổi học còn lại',
            dataIndex: 'number_class',
            key: 'number_class',
            align: 'center',
            width: '5%',
            render: (text, record: any) => text
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expired_date',
            key: 'expired_date',
            align: 'center',
            width: '5%',
            render: (text, record: any) => {
                const hasExpired = moment().isAfter(text)
                return (
                    <span>
                        {moment(text).format('DD/MM/YYYY')}{' '}
                        {hasExpired
                            ? '(đã hết hạn)'
                            : `(còn ${moment(text).diff(
                                  moment(),
                                  'days'
                              )} ngày)`}
                    </span>
                )
            }
        }
    ]

    const renderType = () =>
        TYPE_LABEL.map((e, index) => (
            <Select.Option key={index + 1} value={index + 1}>
                {e}
            </Select.Option>
        ))

    const onChangeType = useCallback(
        (item) => {
            const temp = {
                ...filter,
                page_number: 1,
                type: item
            }
            setFilter(temp)
            fetchData(temp)
        },
        [filter]
    )

    const onChangeExprire = useCallback(
        (item) => {
            const temp = {
                ...filter,
                page_number: 1,
                exprire: item
            }
            setFilter(temp)
            fetchData(temp)
        },
        [filter]
    )

    const onSearchStaff = useCallback(
        (item) => {
            const temp = {
                ...filter,
                page_number: 1,
                staff_id: item
            }
            setFilter(temp)
            fetchData(temp)
        },
        [filter]
    )

    const filterEngines: IFilterEngine[] = [
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
            label: 'Number of lessons left(max)',
            engine: (
                <InputNumber
                    min={0}
                    placeholder='Number lesson'
                    value={filter.number_lesson_left}
                    onChange={_.debounce(onSearchRemain, 250)}
                    defaultValue={filter.number_lesson_left}
                />
            )
        },
        {
            label: 'Number Class(min)',
            engine: (
                <InputNumber
                    min={0}
                    placeholder='Number of orginal class'
                    onChange={_.debounce(onSearchNumberClass, 250)}
                    value={filter.number_class_greater}
                    defaultValue={filter.number_class_greater}
                />
            )
        },
        {
            label: 'Type',
            engine: (
                <Select
                    mode='multiple'
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by type'
                    optionFilterProp='children'
                    value={filter.type}
                    onChange={onChangeType}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Select.Option value=''>All</Select.Option>
                    {renderType()}
                </Select>
            )
        },
        {
            label: 'Exprire',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    optionFilterProp='children'
                    value={filter.exprire}
                    onChange={onChangeExprire}
                >
                    <Select.Option value=''>All</Select.Option>
                    <Select.Option value='1'>Còn Hạn</Select.Option>
                    <Select.Option value='2'>Hết Hạn</Select.Option>
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

    const handleExportExcel = async () => {
        setLoadingExcel(true)
        try {
            const res = await CustomerSupportReportAPI.exportExpireSoonClass(
                filter
            )
            if (res.data) {
                const dataExport = res.data.map((e) => {
                    const hasExpired = moment().isAfter(e.expired_date)
                    let cs = ''
                    if (e.studentObj.staff_id) {
                        const staff = staffs.find(
                            (s) =>
                                Number(s.value) ===
                                Number(e.studentObj.staff_id)
                        )
                        if (staff) {
                            cs = staff.label
                        }
                    }
                    return {
                        id: e.student.id,
                        name: e.student.full_name,
                        username: e.student.username,
                        package_type: EnumPackageOrderType[e.type],
                        package_name: e.package_name,
                        number_class: e.number_class,
                        exprire: `${moment(e.expired_date).format(
                            'DD/MM/YYYY'
                        )} ${
                            hasExpired
                                ? '(đã hết hạn)'
                                : `(còn ${moment(e.expired_date).diff(
                                      moment(),
                                      'days'
                                  )} ngày)`
                        }`,
                        cs
                    }
                })
                await exportExpireSoon(
                    `Expire Soon - ${moment().format('DD/MM/YYYY')}`,
                    dataExport
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
        <Card title='Báo cáo học viên săp hết số buổi'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.csrncr_export_excel) ? (
                        <Button
                            style={{ width: '100%' }}
                            type='primary'
                            onClick={handleExportExcel}
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
