import { useCallback, useEffect, useReducer, useState } from 'react'
import {
    Table,
    Card,
    notification,
    DatePicker,
    Row,
    Col,
    Tag,
    Button
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import { notify } from 'utils/notify'
import { DATE_FORMAT } from 'const'
import _ from 'lodash'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import DetailTrialModal from './modals/DetailTrialModal'
import SearchUser from 'components/search-user-with-lazy-load'
import TeacherAPI from 'api/TeacherAPI'

const { RangePicker } = DatePicker

const TrialReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            start_time: moment().startOf('month'),
            end_time: moment().endOf('month'),
            teacher_id: ''
        }
    )

    const [visibleModal, setVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const fetchReport = useCallback(
        ({ page_size, page_number, start_time, end_time, teacher_id }) => {
            setValues({ isLoading: true })
            ReportAPI.getTrialTeachersForAcademyReport({
                page_size,
                page_number,
                start_time: start_time.valueOf(),
                end_time: end_time.valueOf(),
                teacher_id
            })
                .then((res) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ data_reports: res.data, total })
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
        fetchReport({ ...values })
    }, [])

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setValues({ page_number: pageNumber, page_size: pageSize })
            fetchReport({
                ...values,
                page_number: pageNumber,
                page_size: pageSize
            })
        },
        [values]
    )

    const handleRangePicker = (value) => {
        if (value[0] && value[1] && value[0] < value[1]) {
            setValues({
                start_time: value[0],
                end_time: value[1]
            })
            fetchReport({
                ...values,
                start_time: value[0],
                end_time: value[1]
            })
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().add(6, 'month'))

    const onDetail = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
        },
        [visibleModal, selectedItem]
    )

    const toggleModal = (val: boolean) => {
        setVisible(val)
    }

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Mã GV',
            dataIndex: 'teacher_id',
            key: 'teacher_id',
            fixed: true,
            width: 100,
            align: 'center',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Tên GV',
            dataIndex: 'full_name',
            key: 'full_name',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'SL Học thử',
            dataIndex: 'trial_student_number',
            key: 'trial_student_number',
            width: 150,
            align: 'center',
            render: (text, record: any) => <Tag color='#f50'>{text}</Tag>
        },
        {
            title: 'SL Học viên',
            dataIndex: 'paid_student_number',
            key: 'paid_student_number',
            align: 'center',
            width: 150,
            render: (text, record) => <Tag color='#108ee9'>{text}</Tag>
        },
        {
            title: 'Tỉ lệ Trial',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 120,
            align: 'center',
            render: (text, record) => {
                const per =
                    record?.trial_student_number &&
                    record?.paid_student_number &&
                    record?.paid_student_number > 0
                        ? _.round(
                              (record?.paid_student_number /
                                  record?.trial_student_number) *
                                  100,
                              2
                          )
                        : 0
                return (
                    <b style={{ color: per >= 50 ? 'green' : 'red' }}>{per}%</b>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record) => (
                <Button
                    type='primary'
                    shape='round'
                    onClick={() => onDetail(record)}
                    title='Detail'
                >
                    Detail
                </Button>
            )
        }
    ]

    const searchDataUser = (data) => {
        if (data.selected) {
            const searchText = data.selected.user_id
            setValues({
                page_number: 1,
                search: '',
                total: 1,
                teacher_id: searchText
            })
            fetchReport({
                ...values,
                page_number: 1,
                search: '',
                total: 1,
                teacher_id: searchText
            })
        }
        if (data.clear) {
            setValues({ page_number: 1, search: '', teacher_id: '' })
            fetchReport({
                ...values,
                page_number: 1,
                search: '',
                teacher_id: ''
            })
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
                ></SearchUser>
            )
        },
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    onChange={handleRangePicker}
                    disabledDate={disabledDateTime}
                    value={[values.start_time, values.end_time]}
                    format={DATE_FORMAT}
                    allowClear={false}
                />
            )
        }
    ]

    return (
        <Card
            title={`BÁO CÁO TỶ LỆ TRIAL THEO GIÁO VIÊN Từ ngày ${values.start_time.format(
                DATE_FORMAT
            )} đến ngày ${values.end_time.format(DATE_FORMAT)}`}
        >
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Row className='mb-4' justify='end' gutter={[10, 10]}>
                <Col span={4}>
                    <RangePicker
                        onChange={handleRangePicker}
                        disabledDate={disabledDateTime}
                        value={[values.start_time, values.end_time]}
                        format={DATE_FORMAT}
                        allowClear={false}
                    />
                </Col>
            </Row>
            <Table
                bordered
                dataSource={values.data_reports}
                columns={columns}
                loading={values.isLoading}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: any) => record?.date}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
            <DetailTrialModal
                data={selectedItem}
                visible={visibleModal}
                toggleModal={toggleModal}
                start_time={values.start_time}
                end_time={values.end_time}
            />
        </Card>
    )
}

export default TrialReport
