import { useEffect, useCallback, FC, useState, useReducer } from 'react'
import { Table, Card, Select, DatePicker, Input } from 'antd'

import _ from 'lodash'
import { notify } from 'utils/notify'
import { EnumCommentType, ICommentSuggestion } from 'types'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import AdministratorAPI from 'api/AdministratorAPI'
import LogAPI from 'api/LogAPI'
import ReactJson from 'react-json-view'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const CommentSuggestion: FC = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,

            total: 0,
            data: []
        }
    )
    const [queryParams, setQueryParams] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page_size: 10,
            page_number: 1,
            search: '',
            searchBody: '',
            method: '',
            url: '',
            staff_id: '',
            min_start_time: moment().startOf('month'),
            max_end_time: moment().endOf('month')
        }
    )
    const [staffs, setStaffs] = useState([])
    const [listApi, setListApi] = useState([])

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
            notify('error', error.message)
        }
    }

    const fetchListApi = async () => {
        try {
            const res = await LogAPI.getListApi()
            if (res.data) {
                setListApi(res.data)
            }
        } catch (error) {
            notify('error', error.message)
        }
    }

    const fetchLog = async (props: any) => {
        setValues({ isLoading: true })
        try {
            const params = {
                ...props
            }
            params.max_end_time = params.max_end_time.valueOf()
            params.min_start_time = params.min_start_time.valueOf()
            const res = await LogAPI.get(params)
            if (res.data) {
                let total = 0
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ data: res.data, total })
            }
        } catch (error) {
            notify('error', error.message)
        }
        setValues({ isLoading: false })
    }

    const disabledDateTime = (current) =>
        current &&
        (current < moment().subtract(6, 'month') ||
            current > moment().add(6, 'month'))

    const handleRangePicker = (value) => {
        if (value[0] && value[1] && value[0] <= value[1]) {
            const temp = {
                ...queryParams,
                min_start_time: value[0],
                max_end_time: value[1],
                page_number: 1
            }
            setQueryParams(temp)
            fetchLog(temp)
        } else {
            notify('error', 'Date time invalid')
        }
    }

    const onSearchStaff = (value) => {
        const temp = {
            ...queryParams,
            staff_id: value,
            page_number: 1
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const onSearch = (val) => {
        const temp = {
            ...queryParams,
            search: val,
            page_number: 1
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const onSearchBody = (val) => {
        const temp = {
            ...queryParams,
            searchBody: val,
            page_number: 1
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const onSearchMethod = (val) => {
        const temp = {
            ...queryParams,
            page_number: 1,
            method: val
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const onSearchURL = (val) => {
        const temp = {
            ...queryParams,
            page_number: 1,
            url: val
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const handleChangePagination = (page_number, page_size) => {
        const temp = {
            ...queryParams,
            page_number,
            page_size
        }
        setQueryParams(temp)
        fetchLog(temp)
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Date time',
            engine: (
                <RangePicker
                    allowClear={false}
                    showTime={{ format: 'HH:mm' }}
                    format='YYYY-MM-DD HH:mm'
                    onChange={handleRangePicker}
                    disabledDate={disabledDateTime}
                    value={[
                        queryParams.min_start_time,
                        queryParams.max_end_time
                    ]}
                />
            )
        },
        {
            label: 'Method',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    value={queryParams.method}
                    onChange={(val) => {
                        onSearchMethod(val)
                    }}
                >
                    <Option value=''>ALL TYPE</Option>
                    <Option value='GET'>GET</Option>
                    <Option value='POST'>POST</Option>
                    <Option value='PUT'>PUT</Option>
                    <Option value='DELETE'>DELETE</Option>
                </Select>
            )
        },
        {
            label: 'URL',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    value={queryParams.url}
                    onChange={(val) => onSearchURL(val)}
                >
                    <Option value=''>ALL</Option>
                    {listApi.map((e: any, index) => (
                        <Option value={e} key={index}>
                            {e}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Staff',
            engine: (
                <Select
                    defaultValue={queryParams.staff_id}
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
            label: 'Search',
            engine: (
                <Search
                    defaultValue={queryParams.search}
                    placeholder='Fulltext search'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        },
        {
            label: 'Search body data',
            engine: (
                <Search
                    defaultValue={queryParams.searchBody}
                    placeholder='search by student Id, teacher Id'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchBody, 250)}
                />
            )
        }
    ]

    const columns: ColumnsType<ICommentSuggestion> = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 100,

            render: (text, record) => text?.username || ''
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            width: 300,

            render: (text, record: any) => {
                return (
                    <>
                        <p>
                            Time:{' '}
                            {moment(record?.created_time).format(
                                'HH:mm DD/MM/YYYY'
                            )}
                        </p>
                        <p>URL: {record?.original_url}</p>
                        <p>METHOD: {record?.method}</p>
                        <p>CODE: {record?.code}</p>
                    </>
                )
            }
        },

        {
            title: 'Params',
            dataIndex: 'params_data',
            key: 'params_data',
            width: 300,
            render: (text, record) => (
                <ReactJson
                    src={text}
                    enableClipboard={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed={1}
                />
            )
        },
        {
            title: 'Body',
            dataIndex: 'body_data',
            key: 'body_data',
            width: 300,
            render: (text, record) => (
                <ReactJson
                    src={text}
                    enableClipboard={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed={1}
                />
            )
        },
        {
            title: 'Data Change',
            dataIndex: 'change_data',
            key: 'change_data',
            width: 300,
            render: (text, record) => (
                <ReactJson
                    src={text}
                    enableClipboard={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed={1}
                />
            )
        }
    ]

    useEffect(() => {
        fetchAdminOptions('', '')
        fetchListApi()
        fetchLog(queryParams)
    }, [])

    return (
        <Card title='Logs Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>
            <Table
                scroll={{
                    x: 500,
                    y: 768
                }}
                dataSource={values.data}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record.id}
                loading={values.isLoading}
            />
        </Card>
    )
}

export default CommentSuggestion
