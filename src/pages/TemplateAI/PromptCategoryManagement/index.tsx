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
    Tag,
    Select,
    Space,
    Modal
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { blue, red } from '@ant-design/colors'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'
import PromptCategoryModal from './prompt-category-modal'

const { Search } = Input
const { Option } = Select

const PromptCategoryManagement = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            PromptCategories: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            status: '',
            search: '',
            prompt_category_info: []
        }
    )

    const getAllPromptCategory = ({
        page_size,
        page_number,
        search,
        status
    }) => {
        setValues({ isLoading: true })
        PromptCategoryAiAPI.getAllPromptCategory({
            page_size,
            page_number,
            search,
            status
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ PromptCategorys: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removePromptCategory = (_id: any) => {
        setValues({ isLoading: true })
        PromptCategoryAiAPI.removePromptCategory(_id)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllPromptCategory({ ...values })
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
        getAllPromptCategory({
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
        setValues({ prompt_template_info: selected })
    }

    const refetchData = () => {
        getAllPromptCategory({ ...values })
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllPromptCategory({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        getAllPromptCategory({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllPromptCategory({
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
        getAllPromptCategory(temp)
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove Prompt Category?`,
            onOk() {
                removePromptCategory(item._id)
            }
        })
    }

    const columns: ColumnsType = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            fixed: true,
            width: 180,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
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
                    {checkPermission(PERMISSIONS.tapcm_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => editKey(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.tapcm_delete) && (
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
        <Card title='Prompt Category Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.tapcm_create) ? (
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
                dataSource={values.PromptCategorys}
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
            <PromptCategoryModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.prompt_template_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default PromptCategoryManagement
