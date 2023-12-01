import React, { useCallback, useEffect, useReducer, useState } from 'react'
import StudentAPI from 'api/StudentAPI'
import {
    EnumTemplateAIStatus,
    EnumStudentStatus,
    MODAL_TYPE
} from 'const/status'
import {
    Table,
    Card,
    Input,
    notification,
    Button,
    Form,
    Row,
    Col,
    Tag,
    Select,
    Space,
    Modal
} from 'antd'
import {
    EditOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { IStudent } from 'types'
import UserAPI from 'api/UserAPI'
import EditRegularModal from 'core/Atoms/Modals/EditRegularModal'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { blue, red } from '@ant-design/colors'
import ApiKeyMemoAPI from 'api/ApiKeyAiAPI'
import ApiKeyModal from './api-key-modal'

const { Search } = Input
const { Option } = Select

const ApiKeyManagement = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            apiKeys: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            status: '',
            search: '',
            key_info: []
        }
    )

    const getAllApiKey = ({ page_size, page_number, search, status }) => {
        setValues({ isLoading: true })
        ApiKeyMemoAPI.getAllApiKey({
            page_size,
            page_number,
            search,
            status
        })
            .then((res) => {
                let { total } = values
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ apiKeys: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removeApiKey = (_id: any) => {
        setValues({ isLoading: true })
        ApiKeyMemoAPI.removeApiKey(_id)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllApiKey({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllApiKey({
            page_number: values.page_number,
            page_size: values.page_size,
            search: values.search.trim(),
            status: values.status
        })
    }, [])

    const toggleModal = (value, type?: MODAL_TYPE) => {
        setValues({
            isShownModal: value,
            modalType: type
        })
    }

    const editKey = (selected) => {
        toggleModal(true, MODAL_TYPE.EDIT)
        setValues({ key_info: selected })
    }

    const refetchData = () => {
        getAllApiKey({ ...values })
    }

    const reloadBalance = (selected) => {
        setValues({ isLoading: true })
        ApiKeyMemoAPI.reloadBalance({ _idApiKey: selected._id })
            .then((res) => {
                refetchData()
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllApiKey({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllApiKey({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status
        })
    }

    const onChangeStatus = (val) => {
        const temp = {
            ...values,
            page_number: 1,
            status: val
        }
        setValues(temp)
        getAllApiKey(temp)
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove key?`,
            onOk() {
                removeApiKey(item._id)
            }
        })
    }

    const columns: ColumnsType = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            fixed: true,
            width: 200,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Api Key',
            dataIndex: 'api_key',
            key: 'api_key',
            width: 300,
            align: 'center',
            render: (text, record: any) => text
        },
        // {
        //     title: 'Balance',
        //     dataIndex: 'balance',
        //     key: 'balance',
        //     width: 100,
        //     align: 'center',
        //     render: (text, record: any) => (
        //         <>
        //             {text} <span>$</span>
        //         </>
        //     )
        // },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            align: 'center',
            render: (text) => (
                <Tag color={text ? 'success' : 'warning'}>
                    {text ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {/* <ReloadOutlined
                        style={{ color: blue.primary }}
                        type='button'
                        onClick={() => reloadBalance(record)}
                    /> */}
                    {checkPermission(PERMISSIONS.taakm_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => editKey(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.taakm_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => removeKey(record)}
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={values.status}
                    onChange={onChangeStatus}
                >
                    {Object.keys(EnumTemplateAIStatus).map((key: any) => (
                        <Option
                            value={EnumTemplateAIStatus[key]}
                            key={EnumTemplateAIStatus[key]}
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
                    defaultValue={values.search}
                    placeholder='By title'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='API Key Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.taakm_create) ? (
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
                dataSource={values.apiKeys}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: any) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                loading={values.isLoading}
                sticky
            />
            <ApiKeyModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.key_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default ApiKeyManagement
