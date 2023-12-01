import { useEffect, useCallback, useReducer } from 'react'
import { Table, Card, Space, Modal, Button, Row, Col, Tooltip } from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import { ITemplate, EnumTemplateType } from 'types/ITemplate'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import TemplateModal from './template-modal'

const Template = () => {
    const [state, setState] = useReducer(
        (currentState, newState) => ({ ...currentState, ...newState }),
        {
            isLoading: false,
            visibleTemplateModal: false,
            modalType: null,
            selectedItem: null,
            data: [],
            search: null,
            type: null,
            pagination: {
                current: 1,
                pageSize: 10
            }
        }
    )

    const fetch = useCallback(
        async (query: {
            page_size?: number
            page_number?: number
            type?: EnumTemplateType
            search?: string
        }) => {
            setState({ isLoading: true })
            try {
                const res = await TemplateAPI.getTemplates(query)
                setState({
                    data: res.data,
                    pagination: {
                        current: query.page_number,
                        pageSize: query.page_size,
                        total: res.pagination?.total
                    }
                })
            } catch (err) {
                notify('error', err.message)
            }
            setState({ isLoading: false })
        },
        []
    )

    const refetchData = useCallback(() => {
        fetch({
            page_size: state.pagination.pageSize,
            page_number: state.pagination.current,
            type: state.type,
            search: state.search
        })
    }, [state.pagination, state.type, state.search])

    useEffect(() => {
        fetch({
            page_size: state.pagination.pageSize,
            page_number: state.pagination.current
        })
    }, [])

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setState({ visibleTemplateModal: value, modalType: _modalType })
        },
        [state.modalType, state.visibleTemplateModal]
    )

    const onEdit = useCallback(
        (item) => {
            setState({
                selectedItem: item,
                modalType: MODAL_TYPE.EDIT,
                visibleTemplateModal: true
            })
        },
        [state.modalType, state.visibleTemplateModal, state.selectedItem]
    )

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        setState({ ...filters })
        fetch({
            page_size: pagination.pageSize,
            page_number: pagination.current,
            ...filters
        })
    }, [])

    const removeTemplate = useCallback(async (id: number) => {
        setState({ isLoading: true })
        try {
            await TemplateAPI.removeTemplate(id)
            notify('success', 'Remove successfully')
            refetchData()
        } catch (err) {
            notify('error', err.message)
        }
        setState({ isLoading: false })
    }, [])

    const onRemove = useCallback((item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeTemplate(item._id)
            }
        })
    }, [])

    const columns: ColumnsType<ITemplate> = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 200,
            render: (val, record) => EnumTemplateType[val],
            filters: [
                {
                    text: 'Email',
                    value: EnumTemplateType.EMAIL
                },
                {
                    text: 'Notification',
                    value: EnumTemplateType.NOTIFICATION
                },
                {
                    text: 'Event',
                    value: EnumTemplateType.EVENT
                },
                {
                    text: 'ZaloOA',
                    value: EnumTemplateType.ZALOOA
                }
            ],
            filterMultiple: false
        },
        {
            title: 'Name',
            dataIndex: 'code',
            key: 'code',
            render: (val, record) => val
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            fixed: 'right',
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.met_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit template'
                        />
                    )}
                    {checkPermission(PERMISSIONS.met_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove template'
                        />
                    )}
                </Space>
            )
        }
    ]

    return (
        <Card title={<>Template Management </>}>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.met_create) ? (
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
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={state.data}
                columns={columns}
                loading={state.isLoading}
                pagination={state.pagination}
                onChange={handleTableChange}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <TemplateModal
                visible={state.visibleTemplateModal}
                type={state.modalType}
                data={state.selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Template
