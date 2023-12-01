import { Button, notification, Select, Spin } from 'antd'
import _ from 'lodash'
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useReducer
} from 'react'

const { Option } = Select

interface filterOption {
    api: any
    searchDataUser: any
    placeholder: string
    filter?: any
    ref?: any
}
const Search = forwardRef(
    ({ api, searchDataUser, placeholder, filter }: filterOption, ref) => {
        const [values, setValues] = useReducer(
            (state, newState) => ({ ...state, ...newState }),
            {
                data: [],
                isLoading: false,
                page_size: 20,
                page_number: 1,
                status: null,
                total: 0,
                search: ''
            }
        )

        const getAllData = useCallback(
            ({ page_size, page_number, search, status, location_id }) => {
                setValues({
                    isLoading: true,
                    page_size,
                    page_number,
                    search,
                    status,
                    location_id
                })
                api({
                    page_size,
                    page_number,
                    search,
                    status,
                    location_id
                })
                    .then((res) => {
                        let { total } = values
                        if (res.pagination && res.pagination.total >= 0) {
                            total = res.pagination.total
                        }
                        let resData = []
                        if (page_number === 1) {
                            resData = res.data
                        } else {
                            resData = values.data.concat(res.data)
                        }
                        setValues({ data: resData, total })
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
            console.log('filter', filter)
            getAllData({ ...values, ...filter })
        }, [])

        const loadMore = (event) => {
            const { target } = event
            if (
                !values.isLoading &&
                target.scrollTop + target.offsetHeight === target.scrollHeight
            ) {
                const page_number = values.page_number + 1
                const maxPage = values.total / values.page_size + 1
                if (page_number <= maxPage) {
                    setValues({ page_number })
                    getAllData({ ...values, page_number })
                }
            }
        }

        const onSearch = (value: string) => {
            const page_number = 1
            setValues({ page_number, search: value.trim() })
            getAllData({
                page_size: values.page_size,
                page_number,
                status: values.status,
                search: value.trim()
            })
        }

        const onClearTeacher = () => {
            const page_number = 1
            setValues({ page_number, search: '', isLoading: false })
            getAllData({ ...values, page_number, search: '' })
            searchDataUser({ clear: true })
        }
        const renderSelect = () => {
            return values.data.map((item, index) => {
                const tempUser = item.user_info || item.user || item
                return (
                    <Option key={index} value={item.user_id || item.id}>
                        {`${tempUser.full_name} - ${tempUser.username}`}
                    </Option>
                )
            })
        }

        const onSelect = (val) => {
            const selected = values.data.find(
                (e) => e.user_id === val || e.id === val
            )
            if (selected) {
                setValues({ search: val })
                searchDataUser({
                    selected
                })
            }
        }
        useImperativeHandle(ref, () => ({
            setValuesChild(v) {
                console.log('setValuesChild', v)
                getAllData({ ...values, ...v })
            }
        }))
        return (
            <Select
                className='w-100'
                placeholder={placeholder}
                showSearch
                filterOption={false}
                loading={values.isLoading}
                onPopupScroll={loadMore}
                onSearch={_.debounce((val) => onSearch(val), 300)}
                onClear={onClearTeacher}
                allowClear
                onSelect={onSelect}
                value={values.search}
            >
                {renderSelect()}
            </Select>
        )
    }
)
export default Search
