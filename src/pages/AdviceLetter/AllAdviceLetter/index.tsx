import { render } from '@testing-library/react'
import {
    Table,
    Card,
    DatePicker,
    Input,
    Tag,
    Popover,
    Row,
    Col,
    Select,
    Spin,
    Button,
    notification,
    Space,
    Modal,
    Switch
} from 'antd'
import {
    ExclamationCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { blue, red, green } from '@ant-design/colors'
import { Link } from 'react-router-dom'
import { ColumnsType } from 'antd/lib/table'
import AdviceLetterAPI from 'api/AdviceLetterAPI'
import cn from 'classnames'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
import { EnumAdviceLetterStatus, IAdviceLetter } from 'types/IAdviceLetter'
import { notify } from 'utils/notify'
import styles from './index.module.scss'
import AddAdviceLetterModal from 'pages/AdviceLetter/AllAdviceLetter/modals/AddAdviceLetterModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'

const { Option } = Select

const AllAdviceLetter: FunctionComponent = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [updateStatusSuccess, setUpdateStatusSuccess] = useState(false)
    const [isShowAddModal, setShowAddModal] = useState(false)
    const [total, setTotal] = useState<number>(0)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const toggleAddModal = (value) => {
        setShowAddModal(value)
    }

    const [queryParams, setQueryParams] = useState({
        // type: [EnumBookingTypes.TRIAL],
        status: '',
        search: queryUrl.get('search') || '',
        sort: 'prev'
        // id: queryUrl.get('id')
    })

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            letters: [],
            isLoading: false
        }
    )

    const onSearch = (value) => {
        setQueryParams({ ...queryParams, search: value })
    }

    const handleEditTTV = (item) => {
        const data = JSON.parse(JSON.stringify(item))

        const selectedData = {
            student: data.student,
            file_name: data.file_name,
            file: data.file
        }
        setValues({ selectedAdviceLetter: selectedData })
        toggleAddModal(true)
    }

    const removeAdviceLetter = useCallback((obj_id: any) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            async onOk() {
                try {
                    await AdviceLetterAPI.removeAdviceLetter(obj_id)
                    notify('success', 'Delete advice letter successfully')
                    setSubmitSuccess(true)
                } catch (err) {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                }
            }
        })
    }, [])

    const handleToggleStatus = (record) => {
        const newStatus =
            record.status === EnumAdviceLetterStatus.Published
                ? EnumAdviceLetterStatus.Private
                : EnumAdviceLetterStatus.Published

        const data = { id: record._id, newStatus }

        AdviceLetterAPI.updateStatus(data)
            .then((res) => {
                notify('success', 'Update status successfully')
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setUpdateStatusSuccess(true))
    }

    const getAllLetters = (query?: {
        page_size: number
        page_number: number
        sort?: string
        status?: number | string
        search?: string
    }) => {
        setValues({ isLoading: true })

        const filter = {
            ...query
        }
        AdviceLetterAPI.getAllAdviceLetters(filter)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setValues({ letters: res.data })
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllLetters({ ...queryParams, page_number: 1, page_size: pageSize })
        setPageNumber(1)
        setUpdateStatusSuccess(false)
        setSubmitSuccess(false)
    }, [queryParams, updateStatusSuccess, submitSuccess])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            getAllLetters({
                ...queryParams,
                page_number: _pageNumber,
                page_size: _pageSize
            })
            setPageNumber(_pageNumber)
            setPageSize(_pageSize)
        },
        [queryParams, pageNumber, pageSize]
    )

    const columns: ColumnsType<IAdviceLetter> = [
        {
            title: 'No',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record, index) => index + 1
        },
        {
            title: 'Student',
            dataIndex: 'student_id',
            key: 'student_id',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <NameTeacherStudent
                    data={record.student}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Trial Booking',
            dataIndex: 'booking_id',
            key: 'booking_id',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <Link to={`/teaching/overview/?id=${record?.booking_id}`}>
                    {record?.booking_id}
                </Link>
            )
        },
        {
            title: 'File Name',
            dataIndex: 'file_name',
            key: 'file_name',
            width: 250,
            align: 'center'
        },
        {
            title: 'TTV',
            dataIndex: 'file',
            key: 'file',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <a href={record.file} target='_blank' rel='noopener noreferrer'>
                    View file
                </a>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            render: (text) => {
                const statusClassName = cn({
                    [styles.published]:
                        text === EnumAdviceLetterStatus.Published,
                    [styles.private]: text !== EnumAdviceLetterStatus.Published
                })

                return (
                    <div className={statusClassName}>
                        {text === EnumAdviceLetterStatus.Published
                            ? 'Published'
                            : 'Private'}
                    </div>
                )
            }
        },
        {
            title: 'Created Time',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 250,
            align: 'center',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 250,
            align: 'center',
            render: (text, record) => {
                const buttonStyle = {
                    backgroundColor:
                        record.status === EnumAdviceLetterStatus.Published
                            ? '#52C41A'
                            : record.status === EnumAdviceLetterStatus.Private
                            ? '#7D9195'
                            : '#FF4D4F',
                    borderColor:
                        record.status === EnumAdviceLetterStatus.Private
                            ? '#7D9195'
                            : undefined,
                    color: '#FFFFFF'
                }
                return (
                    <Space size='middle'>
                        {checkPermission(PERMISSIONS.alaal_edit) && (
                            <EditOutlined
                                style={{ color: blue.primary }}
                                type='button'
                                onClick={() => handleEditTTV(record)}
                                title='Edit advice letter'
                            />
                        )}
                        {checkPermission(PERMISSIONS.alaal_delete) && (
                            <DeleteOutlined
                                style={{ color: red.primary }}
                                type='button'
                                onClick={() => removeAdviceLetter(record._id)}
                                title='Remove profile'
                            />
                        )}
                        {checkPermission(PERMISSIONS.alaal_change_status) && (
                            <Button
                                style={buttonStyle}
                                onClick={() => handleToggleStatus(record)}
                            >
                                {record.status ===
                                EnumAdviceLetterStatus.Published
                                    ? 'Published'
                                    : 'Private'}
                            </Button>
                        )}
                    </Space>
                )
            }
        }
    ]
    const filterEngines: IFilterEngine[] = [
        {
            label: 'Student',
            engine: (
                <Input.Search
                    placeholder='Search by student name'
                    onSearch={_.debounce(onSearch, 250)}
                    allowClear
                    enterButton='Search'
                />
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    defaultValue=''
                    style={{ width: 120 }}
                    onChange={(val) =>
                        setQueryParams({ ...queryParams, status: val })
                    }
                >
                    <Option value='' key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(EnumAdviceLetterStatus)
                        .filter(
                            (key) => !isNaN(Number(EnumAdviceLetterStatus[key]))
                        )
                        .map((key) => (
                            <Option
                                value={EnumAdviceLetterStatus[key]}
                                key={EnumAdviceLetterStatus[key]}
                            >
                                {key}
                            </Option>
                        ))}
                </Select>
            )
        }
    ]
    return (
        <Card title='All Advice Letter'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.alaal_create)
                        ? [
                              <Button
                                  onClick={() => toggleAddModal(true)}
                                  type='primary'
                              >
                                  Thêm mới
                              </Button>
                          ]
                        : null
                }
                engines={filterEngines}
            ></FilterDataWrapper>
            <Table
                dataSource={values.letters}
                loading={values.isLoading}
                columns={columns}
                scroll={{
                    x: 500,
                    y: 700
                }}
                bordered
                sticky
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
            />
            <AddAdviceLetterModal
                data={values.selectedAdviceLetter}
                toggleModal={toggleAddModal}
                visible={isShowAddModal}
                updateData={() => setSubmitSuccess(true)}
            />
        </Card>
    )
}

export default AllAdviceLetter
