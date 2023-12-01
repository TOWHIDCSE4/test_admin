import { useCallback, useEffect, FC, useState } from 'react'
import TeacherAPI from 'api/TeacherAPI'
import { Table, Card, Avatar, Space, Input, notification } from 'antd'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import { getTimestampInWeekToLocal, formatTimestamp } from 'utils/datetime'
import moment from 'moment'
import { ITeacherLevel } from 'types/ITeacherLevel'
import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { ColumnsType } from 'antd/lib/table'
import { ITeacher } from 'types'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ReviewTeacherModal from './modals/ReviewTeacherModal'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import SearchUser from 'components/search-user-with-lazy-load'
import NameTeacherStudent from 'components/name-teacher-student'

const PendingRegister: FC = () => {
    const [pendingTeachers, setPendingTeachers] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [search, setSearch] = useState('')
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisibleModal] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState(null)
    const [teacherLevels, setTeacherLevels] = useState<ITeacherLevel[]>([])

    const getPendingTeachers = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            setLoading(true)
            TeacherAPI.getPendingTeachers(query)
                .then((res) => {
                    setPendingTeachers(res.data)
                    if (res.pagination && res.pagination.total > 0) {
                        setTotal(res.pagination.total)
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
        },
        [pendingTeachers, total, pageSize, pageNumber]
    )

    const getTeacherLevels = () => {
        TeacherLevelAPI.getTeacherLevels({})
            .then((res) => {
                setTeacherLevels(res.data)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    useEffect(() => {
        getPendingTeachers({
            page_size: pageSize,
            page_number: pageNumber
        })
        getTeacherLevels()
    }, [])

    const toggleModal = useCallback(
        (value: boolean, selected?: any) => {
            setVisibleModal(value)
            setSelectedTeacher(selected)
        },
        [selectedTeacher, visibleModal]
    )

    const refetchData = useCallback(() => {
        getPendingTeachers({
            page_number: pageNumber,
            page_size: pageSize
        })
    }, [pageSize, pageNumber])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (_pageNumber !== pageNumber) {
                setPageNumber(_pageNumber)
                getPendingTeachers({
                    page_number: _pageNumber,
                    page_size: pageSize
                })
            }
            if (_pageSize !== pageSize) {
                setPageSize(_pageSize)
                getPendingTeachers({
                    page_number: pageNumber,
                    page_size: _pageSize
                })
            }
        },
        [pageSize, pageNumber]
    )
    const columns: ColumnsType<ITeacher> = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record) => (
                <Avatar
                    size='large'
                    src={text}
                    icon={<UserOutlined />}
                    onError={() => true}
                />
            )
        },
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text, record) => (
                <NameTeacherStudent
                    data={record?.user}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone_number',
            key: 'phone_number',
            render: (text, record) =>
                `${
                    record && record.user && record.user.phone_number
                        ? record.user.phone_number
                        : ''
                }`
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => `${record?.user?.email}`
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (text, record) => text?.name
        },
        {
            title: 'Regular Time',
            dataIndex: 'user',
            key: 'user',
            render: (text, record) => (
                <ul>
                    {record &&
                        record.user &&
                        record.user.regular_times &&
                        record.user.regular_times.map((x, _index) => {
                            const convertToLocal = getTimestampInWeekToLocal(x)
                            return (
                                <li key={_index}>
                                    {formatTimestamp(convertToLocal)}
                                </li>
                            )
                        })}
                </ul>
            )
        },
        {
            title: 'Teacher Level',
            dataIndex: 'level',
            key: 'level',
            render: (text, record) => `${record?.level?.name}`
        },
        {
            title: 'Hourly Rate',
            dataIndex: 'hourly_rate',
            key: 'hourly_rate'
        },
        {
            title: 'Register time',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (text, record) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) =>
                (checkPermission(PERMISSIONS.tpr_reject) ||
                    checkPermission(PERMISSIONS.tpr_approve)) && (
                    <EditOutlined
                        type='button'
                        onClick={() => toggleModal(true, record)}
                        title='View/Review pending teacher'
                    />
                )
        }
    ]

    const searchDataUser = (data) => {
        if (data.selected) {
            const searchText =
                data.selected.user.username || data.selected.user.full_name
            setPageNumber(1)
            setTotal(1)
            setSearch('')
            getPendingTeachers({
                page_size: pageSize,
                page_number: 1,
                search: searchText
            })
        }
        if (data.clear) {
            setSearch('')
            setPageNumber(1)
            getPendingTeachers({
                page_size: pageSize,
                page_number: 1
            })
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Choose Teacher',
            engine: (
                <SearchUser
                    api={TeacherAPI.getPendingTeachers}
                    placeholder='Search by teacher'
                    searchDataUser={searchDataUser}
                ></SearchUser>
            )
        }
    ]

    return (
        <Card title='Pending Register Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                dataSource={pendingTeachers}
                columns={columns}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                loading={isLoading}
                scroll={{ x: 500 }}
                bordered
            />
            <ReviewTeacherModal
                visible={visibleModal}
                toggleModal={toggleModal}
                refetchData={refetchData}
                data={selectedTeacher}
                teacherLevels={teacherLevels}
            />
        </Card>
    )
}

export default PendingRegister
