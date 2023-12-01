import React, { useEffect, useState, useCallback } from 'react'
import { Table, Card, Input, Button, Row, Col } from 'antd'
import TeacherAPI from 'api/TeacherAPI'
import { notify } from 'utils/notify'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'

const TeacherReferrals = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [search, setSearch] = useState(null)

    const fetchData = ({ page_size, page_number, _search }) => {
        setLoading(true)
        TeacherAPI.getReferredTeachers({
            page_size,
            page_number,
            search: _search
        })
            .then((res) => {
                setData(res.data)
                setTotal(res.pagination.total)
            })
            .catch((err) => {
                setLoading(false)
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchData({
            page_size: pageSize,
            page_number: pageNumber,
            _search: search
        })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({
                page_size,
                page_number,
                _search: search
            })
        },
        [search]
    )

    const onSearchTeacher = useCallback(
        (s) => {
            setSearch(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                _search: s
            })
        },
        [pageSize, pageNumber]
    )

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Teacher',
            dataIndex: 'user_info',
            key: 'user_info',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Referral',
            dataIndex: 'ref_by_teacher',
            key: 'ref_by_teacher',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Email',
            dataIndex: 'user_info',
            key: 'user_info',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) => text?.email
        },
        {
            title: 'Mobile',
            dataIndex: 'user_info',
            key: 'user_info',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) => text?.phone_number
        },
        {
            title: 'Date Referred',
            dataIndex: 'ref_by_teacher',
            key: 'ref_by_teacher',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) => moment(text?.ref_date).format('HH:mm DD-MM-YYYY')
        },
        {
            title: 'Launch Date',
            dataIndex: 'first_booking',
            key: 'first_booking',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) =>
                text ? moment(text).format('HH:mm DD-MM-YYYY') : null
        },
        {
            title: 'File(CV)',
            dataIndex: 'cv',
            key: 'cv',
            fixed: 'left',
            width: 60,
            align: 'center',
            render: (text) =>
                text ? (
                    <a href={text} target='_blank' rel='noreferrer'>
                        <Button size='small' type='primary'>
                            View
                        </Button>
                    </a>
                ) : null
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <Input.Search
                    placeholder='Search'
                    onSearch={onSearchTeacher}
                    allowClear
                />
            )
        }
    ]

    return (
        <Card title='Teacher Referral'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                dataSource={data.map((d, i) => ({ key: i, ...d }))}
                columns={columns}
                loading={loading}
                bordered
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
            />
        </Card>
    )
}

export default TeacherReferrals
