import { useCallback, useEffect, useState } from 'react'
import { notify } from 'utils/notify'
import { Table, Card, Tag, Select, notification, DatePicker } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { blue } from '@ant-design/colors'
import moment from 'moment'
import _ from 'lodash'
import { EnumTeacherAbsentRequestStatus, IAbsentRequest } from 'types'
import { FULL_DATE_FORMAT } from 'const'
import { ColumnsType } from 'antd/lib/table'
import { useAbsentRequest } from 'hooks/useAbsentRequest'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import AbsentRequestModal from './modal'
import Search from 'antd/lib/input/Search'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'
import { DEPARTMENT } from 'const/department'
import AdministratorAPI from 'api/AdministratorAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'

const { Option } = Select
const queryUrl = new URLSearchParams(window.location.search)

const AbsentRequest = () => {
    const {
        isLoading,
        data: absentRequests,
        total,
        isFetching,
        error,
        refetch,
        pageSize,
        setPageSize,
        pageNumber,
        setPageNumber,
        status,
        setStatus,
        search,
        setSearch,
        staff_id,
        setStaffId,
        setDate
    } = useAbsentRequest()
    const [staffs, setStaffs] = useState([])
    const [visible, setVisible] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<IAbsentRequest>(null)

    const toggleModal = useCallback(
        (val: boolean, item?: IAbsentRequest) => {
            setVisible(val)
            setSelectedItem(item)
        },
        [visible, selectedItem]
    )

    const fetchAdminOptions = useCallback(async (searchData) => {
        // if (_.isEmpty(data) || !idDepartment) return []
        const res = await AdministratorAPI.getAllAdministrators({
            searchData,
            idDepartment: DEPARTMENT.hocthuat.id
        })
        return res.data.map((i) => ({
            label: i.fullname,
            value: i.id
        }))
    }, [])

    const colorStatus = (_status: number) => {
        switch (_status) {
            case EnumTeacherAbsentRequestStatus.APPROVED:
                return 'success'
            case EnumTeacherAbsentRequestStatus.PENDING:
                return 'warning'
            case EnumTeacherAbsentRequestStatus.REJECT_BY_ADMIN:
                return 'error'
            case EnumTeacherAbsentRequestStatus.WITHDRAWN_BY_TEACHER:
                return 'processing'
            default:
                break
        }
    }
    const columns: ColumnsType<IAbsentRequest> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 80,
            align: 'center'
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            fixed: 'left',
            width: 200,
            align: 'center',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text?.user}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Time',
            dataIndex: 'start_time',
            key: 'start_time',
            align: 'center',
            width: 300,
            render: (text, record) => (
                <span>
                    <strong>From:</strong>{' '}
                    {moment(text).format(FULL_DATE_FORMAT)}
                    <strong> - To: </strong>
                    {moment(record.end_time).format(FULL_DATE_FORMAT)}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 200,
            render: (text: any, record: any) => (
                <Tag color={colorStatus(text)}>
                    {_.startCase(EnumTeacherAbsentRequestStatus[text])}
                </Tag>
            )
        },
        {
            title: 'Teacher note',
            dataIndex: 'teacher_note',
            key: 'teacher_note',
            align: 'center',
            width: 250
        },
        {
            title: 'Note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            width: 250
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 200,
            render: (text) => moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 80,
            fixed: 'right',
            render: (text, record) =>
                checkPermission(PERMISSIONS.tlr_update) && (
                    <EditOutlined
                        style={{ color: blue.primary }}
                        type='button'
                        onClick={() => toggleModal(true, record)}
                        title='Edit'
                    />
                )
        }
    ]

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (_pageNumber !== pageNumber) {
                setPageNumber(_pageNumber)
            }
            if (_pageSize !== pageSize) {
                setPageSize(_pageSize)
            }

            // refetch()
        },
        [pageSize, pageNumber]
    )
    const onChangeSearch = (val) => {
        setSearch(val)
        setPageNumber(1)
        // refetch()
    }

    const onChangeStatus = (val) => {
        setStatus(val)
        setPageNumber(1)
        // refetch()
    }

    const onChangeStaff = (val) => {
        setStaffId(val)
        setPageNumber(1)
    }

    const onChangeDate = (v) => {
        const time = moment(v).valueOf()
        setDate(time)
        setPageNumber(1)
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={status}
                    onChange={onChangeStatus}
                >
                    <Option value={null} key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(EnumTeacherAbsentRequestStatus)
                        .filter(
                            (key: any) =>
                                !isNaN(
                                    Number(EnumTeacherAbsentRequestStatus[key])
                                )
                        )
                        .map((key: any) => (
                            <Option
                                value={EnumTeacherAbsentRequestStatus[key]}
                                key={EnumTeacherAbsentRequestStatus[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Staff',
            engine: (
                // <Select
                //     defaultValue={staff_id}
                //     style={{ width: '100%' }}
                //     onChange={_.debounce(onChangeStaff, 250)}
                // >
                //     <Select.Option value=''>All</Select.Option>
                //     {staffs.map((item, index) => (
                //         <Select.Option
                //             key={`staff_id${index}`}
                //             value={item.value}
                //         >
                //             {_.capitalize(item.label)}
                //         </Select.Option>
                //     ))}
                // </Select>
                <DebounceSelect
                    placeholder='Choose staff'
                    fetchOptions={fetchAdminOptions}
                    allowClear
                    onChange={_.debounce(onChangeStaff, 250)}
                />
            )
        },
        {
            label: 'Time',
            engine: (
                <DatePicker
                    format='DD-MM-YYYY'
                    allowClear
                    onChange={onChangeDate}
                />
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , username'
                    defaultValue={search}
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onChangeSearch, 250)}
                />
            )
        }
    ]

    if (error) notify('error', error.message)
    return (
        <Card title='Leave/Absent Request Management'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                dataSource={absentRequests}
                columns={columns}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                loading={isLoading || isFetching}
                scroll={{ x: 500, y: 768 }}
                bordered
                sticky
            />
            <AbsentRequestModal
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetch}
                visible={visible}
            />
        </Card>
    )
}

export default AbsentRequest
