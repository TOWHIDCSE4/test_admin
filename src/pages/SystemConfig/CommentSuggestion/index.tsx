import { useEffect, useCallback, FC, useState } from 'react'
import { Table, Card, Space, Modal, Button, Row, Col, Select } from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import { EnumCommentType, ICommentSuggestion } from 'types'
import CommentSuggestionAPI from 'api/CommentSuggestionAPI'
import { ColumnsType } from 'antd/lib/table'
import { FULL_DATE_FORMAT, MEMO_NOTE_FIELDS } from 'const'
import moment from 'moment'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import CommentSuggestionModal from './modals/CommentSuggestionModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { Option } = Select

const CommentSuggestion: FC = () => {
    const [isLoading, setLoading] = useState(false)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ICommentSuggestion>(null)
    const [commentSuggestion, setCommentSuggestion] = useState<
        ICommentSuggestion[]
    >([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)

    const [queryParams, setQueryParams] = useState({
        type: null,
        keyword: '',
        point: ''
    })

    const fetchCommentSuggestion = (query: {
        page_size?: number
        page_number?: number
        type?: EnumCommentType
        keyword?: string
        point?: any
    }) => {
        setLoading(true)
        CommentSuggestionAPI.getCommentSuggestions(query)
            .then((res) => {
                setCommentSuggestion(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchCommentSuggestion({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [])

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            fetchCommentSuggestion({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            fetchCommentSuggestion({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const refetchData = useCallback(() => {
        fetchCommentSuggestion({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [pageSize, pageNumber])

    const removeComment = useCallback((id: number) => {
        setLoading(true)
        CommentSuggestionAPI.removeCommentSuggestion(id)
            .then((res) => {
                notify('success', 'Remove successfully')
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }, [])

    const onRemove = useCallback((item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeComment(item.id)
            }
        })
    }, [])

    useEffect(() => {
        fetchCommentSuggestion({
            ...queryParams,
            page_size: pageSize,
            page_number: 1
        })
        setPageNumber(1)
    }, [queryParams])

    const columns: ColumnsType<ICommentSuggestion> = [
        {
            title: 'Keyword',
            dataIndex: 'keyword',
            key: 'keyword',
            align: 'center',
            width: 200
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 150,
            render: (text, record) => <>{_.startCase(text).toUpperCase()}</>
        },
        {
            title: 'Point range',
            dataIndex: 'min_point',
            key: 'max_point',
            width: 150,
            align: 'center',
            render: (text, record) => <>{`${text} - ${record.max_point}`}</>
        },
        {
            title: 'Vi comment',
            dataIndex: 'vi_comment',
            key: 'vi_comment',
            align: 'center',
            width: 300
        },
        {
            title: 'En comment',
            dataIndex: 'en_comment',
            key: 'en_comment',
            align: 'center',
            width: 350
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'center',
            width: 160,
            render: (text) => text && moment(text).format(FULL_DATE_FORMAT)
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.satl_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit comment suggestion'
                        />
                    )}
                    {checkPermission(PERMISSIONS.satl_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove comment suggestion'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Type',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by comment type'
                    value={queryParams.type}
                    onChange={(val) =>
                        setQueryParams({ ...queryParams, type: val })
                    }
                >
                    <Option value={null} key={-1}>
                        ALL TYPE
                    </Option>
                    <Option value={EnumCommentType.NORMAL_MEMO}>
                        {_.startCase(EnumCommentType.NORMAL_MEMO).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.TRIAL_MEMO}>
                        {_.startCase(EnumCommentType.TRIAL_MEMO).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.MONTHLY_MEMO}>
                        {_.startCase(
                            EnumCommentType.MONTHLY_MEMO
                        ).toUpperCase()}
                    </Option>
                    <Option value={EnumCommentType.COURSE_MEMO}>
                        {_.startCase(EnumCommentType.COURSE_MEMO).toUpperCase()}
                    </Option>
                </Select>
            )
        },
        {
            label: 'Keyword',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by keyword'
                    value={queryParams.keyword}
                    onChange={(val) =>
                        setQueryParams({ ...queryParams, keyword: val })
                    }
                >
                    <Option value='' key={-1}>
                        ALL KEYWORD
                    </Option>
                    {MEMO_NOTE_FIELDS.map((k, index) => (
                        <Option value={k} key={k}>
                            {k.toUpperCase()}
                        </Option>
                    ))}
                </Select>
            )
        }
        // {
        //     label: 'Keyword',
        //     engine: (
        //         <Select
        //             allowClear
        //             showArrow
        //             style={{ width: '100%' }}
        //             placeholder='Filter by keyword'
        //             value={queryParams.keyword}
        //             onChange={(val) =>
        //                 setQueryParams({ ...queryParams, keyword: val })
        //             }
        //         >
        //             <Option value='' key={-1}>
        //                 ALL KEYWORD
        //             </Option>
        //             {MEMO_NOTE_FIELD.concat(SCHEDULED_MEMO_FIELDS)
        //                 .concat(ADMIN_ASSESSMENT_FIELD)
        //                 .concat(NORMAL_BOOKING_ASSESSMENT_FIELDS)
        //                 .map((k, index) => (
        //                     <Option value={k} key={k}>
        //                         {k.toUpperCase()}
        //                     </Option>
        //                 ))}
        //         </Select>
        //     )
        // }
    ]

    return (
        <Card title='Comment Suggestion Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.satl_create) ? (
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
                dataSource={commentSuggestion}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <CommentSuggestionModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default CommentSuggestion
