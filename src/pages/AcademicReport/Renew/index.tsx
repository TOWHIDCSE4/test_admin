import { useCallback, useEffect, useReducer } from 'react'
import {
    Table,
    Card,
    notification,
    Popover,
    Select,
    Tag,
    Space,
    DatePicker,
    Button
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import _ from 'lodash'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import moment from 'moment'
import { FULL_DATE_FORMAT } from 'const'
import ReportAPI from 'api/ReportAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import SearchUser from 'components/search-user-with-lazy-load'
import TeacherAPI from 'api/TeacherAPI'
import NameTeacherStudent from 'components/name-teacher-student'
import { toReadablePrice } from 'utils'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { exportAcademicRenewExcel } from 'utils/export-xlsx'

const UI = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            dataRaw: [],
            isLoading: false,
            search: '',
            preMonth: moment().subtract(1, 'month'),
            time: moment()
        }
    )

    const getAcademicRenewReport = useCallback(
        ({ time }) => {
            setValues({ isLoading: true })
            ReportAPI.getAcademicRenewReport({
                time
            })
                .then((res) => {
                    setValues({ data: res, dataRaw: res })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    useEffect(() => {
        getAcademicRenewReport({})
    }, [])

    const handleRangePicker = useCallback((value) => {
        if (value) {
            setValues({
                preMonth: value.clone().subtract(1, 'month'),
                time: value
            })
            getAcademicRenewReport({ time: value.valueOf() })
        }
    }, [])

    const columns: ColumnsType<ITeacher> = [
        {
            title: 'Mã GV',
            dataIndex: 'teacher',
            key: 'teacher',
            fixed: true,
            width: 80,
            align: 'center',
            render: (text, record) => record?.teacher?.id
        },
        {
            title: 'Tên GV',
            dataIndex: 'teacher',
            key: 'teacher',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: ITeacher) => (
                <NameTeacherStudent
                    data={record?.teacher}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: `Trial tháng ${values.preMonth.month() + 1}`,
            children: [
                {
                    title: 'HV học trial',
                    dataIndex: 'trial_student',
                    key: 'trial_student',
                    width: 80,
                    align: 'center',
                    render: (text, record: any) => record.total_trial_student
                },
                {
                    title: 'HV đăng ký sau học trial',
                    dataIndex: 'list_order_after_trial',
                    key: 'list_order_after_trial',
                    width: 80,
                    align: 'center',
                    render: (text, record: any) =>
                        record.total_order_after_trial
                },
                {
                    title: 'Tỉ lệ',
                    dataIndex: 'rate',
                    key: 'rate',
                    width: 80,
                    align: 'center',
                    render: (text, record: ITeacher) => toReadablePrice(text)
                }
            ]
        },
        {
            title: `Xét Promotion tháng ${values.time.month() + 1}`,
            children: [
                {
                    title: `Tổng số lớp đã dạy (${values.preMonth
                        .clone()
                        .startOf('month')
                        .format('DD/MM')} - ${values.time
                        .clone()
                        .endOf('month')
                        .format('DD/MM')}
                        )`,
                    dataIndex: 'total_done',
                    key: 'total_done',
                    width: 120,
                    align: 'center',
                    render: (text, record: any) => record.total_done
                },
                {
                    title: `Tổng số lớp absent (${values.preMonth
                        .clone()
                        .startOf('month')
                        .format('DD/MM')} - ${values.time
                        .clone()
                        .endOf('month')
                        .format('DD/MM')}
                        )`,
                    dataIndex: 'total_absent',
                    key: 'total_absent',
                    width: 120,
                    align: 'center',
                    render: (text, record: any) => record.total_absent
                }
            ]
        }
    ]

    const searchDataUser = (data) => {
        if (data.selected) {
            const searchText =
                data.selected.user.username || data.selected.user.full_name
            const teacher = values.dataRaw.find(
                (e) => e.teacher.username === searchText
            )
            setValues({ data: [teacher] })
        }
        if (data.clear) {
            setValues({ data: values.dataRaw })
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Choose Teacher',
            engine: (
                <SearchUser
                    api={TeacherAPI.getAllTeachers}
                    placeholder='Search by teacher'
                    searchDataUser={searchDataUser}
                    filter={{ status: 'active' }}
                ></SearchUser>
            )
        },
        {
            label: 'Choose Month',
            engine: (
                <DatePicker
                    allowClear={false}
                    picker='month'
                    onChange={handleRangePicker}
                    defaultValue={moment()}
                />
            )
        }
    ]
    const exportExcel = async () => {
        await exportAcademicRenewExcel(
            `Academic-Renew-${moment().format('DD-MM-YYYY')}`,
            values.dataRaw,
            values.preMonth.clone(),
            values.time.clone()
        )
    }

    return (
        <Card title='BÁO CÁO RENEW'>
            <FilterDataWrapper
                engines={filterEngines}
                extensionOut={[
                    checkPermission(PERMISSIONS.arrn_export_excel) ? (
                        <Button type='primary' onClick={() => exportExcel()}>
                            Export Excel
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={values.data}
                columns={columns}
                loading={values.isLoading}
                rowKey={(record: ITeacher) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
        </Card>
    )
}

export default UI
