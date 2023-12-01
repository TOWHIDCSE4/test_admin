/* eslint-disable jsx-a11y/control-has-associated-label */
import {
    Card,
    Space,
    Button,
    Table,
    Modal,
    notification,
    Select,
    Input
} from 'antd'
import {
    ExclamationCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { blue, red, green } from '@ant-design/colors'
import { EnumTeacherStatus, MODAL_TYPE } from 'const'
import { useCallback, useEffect, useReducer, useMemo, useState } from 'react'
import TeacherTrialAPI from 'api/TeacherTrialAPI'
import { AGE_GROUP_NAMES, ITeacherTrial } from 'types'
import { ColumnsType } from 'antd/lib/table'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import TeacherTrialModal from './teacher-trial-modal'
import _ from 'lodash'

const { Option } = Select
const { Search } = Input

const TeacherTrialPool = ({ ...props }) => {
    const [inputSearch, setInputSearch] = useState<string>('')
    const [state, setState] = useReducer(
        (currentState, newState) => ({
            ...currentState,
            ...newState
        }),
        {
            teachers: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTeacherStatus.ALL,
            modalType: '',
            isShownModal: false,
            search: '',
            trial_info: {}
        }
    )

    const getTrialTeacherProfiles = useCallback(
        async ({ page_size, page_number, status, search }) => {
            setState({ isLoading: true })
            try {
                const res = await TeacherTrialAPI.getTrialTeacherProfiles({
                    page_size,
                    page_number,
                    status,
                    search
                })
                let { total } = state
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setState({ teachers: res.data, total })
            } catch (err) {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            }
            setState({ isLoading: false })
        },
        []
    )

    const refetchData = () => {
        setInputSearch('')
        setState({ search: '', status: EnumTeacherStatus.ALL })

        getTrialTeacherProfiles({
            page_size: state.page_size,
            page_number: state.page_number
        })
    }

    useEffect(() => {
        getTrialTeacherProfiles({ ...state })
    }, [])

    const removeTrialTeacherProfile = useCallback((teacher_id: number) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            async onOk() {
                try {
                    await TeacherTrialAPI.removeTrialTeacherProfile(teacher_id)
                    refetchData()
                } catch (err) {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                }
            }
        })
    }, [])

    const toggleModal = useCallback(
        (value: boolean, type?: MODAL_TYPE) => {
            setState({
                isShownModal: value,
                modalType: type,
                trial_info: {}
            })
        },
        [state]
    )

    const columns: ColumnsType<ITeacherTrial> = useMemo(
        () => [
            {
                title: 'Teacher',
                key: 'teacher',
                render: (text, record) => {
                    const user = record.teacher?.user_info
                    return (
                        <>
                            <div>
                                U: {user?.username}({user?.id})
                            </div>
                            <div>
                                FN: {user?.full_name}({user?.gender})
                            </div>
                            <div>Email: {user?.email}</div>
                            {user?.skype_account && (
                                <div>Skype: {user.skype_account}</div>
                            )}
                            <div>{user?.is_active ? 'active' : 'inactive'}</div>
                        </>
                    )
                },
                width: 300
            },
            {
                title: 'Degree',
                dataIndex: ['teacher', 'degree'],
                key: 'degree',
                align: 'center',
                render: (val, record) =>
                    val && (
                        <a href={val} target='_blank' rel='noreferrer'>
                            <CheckOutlined
                                style={{ color: green.primary, fontSize: 18 }}
                            />
                        </a>
                    )
            },
            {
                title: 'Location',
                dataIndex: ['teacher', 'location', 'name'],
                key: 'location'
            },
            {
                title: 'Age group',
                key: 'age_group',
                render: (text, record) =>
                    record.age_groups.map((i) => AGE_GROUP_NAMES[i]).join(', ')
            },
            {
                title: 'English Certificate',
                key: 'english_certificate',
                render: (val, record) => (
                    <Space>
                        {record.teacher?.english_certificate?.ielts ? (
                            <a
                                href={record.teacher?.english_certificate.ielts}
                                target='_blank'
                                rel='noreferrer'
                            >
                                IELTS
                            </a>
                        ) : null}
                        {record.teacher?.english_certificate?.toeic ? (
                            <a
                                href={record.teacher.english_certificate.toeic}
                                target='_blank'
                                rel='noreferrer'
                            >
                                TOEIC
                            </a>
                        ) : null}
                    </Space>
                )
            },
            {
                title: 'Teaching Certificate',
                dataIndex: ['teacher', 'teaching_cartificate'],
                key: 'teaching_cartificate',
                render: (val, record) => (
                    <Space>
                        {record.teacher?.teaching_certificate?.tesol ? (
                            <a
                                href={record.teacher.teaching_certificate.tesol}
                                target='_blank'
                                rel='noreferrer'
                            >
                                TESOL
                            </a>
                        ) : null}
                        {record.teacher?.teaching_certificate?.tefl ? (
                            <a
                                href={record.teacher?.teaching_certificate.tefl}
                                target='_blank'
                                rel='noreferrer'
                            >
                                TEFL
                            </a>
                        ) : null}
                    </Space>
                )
            },
            {
                title: 'Action',
                key: 'action',
                align: 'center',
                fixed: 'right',
                width: 80,
                render: (text, record) => (
                    <Space size='middle'>
                        {checkPermission(PERMISSIONS.ttp_update) && (
                            <EditOutlined
                                style={{ color: blue.primary }}
                                type='button'
                                onClick={() => {
                                    toggleModal(true, MODAL_TYPE.EDIT)
                                    setState({ trial_info: record })
                                }}
                                title='Edit profile'
                            />
                        )}
                        {checkPermission(PERMISSIONS.ttp_delete) && (
                            <DeleteOutlined
                                style={{ color: red.primary }}
                                type='button'
                                onClick={() =>
                                    removeTrialTeacherProfile(record.teacher_id)
                                }
                                title='Remove profile'
                            />
                        )}
                    </Space>
                )
            }
        ],
        []
    )

    const handleChangePagination = useCallback(
        (pageNumber, pageSize) => {
            setState({ page_number: pageNumber, page_size: pageSize })
            getTrialTeacherProfiles({
                ...state,
                page_number: pageNumber,
                page_size: pageSize
            })
        },
        [state]
    )

    const onChangeStatus = (val) => {
        setState({ page_number: 1, status: val })
        getTrialTeacherProfiles({
            status: val,
            search: state.search,
            page_size: state.page_size,
            page_number: 1
        })
    }

    const onSearch = (val) => {
        setState({
            search: val,
            page_number: 1
        })
        getTrialTeacherProfiles({
            status: state.status,
            search: val,
            page_size: state.page_size,
            page_number: 1
        })
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
                    value={state.status}
                    onChange={onChangeStatus}
                >
                    {Object.keys(EnumTeacherStatus).map((key: any) => (
                        <Option
                            value={EnumTeacherStatus[key]}
                            key={EnumTeacherStatus[key]}
                        >
                            {_.upperCase(_.startCase(key))}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                    value={inputSearch}
                    onChange={(e) => setInputSearch(e.target.value)}
                />
            )
        }
    ]

    return (
        <Card title='Teacher Trial Profiles Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.ttp_create) ? (
                        <Button
                            type='primary'
                            onClick={() =>
                                toggleModal(true, MODAL_TYPE.ADD_NEW)
                            }
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
                bordered
                dataSource={state.teachers}
                columns={columns}
                loading={state.isLoading}
                pagination={{
                    defaultCurrent: state.page_number,
                    current: state.page_number,
                    pageSize: state.page_size,
                    total: state.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record.teacher_id}
                scroll={{
                    x: 500
                }}
            />
            <TeacherTrialModal
                visible={state.isShownModal}
                toggleModal={toggleModal}
                type={state.modalType}
                data={state.trial_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default TeacherTrialPool
