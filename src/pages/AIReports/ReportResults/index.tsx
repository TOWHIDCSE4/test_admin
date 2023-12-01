import React, { useCallback, useEffect, useReducer, useState } from 'react'
import StudentAPI from 'api/StudentAPI'
import {
    EnumTemplateAIStatus,
    EnumStudentStatus,
    MODAL_TYPE_NEW
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
    Modal,
    Spin
} from 'antd'
import {
    EyeOutlined,
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
import ReportResultModal from './report-result-modals'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'
import AIReportResultAPI from 'api/AIReportResultAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import UserAPI from 'api/UserAPI'
import moment from 'moment'
import NameTeacherStudent from 'components/name-teacher-student'
import PromptTemplateAiAPI from 'api/PromptTemplateAiAPI'
import { notify } from 'utils/notify'
import { RoleCode } from 'const'
import sanitizeHtml from 'sanitize-html'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Search } = Input
const { Option } = Select

const ReportResultManagement = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            ReportResults: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            category: '',
            search: queryUrl.get('user') ?? '',
            prompt_template_id: null,
            report_result_info: []
        }
    )

    const [valueCategory, setValueCategory] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            categories: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: ''
        }
    )

    const [promptTemplate, setValuePromptTemplate] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: ''
        }
    )

    const getAllReportResult = ({
        page_size,
        page_number,
        search,
        prompt_template_id,
        category
    }) => {
        setValues({ isLoading: true })
        AIReportResultAPI.getAllAIReportResult({
            page_size,
            page_number,
            search,
            prompt_template_id,
            category
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ ReportResults: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removeReportResult = (_id: any) => {
        setValues({ isLoading: true })
        AIReportResultAPI.removeAIReportResult(_id)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllReportResult({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const getCategory = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            setValueCategory({ isLoading: true })
            const { categories } = valueCategory
            PromptCategoryAiAPI.getAllPromptCategory({
                status: EnumTemplateAIStatus.ACTIVE,
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    let newCategory = [...res.data]
                    if (query.page_number > 1) {
                        newCategory = [...categories, ...res.data]
                    }
                    setValueCategory({
                        categories: newCategory,
                        total: res.pagination.total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueCategory({ isLoading: false }))
        },
        [valueCategory]
    )

    const getPromptTemplates = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        PromptTemplateAiAPI.getAllPromptTemplate({
            page_size: query?.page_size,
            page_number: query?.page_number,
            search: query?.search,
            status: EnumTemplateAIStatus.ACTIVE
        })
            .then((res) => {
                let newPromptTemplate = [...res.data]
                if (query.page_number > 1) {
                    newPromptTemplate = [...promptTemplate.data, ...res.data]
                }
                setValuePromptTemplate({
                    data: newPromptTemplate,
                    total: res.pagination.total
                })
                promptTemplate.data = newPromptTemplate
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getAllReportResult({
            page_number: values.page_number,
            page_size: values.page_size,
            search: values?.search?.trim(),
            prompt_template_id: values.prompt_template_id,
            category: values.category
        })
        getCategory({
            page_number: valueCategory.page_number,
            page_size: valueCategory.page_size,
            search: valueCategory.search
        })
        getPromptTemplates({
            page_number: promptTemplate.page_number,
            page_size: promptTemplate.page_size,
            search: promptTemplate.search
        })
    }, [])

    const toggleModal = (value, selected?, type?: MODAL_TYPE_NEW) => {
        setValues({
            isShownModal: value,
            modalType: type
        })
        setValues({ report_result_info: selected })
    }

    const refetchData = () => {
        getAllReportResult({ ...values })
    }

    const onChangeCategory = useCallback(
        (value: any) => {
            getAllReportResult({ ...values, category: value })
            setValues({ ...values, category: value })
        },
        [values]
    )

    const renderCategories = () => {
        if (valueCategory?.categories) {
            return valueCategory?.categories.map((item: any, index) => (
                <Option key={`s${item._id}`} value={item._id}>
                    {`${item.title} `}
                </Option>
            ))
        }
        return <></>
    }

    const onSearchCategory = (value: any) => {
        setValueCategory({
            page_number: 1,
            search: value
        })
        getCategory({
            page_number: 1,
            page_size: valueCategory.page_size,
            search: value
        })
    }

    const loadMoreCategory = (event) => {
        const { target } = event
        if (
            !valueCategory.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { total, page_size, page_number } = valueCategory
            if (total > page_size * page_number) {
                const newPageNumber = valueCategory.page_number + 1
                setValueCategory({ page_number: newPageNumber })
                getCategory({
                    page_number: newPageNumber,
                    page_size: valueCategory.page_size,
                    search: valueCategory.search
                })
            }
        }
    }

    const loadMorePromptTemplate = () => {
        if (
            promptTemplate.page_number * promptTemplate.page_size <
            promptTemplate.total
        ) {
            getPromptTemplates({
                page_number: promptTemplate.page_number,
                page_size: promptTemplate.page_size,
                search: promptTemplate.search
            })
            setValuePromptTemplate({
                page_number: promptTemplate.page_number + 1
            })
        }
    }

    const onSearchPromptTemplate = (val) => {
        getPromptTemplates({
            page_size: promptTemplate.page_size,
            page_number: 1,
            search: val
        })
        setValuePromptTemplate({ page_number: 1, search: val })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllReportResult({
            ...values,
            search: val.trim()
        })
    }

    const handlerPromptTemplate = useCallback(
        async (value) => {
            getAllReportResult({ ...values, prompt_template_id: value })
            setValues({ ...values, prompt_template_id: value })
        },
        [values]
    )

    const renderPromptTemplate = () =>
        promptTemplate.data.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.title}
            </Option>
        ))

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllReportResult({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove prompt template?`,
            onOk() {
                removeReportResult(item._id)
            }
        })
    }

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: true,
            width: 70,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 140,
            render: (text) => text && moment(text).format('HH:mm:ss DD/MM/YYYY')
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 150,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type={
                        text?.role[0] === RoleCode.STUDENT
                            ? 'student'
                            : 'teacher'
                    }
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Category',
            dataIndex: 'prompt_template',
            key: 'category',
            width: 120,
            align: 'center',
            render: (text, record: any) => text && text?.category?.title
        },
        {
            title: 'Prompt Template',
            dataIndex: 'prompt_template',
            key: 'category',
            width: 150,
            align: 'center',
            render: (text, record: any) => text && text?.title
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            align: 'center',
            render: (text, record: any) => (
                <div
                    className='text-truncate'
                    dangerouslySetInnerHTML={{
                        __html: sanitize(text.substring(3, 150))
                    }}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.airrr_view) && (
                        <EyeOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() =>
                                toggleModal(true, record, MODAL_TYPE_NEW.VIEW)
                            }
                        />
                    )}
                    {checkPermission(PERMISSIONS.airrr_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() =>
                                toggleModal(true, record, MODAL_TYPE_NEW.EDIT)
                            }
                        />
                    )}
                    {checkPermission(PERMISSIONS.airrr_delete) && (
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
            label: 'Search user',
            engine: (
                <Search
                    placeholder='By user name of user'
                    allowClear
                    enterButton='Search'
                    defaultValue={values.search}
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        },
        {
            label: 'Prompt Template',
            engine: (
                <Select
                    placeholder='Choose Prompt Template'
                    showSearch
                    autoClearSearchValue
                    allowClear
                    filterOption={false}
                    loading={promptTemplate.isLoading}
                    onPopupScroll={loadMorePromptTemplate}
                    onSearch={_.debounce(onSearchPromptTemplate, 300)}
                    onChange={(val) => {
                        handlerPromptTemplate(val)
                    }}
                >
                    {renderPromptTemplate()}
                    {promptTemplate.isLoading && (
                        <Select.Option key='loading' value=''>
                            <Spin size='small' />
                        </Select.Option>
                    )}
                </Select>
            )
        },
        {
            label: 'Category',
            engine: (
                <Select
                    placeholder='Choose category'
                    showSearch
                    autoClearSearchValue
                    filterOption={false}
                    loading={valueCategory.isLoading}
                    onPopupScroll={loadMoreCategory}
                    onSearch={_.debounce(onSearchCategory, 300)}
                    onChange={onChangeCategory}
                >
                    {renderCategories()}
                    {valueCategory.isLoading && (
                        <Option key='loading_course' value=''>
                            <Spin size='small' />
                        </Option>
                    )}
                </Select>
            )
        }
    ]

    return (
        <Card title='Report Result'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>
            <Table
                dataSource={values.ReportResults}
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
            <ReportResultModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.report_result_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default ReportResultManagement
