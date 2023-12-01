import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Card,
    Input,
    DatePicker,
    Select,
    Form,
    notification,
    Button
} from 'antd'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { toReadablePrice } from 'utils'
import moment from 'moment'
import FilterFormDataWrapper, {
    IFilterFormEngine
} from 'components/filter-form-data-wrapper'
import TeacherAPI from 'api/TeacherAPI'
import TabParameter from './TabParameter'

const TeacherSalary = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(null)
    const teacher_id = queryUrl.get('id')

    const [filter, setFilter] = useState({
        page_size: 1,
        page_number: 1,
        teacher_id,
        start_time: queryUrl.get('start_time')
            ? moment(queryUrl.get('start_time')).startOf('month').valueOf()
            : moment().startOf('month').valueOf(),
        end_time: queryUrl.get('end_time')
            ? moment(queryUrl.get('end_time')).endOf('month').valueOf()
            : moment().endOf('month').valueOf(),
        month: queryUrl.get('month') || moment().month() + 1,
        year: queryUrl.get('year') || moment().year(),
        circle: Number(queryUrl.get('circle')) || 1,
        month_moment: moment(Number(queryUrl.get('month_moment'))) || moment()
    })

    const getSalary = (query) => {
        setLoading(true)
        TeacherAPI.getTeacherSalary(query)
            .then((res) => {
                setData(res.data[0])
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
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

    useEffect(() => {
        if (teacher_id) {
            getSalary(filter)
        }
    }, [])

    const filterFormEngines: IFilterFormEngine[] = [
        {
            label: 'Month',
            name: 'month_moment',
            engine: <DatePicker picker='month' />
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
        }
    ]

    return (
        <Card
            title={`Detail salary for teacher : ${data?.teacher?.full_name} - ${data?.teacher?.username}`}
        >
            <FilterFormDataWrapper
                extensionOut={[]}
                extensionOutWithCondition={[]}
                configs={{
                    name: 'TeacherSalaryQuery',
                    form,
                    initialValues: filter,
                    onValuesChange: handleFormValuesChange
                }}
                engines={filterFormEngines}
            ></FilterFormDataWrapper>
            {data ? <TabParameter data={data} /> : <>No data</>}
        </Card>
    )
}

export default TeacherSalary
