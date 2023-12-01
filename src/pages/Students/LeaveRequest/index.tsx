import {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
import { notify } from 'utils/notify'
import {
    Table,
    Card,
    Tag,
    Select,
    Button,
    Space,
    Modal,
    notification
} from 'antd'
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    SettingOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import moment from 'moment'
import _ from 'lodash'
import { EnumStudentLeaveRequestSource, IStudentLeaveRequest } from 'types'
import { FULL_DATE_FORMAT, MODAL_TYPE } from 'const'
import { ColumnsType } from 'antd/lib/table'
import { useAbsentRequest } from 'hooks/useAbsentRequest'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import CreateLeaveRequestModal from './modal'
import ScreenSettingModal from './modal-setting'
import Search from 'antd/lib/input/Search'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'
import StudentLeaveRequestAPI from 'api/StudentLeaveRequestAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'

const { Option } = Select
const queryUrl = new URLSearchParams(window.location.search)

const StudentLeaveRequest: FunctionComponent = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const [visibleSetting, setVisibleSetting] = useState<boolean>(false)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            student_id: queryUrl.get('student_id') || '',
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null
        }
    )

    const getAllStudentLeaveRequest = ({
        page_size,
        page_number,
        student_id
    }) => {
        setValues({ isLoading: true })
        StudentLeaveRequestAPI.getAllStudentLeaveRequests({
            page_size,
            page_number,
            student_id
        })
            .then((res) => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ data: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removeLeaveRequest = (_id: any) => {
        setValues({ isLoading: true })
        StudentLeaveRequestAPI.removeStudentLeaveRequest(_id)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllStudentLeaveRequest({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const fetchStudent = useCallback(async (q) => {
        const res = await UserAPI.searchUserByString({
            page_number: 1,
            page_size: 100,
            role: 'STUDENT',
            q
        })
        const arrStudent = []
        arrStudent.push({
            label: 'All',
            value: ''
        })
        res.data.map((i) =>
            arrStudent.push({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            })
        )
        return arrStudent
    }, [])

    const handlerStudentFilter = useCallback(
        (v) => {
            setValues({ student_id: v })
            getAllStudentLeaveRequest({
                page_size: values.page_size,
                page_number: values.page_number,
                student_id: v
            })
        },
        [values.student_id]
    )

    useEffect(() => {
        getAllStudentLeaveRequest({
            page_size: values.page_size,
            page_number: values.page_number,
            student_id: values.student_id
        })
    }, [])

    const refetchData = () => {
        getAllStudentLeaveRequest({ ...values })
    }

    const toggleModal = useCallback(
        (val: boolean) => {
            setVisible(val)
        },
        [visible]
    )

    const toggleModalSetting = useCallback(
        (val: boolean) => {
            setVisibleSetting(val)
        },
        [visible]
    )

    const onRemove = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeLeaveRequest(item._id)
            }
        })
    }

    const columns: ColumnsType<IStudentLeaveRequest> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: 80,
            align: 'center',
            render: (text, record, index) => text
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            fixed: 'left',
            width: 200,
            align: 'center',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
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
            title: 'Note',
            dataIndex: 'admin_note',
            key: 'admin_note',
            align: 'center',
            width: 250,
            render: (text, record: any) => {
                if (text) return text
                if (record?.reason) return record?.reason
                return <></>
            }
        },
        {
            title: 'Creator',
            dataIndex: 'creator_id',
            key: 'creator_id',
            align: 'center',
            width: 200,
            render: (text, record: any) => {
                if (
                    record?.source &&
                    record?.source === EnumStudentLeaveRequestSource.STUDENT
                ) {
                    return <div>Student</div>
                }
                if (record?.creator_id && record?.staff) {
                    return (
                        <div>
                            {record?.staff.fullname} - {record?.staff.username}
                        </div>
                    )
                }
                return <></>
            }
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 200,
            render: (text, record) =>
                moment(record.created_time).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 80,
            fixed: 'right',
            render: (text, record) => (
                <Space size='middle'>
                    {/* {checkPermission(PERMISSIONS.stl_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                        />
                    )} */}
                    {checkPermission(PERMISSIONS.slr_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                        />
                    )}
                </Space>
            )
        }
    ]

    const handleChangePagination = (pageNumber, pageSize) => {
        const temp = {
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        }
        setValues(temp)
        getAllStudentLeaveRequest(temp)
    }

    // const onChangeSearch = (val) => {
    //     setValues({ search: val })
    //     const temp = {
    //         student_id: val,
    //         page_size: values.page_size,
    //         page_number: values.page_number
    //     }
    //     getAllStudentLeaveRequest(temp)
    //     // refetch()
    // }

    // const onChangeStatus = (val) => {
    //     setStatus(val)
    //     setPageNumber(1)
    //     // refetch()
    // }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search by student',
            engine: (
                <DebounceSelect
                    placeholder='Search by student'
                    fetchOptions={fetchStudent}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(v) => handlerStudentFilter(v)}
                />
            )
        }
    ]

    return (
        <Card title='Leave Request Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.slr_screen_config) ? (
                        <Button
                            icon={<SettingOutlined />}
                            className='mr-3'
                            type='default'
                            style={{ background: '#52C41A', color: 'white' }}
                            onClick={() => toggleModalSetting(true)}
                        >
                            Setting
                        </Button>
                    ) : (
                        <></>
                    ),
                    checkPermission(PERMISSIONS.sas_create) ? (
                        <Button
                            type='primary'
                            onClick={() => toggleModal(true)}
                        >
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                dataSource={values.data}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    current: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                loading={values.isLoading}
                scroll={{ x: 500, y: 768 }}
                bordered
                sticky
            />
            <ScreenSettingModal
                toggleModal={toggleModalSetting}
                visible={visibleSetting}
            />
            <CreateLeaveRequestModal
                toggleModal={toggleModal}
                visible={visible}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default StudentLeaveRequest
