import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Card,
    Input,
    DatePicker,
    Select,
    Form,
    notification,
    Button,
    Popconfirm
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { ITeacherSalary } from 'types'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { toReadablePrice } from 'utils'
import moment from 'moment'
import cn from 'classnames'
import { TeacherSalaryCircleStatus } from 'const'
import { useLocations } from 'hooks/useLocation'
import FilterFormDataWrapper, {
    IFilterFormEngine
} from 'components/filter-form-data-wrapper'
import TeacherAPI from 'api/TeacherAPI'
import { Link } from 'react-router-dom'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { exportSalaryXlsx } from 'utils/export-xlsx'
import NameTeacherStudent from 'components/name-teacher-student'

const TeacherSalary = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingExport, setLoadingExport] = useState<boolean>(false)
    const [loadingCaculate, setLoadingCaculate] = useState<boolean>(false)

    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)

    const [filter, setFilter] = useState({
        page_size: 20,
        page_number: 1,
        teacher_id: form.getFieldValue('teacher_id'),
        location_id: form.getFieldValue('location_id'),
        status: form.getFieldValue('status'),
        start_time: moment().startOf('month').valueOf(),
        end_time: moment().endOf('month').valueOf(),
        month: moment().month() + 1,
        year: moment().year(),
        circle: moment().day() < 16 ? 1 : 2,
        month_moment: moment()
    })
    const getSalary = (query) => {
        setLoading(true)
        TeacherAPI.getTeacherSalary(query)
            .then((res) => {
                setData(res.data)
                setTotal(res.pagination.total)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
    }

    const locationsHooks = useLocations()

    const handleChangePagination = (_pageNumber, _pageSize) => {
        setFilter({ ...filter, page_size: _pageSize, page_number: _pageNumber })
        getSalary({ ...filter, page_size: _pageSize, page_number: _pageNumber })
    }
    const handleFormValuesChange = async (changedValues) => {
        const query = { ...filter, ...changedValues }
        if (!query.month_moment) {
            query.month_moment = moment(query.start_time)
        }
        if (!query.circle) {
            query.circle = 1
        }
        query.year = query.month_moment.year()
        query.month = query.month_moment.month() + 1
        setFilter(query)
        getSalary(query)
    }

    const renderLocations = () =>
        locationsHooks.data.map((item, index) => (
            <Select.Option value={item.id} key={index}>
                {item.name}
            </Select.Option>
        ))

    useEffect(() => {
        getSalary(filter)
    }, [])

    const filterFormEngines: IFilterFormEngine[] = [
        {
            label: 'Month',
            name: 'month_moment',
            engine: (
                <DatePicker
                    picker='month'
                    defaultValue={moment(filter.start_time)}
                />
            )
        },
        {
            label: 'Circle',
            name: 'circle',
            engine: (
                <Select
                    allowClear
                    style={{ minWidth: 150, width: 'auto' }}
                    placeholder='Choose circle'
                >
                    <Select.Option value={1} key={1}>
                        First Circle
                    </Select.Option>
                    <Select.Option value={2} key={2}>
                        Second Circle
                    </Select.Option>
                </Select>
            )
        },
        {
            label: 'Location',
            name: 'location_id',
            engine: (
                <Select
                    allowClear
                    style={{ minWidth: 150, width: 'auto' }}
                    placeholder='Filter by location'
                >
                    <Select.Option value=''>All locations</Select.Option>
                    {renderLocations()}
                </Select>
            )
        }
    ]

    const exportExcel = async () => {
        setLoadingExport(true)
        let dataExcel: any = []
        let totalData = -1
        let page_numberExcel = 1
        let check = true
        const page_sizeExcel = 100
        const tempFilter = JSON.parse(JSON.stringify(filter))
        /* eslint-disable no-await-in-loop */
        while (total === -1 || check) {
            const res = await TeacherAPI.getTeacherSalary({
                ...tempFilter,
                page_size: page_sizeExcel,
                page_number: page_numberExcel
            })
            if (res) {
                totalData = res.pagination?.total
                dataExcel = dataExcel.concat(res.data)
                if (page_sizeExcel * page_numberExcel > totalData) {
                    check = false
                }
                page_numberExcel++
            }
        }
        if (dataExcel.length) {
            await exportSalaryXlsx(
                `Salary circle:${filter.circle} ${filter.month}/${filter.year}`,
                dataExcel
            )
        }
        setLoadingExport(false)
        return dataExcel
    }

    const caculateSalary = (id?: number) => {
        setLoadingCaculate(true)
        TeacherAPI.caculateSalary({
            year: filter.year,
            month: filter.month,
            circle: form.getFieldValue('circle'),
            id
        })
            .then((res) => {
                getSalary(filter)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .then(() => {
                setLoadingCaculate(false)
            })
    }

    const columns: ColumnsType<ITeacherSalary> = [
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            width: 250,
            key: 'teacher',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Last Update',
            dataIndex: 'teacher',
            width: 150,
            key: 'teacher',
            render: (text, record: any) => (
                <>
                    <p className='text-danger'>
                        {record?.updated_time &&
                            moment(
                                new Date(record?.updated_time).getTime()
                            ).format('HH:mm:ss DD/MM/YYYY')}
                    </p>
                </>
            )
        },
        {
            title: 'Base salary(A)',
            dataIndex: 'base_salary',
            width: 100,
            key: 'base_salary',
            align: 'right',
            render: (item, record: any) => (
                <>
                    <p>{`${toReadablePrice(item.total_salary)}  ${
                        record.currency
                    }`}</p>
                </>
            )
        },
        {
            title: 'Bonus(B)',
            dataIndex: 'bonus',
            width: 100,
            key: 'bonus',
            align: 'right',
            render: (item, record: any) => (
                <>
                    <p>{`${toReadablePrice(item.total_bonus)}  ${
                        record.currency
                    }`}</p>
                </>
            )
        },
        {
            title: 'Fine(C)',
            dataIndex: 'punish',
            width: 100,
            key: 'punish',
            align: 'right',
            render: (item, record: any) => (
                <>
                    <p>{`${toReadablePrice(item.total_punish)}  ${
                        record.currency
                    }`}</p>
                </>
            )
        },
        {
            title: 'Total(A + B - C)',
            dataIndex: 'total_salary',
            key: 'total_salary',
            width: 150,
            align: 'right',
            fixed: 'right',

            render: (text, record: any) =>
                `${toReadablePrice(text)} ${record.currency}`
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (text, record: any) => {
                return (
                    <div>
                        <Link
                            to={`/teachers/salary-detail?id=${
                                record.teacher_id
                            }&start_time=${filter.start_time}&end_time=${
                                filter.end_time
                            }&month=${filter.month}&year=${
                                filter.year
                            }&circle=${
                                filter.circle
                            }&month_moment=${filter.month_moment.valueOf()}`}
                        >
                            <Button className='w-100 mb-2'>View detail</Button>
                        </Link>
                        {checkPermission(PERMISSIONS.tts_caculate) && (
                            <Popconfirm
                                placement='topLeft'
                                title={` Bạn chắc chắn muốn tính lương cho GV ${record?.teacher?.full_name} - ${record?.teacher?.username} - Circel ${filter.circle} - tháng ${filter.month}?`}
                                onConfirm={() =>
                                    caculateSalary(record.teacher_id)
                                }
                                okText='Chấp nhận'
                                cancelText='Từ chối'
                            >
                                <Button
                                    className='w-100'
                                    loading={loadingCaculate}
                                    type='primary'
                                >
                                    Caculate
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <Card title='Teacher Salary'>
            <FilterFormDataWrapper
                extensionOutWithCondition={[
                    {
                        isDisplayed: checkPermission(
                            PERMISSIONS.tts_export_excel
                        ),
                        engine: (
                            <Button
                                loading={loadingExport}
                                type='primary'
                                onClick={() => exportExcel()}
                            >
                                Export excel
                            </Button>
                        )
                    },
                    {
                        isDisplayed: checkPermission(PERMISSIONS.tts_caculate),
                        engine: (
                            <Popconfirm
                                placement='topLeft'
                                title={` Bạn chắc chắn muốn tính lương cho all teacher - Circel ${filter.circle} - tháng ${filter.month}?`}
                                onConfirm={() => caculateSalary()}
                                okText='Chấp nhận'
                                cancelText='Từ chối'
                            >
                                <Button
                                    loading={loadingCaculate}
                                    type='primary'
                                    className='w-100'
                                >
                                    Caculate Salary
                                </Button>
                            </Popconfirm>
                        )
                    }
                ]}
                configs={{
                    name: 'TeacherSalaryQuery',
                    form,
                    initialValues: filter,
                    onValuesChange: handleFormValuesChange
                }}
                engines={filterFormEngines}
            ></FilterFormDataWrapper>

            <Table
                dataSource={data}
                bordered
                columns={columns}
                pagination={{
                    total,
                    defaultCurrent: filter.page_number,
                    current: filter.page_number,
                    pageSize: filter.page_size,
                    onChange: handleChangePagination
                }}
                loading={loading}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500,
                    y: 600
                }}
                sticky
            />
        </Card>
    )
}

export default TeacherSalary
