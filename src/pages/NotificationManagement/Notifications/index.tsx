import { useAuth } from 'contexts/Authenticate'
import { useEffect, useCallback, useReducer, useState } from 'react'
import {
    connect,
    subscribeNotificationChanges,
    unSubscribeNotificationChanges
} from 'socket'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Collapse,
    Form,
    Button,
    DatePicker,
    Tabs,
    Badge
} from 'antd'
import _ from 'lodash'
import moment from 'moment'
import NotificationAPI from 'api/NotificationAPI'
import { sanitizeMessage } from 'utils/notification'
import TemplateAPI from 'api/TemplateAPI'
import OperationIssueAPI from 'api/OperationIssueAPI'

const { RangePicker } = DatePicker
const { Panel } = Collapse
const { TabPane } = Tabs

const initialState = {
    data: [],
    isLoading: false,
    page_size: 10,
    page_number: 1,
    total: 0,
    tab_key: '',
    template_filters: [],
    type: '',
    template_filter_obj_ids: [],
    filter_type: 'filter_booking_date',
    objectSearch: {
        // fromDate: moment().subtract(6, 'd').startOf('d'),
        // toDate: moment().endOf('d')
        fromDate: '',
        toDate: '',
        fromBookingDate: moment().startOf('d'),
        toBookingDate: moment().endOf('d')
    }
}

const Notifications = ({ ...props }) => {
    const { user } = useAuth()
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        initialState
    )
    const [form] = Form.useForm()
    const [newNoti, setNewNoti] = useState(null)

    const getStaffNameByIds = useCallback(
        (operation_issue_ids, data, total) => {
            OperationIssueAPI.getStaffNameByIds({
                operation_issue_ids
            })
                .then((res) => {
                    console.log(res)
                    const newNotis = data.map((item: any) => {
                        if (
                            item.operation_issue_id &&
                            res[item.operation_issue_id]
                        ) {
                            const tmp = {
                                ...item,
                                user: res[item.operation_issue_id]
                            }
                            return tmp
                        }

                        return item
                    })
                    setValues({ data: newNotis, total })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        },
        [values]
    )

    const getNotifications = useCallback(
        ({ page_size, page_number, type, template_obj_id }) => {
            console.log('>>> getNotifications, values: ', values)
            setValues({ isLoading: true })

            let fromDate = values.objectSearch.fromBookingDate
            let toDate = values.objectSearch.toBookingDate
            if (values.filter_type === 'filter_date') {
                fromDate = values.objectSearch.fromDate
                toDate = values.objectSearch.toDate
            }

            const searchData = {
                page_size,
                page_number,
                filter_type: values.filter_type,
                fromDate,
                toDate,
                type,
                template_obj_id
            }
            console.log(searchData)
            NotificationAPI.getNotificationsForView(searchData)
                .then((res: any) => {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }

                    const operation_issue_ids = res.data.map(
                        (x: any) => x.operation_issue_id || null
                    )
                    const operation_issue_ids_filtered =
                        operation_issue_ids.filter((el) => {
                            return el != null
                        })

                    if (operation_issue_ids_filtered.length > 0) {
                        getStaffNameByIds(
                            operation_issue_ids_filtered,
                            res.data,
                            total
                        )
                    } else {
                        setValues({ data: res.data, total })
                    }
                })
                .catch((err: any) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    const getTemplateFilters = useCallback(() => {
        let fromDate = values.objectSearch.fromBookingDate
        let toDate = values.objectSearch.toBookingDate
        if (values.filter_type === 'filter_date') {
            fromDate = values.objectSearch.fromDate
            toDate = values.objectSearch.toDate
        }
        setValues({ isLoading: true })
        TemplateAPI.getTemplateFilters({
            filter_type: values.filter_type,
            fromDate,
            toDate
        })
            .then((res) => {
                console.log(res)
                if (res && res.length > 0) {
                    let type = 'admin'
                    let templateObjId = res?.[0].obj_id
                    let tabKey = templateObjId
                    if (values.type && values.tab_key) {
                        type = values.type
                        templateObjId = values.tab_key
                        tabKey = templateObjId
                    }
                    const template_filter_obj_ids = res.map((e) => e.obj_id)
                    const index = template_filter_obj_ids.indexOf('other')
                    if (index !== -1) {
                        template_filter_obj_ids.splice(index, 1)
                    }
                    if (tabKey === 'other') {
                        type = 'other'
                        templateObjId = template_filter_obj_ids
                    }
                    console.log(
                        '>>> getTemplateFilters, template_filter_obj_ids: ',
                        template_filter_obj_ids
                    )
                    setValues({
                        template_filters: res,
                        tab_key: tabKey,
                        type,
                        template_filter_obj_ids
                    })
                    getNotifications({
                        page_number: values.page_number,
                        page_size: values.page_size,
                        type,
                        template_obj_id: templateObjId
                    })
                } else {
                    setValues({
                        data: [],
                        total: 0,
                        tab_key: '',
                        template_filters: [],
                        type: '',
                        template_filter_obj_ids: []
                    })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }, [values])

    const seenNotification = (objId = null) => {
        if (objId) {
            NotificationAPI.markSeenById({ objId })
                .then(() => {
                    // const newTemplateFilters = values.template_filters.map(
                    //     (item: any) => {
                    //         if (item.obj_id === values.tab_key) {
                    //             const tmp = {
                    //                 ...item,
                    //                 total_unseen:
                    //                     item.total_unseen > 0
                    //                         ? item.total_unseen - 1
                    //                         : item.total_unseen
                    //             }
                    //             return tmp
                    //         }

                    //         return item
                    //     }
                    // )
                    // const newNotis = values.data.map((item: any) => {
                    //     if (item._id === objId) {
                    //         const tmp = {
                    //             ...item,
                    //             seen: true
                    //         }
                    //         return tmp
                    //     }

                    //     return item
                    // })

                    // setValues({
                    //     data: newNotis,
                    //     template_filters: newTemplateFilters
                    // })
                    getTemplateFilters()
                })
                .catch((err: any) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        } else {
            let fromDate = values.objectSearch.fromBookingDate
            let toDate = values.objectSearch.toBookingDate
            if (values.filter_type === 'filter_date') {
                fromDate = values.objectSearch.fromDate
                toDate = values.objectSearch.toDate
            }

            let templateObjId = values.tab_key
            if (values.tab_key === 'other') {
                templateObjId = values.template_filter_obj_ids
            }

            NotificationAPI.markSeen({
                type: values.type,
                template_obj_id: templateObjId,
                filter_type: values.filter_type,
                fromDate,
                toDate
            })
                .then(() => {
                    // const newTemplateFilters = values.template_filters.map(
                    //     (item: any) => {
                    //         if (item.obj_id === values.tab_key) {
                    //             const tmp = {
                    //                 ...item,
                    //                 total_unseen: 0
                    //             }
                    //             return tmp
                    //         }

                    //         return item
                    //     }
                    // )
                    // const newNotis = values.data.map((item: any) => {
                    //     const tmp = {
                    //         ...item,
                    //         seen: true
                    //     }
                    //     return tmp
                    // })
                    // setValues({
                    //     data: newNotis,
                    //     template_filters: newTemplateFilters
                    // })
                    getTemplateFilters()
                })
                .catch((err: any) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
        }
    }

    const handleNotification = (operationIssueId) => {
        OperationIssueAPI.markOperationById({ operationIssueId })
            .then((res) => {
                if (res.ok && res.msg) {
                    notification.success({
                        message: res.msg
                    })
                }

                getTemplateFilters()
            })
            .catch((err: any) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getNotifications({
            page_number,
            page_size,
            type: values.type,
            template_obj_id:
                values.type === 'other'
                    ? values.template_filter_obj_ids
                    : values.tab_key
        })
    }

    const setTypeFilter = (type) => {
        setValues({ filter_type: type })
    }

    useEffect(() => {
        form.setFieldsValue({
            ...values.objectSearch
        })
        getTemplateFilters()
        // getNotifications({
        //     page_number: values.page_number,
        //     page_size: values.page_size,
        //     type: values.type,
        //     template_obj_id: values.tab_key
        // })
    }, [])

    useEffect(() => {
        const onNewNotificationChange = (data) => {
            // const newNotification = data
            // if (newNotification) {
            //     getTemplateFilters()
            // }
            setNewNoti(data)
        }

        if (user?._id) {
            connect(
                subscribeNotificationChanges({
                    user_id: user._id,
                    onUpdateChanges: onNewNotificationChange
                })
            )
        }

        return () => {
            unSubscribeNotificationChanges({
                user_id: user._id,
                onUpdateChanges: onNewNotificationChange
            })
        }
    }, [user._id, setNewNoti])

    useEffect(() => {
        if (newNoti) {
            getTemplateFilters()
        }
    }, [newNoti])

    const onSearch = (valuesForm: any) => {
        setValues({
            page_number: 1,
            objectSearch: { ...values.objectSearch, ...valuesForm }
        })
        // getNotifications({
        //     page_number: 1,
        //     page_size: values.page_size,
        //     type: values.type,
        //     template_obj_id:
        //         values.type === 'other'
        //             ? values.template_filter_obj_ids
        //             : values.tab_key
        // })
        getTemplateFilters()
    }

    const columns: any = [
        {
            title: 'STT',
            key: 'STT',
            width: 120,
            align: 'center',
            hidden: false,
            fixed: true,
            render: (text: any, record: any, index) => {
                return record && record.seen ? (
                    index + (values.page_number - 1) * values.page_size + 1
                ) : (
                    <b>
                        {index +
                            (values.page_number - 1) * values.page_size +
                            1}
                    </b>
                )
            }
        },
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'left',
            width: 200,
            render: (e, record: any) => {
                return record && record.created_time ? (
                    <div>
                        {record.seen ? (
                            moment(record?.created_time).format(
                                'DD-MM-YYYY HH:mm:ss'
                            )
                        ) : (
                            <b>
                                {moment(record?.created_time).format(
                                    'DD-MM-YYYY HH:mm:ss'
                                )}
                            </b>
                        )}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Content',
            dataIndex: 'message',
            key: 'message',
            align: 'left',
            render: (e, record: any) => {
                return record ? (
                    record.seen ? (
                        <div>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeMessage(record)
                                }}
                            />
                            {record.operation_issue_id && record?.user && (
                                <div className='text-primary pt-3'>
                                    <span>
                                        {record?.user?.fullname} -{' '}
                                        {record?.user?.username}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <b>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeMessage(record)
                                    }}
                                />
                            </b>
                            {record.operation_issue_id && record?.user && (
                                <div className='text-primary pt-3'>
                                    <span>
                                        {record?.user?.fullname} -{' '}
                                        {record?.user?.username}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => {
                return record && record.seen ? (
                    record.operation_issue_id && record?.user ? (
                        <span>Đã xử lý</span>
                    ) : (
                        <></>
                    )
                ) : (
                    <div>
                        <div>
                            <Button
                                style={{
                                    minWidth: 90
                                }}
                                onClick={() => seenNotification(record._id)}
                            >
                                Bỏ qua
                            </Button>
                        </div>
                        {record.operation_issue_id && (
                            <div className='mt-2'>
                                <Button
                                    type='primary'
                                    style={{
                                        backgroundColor: 'green',
                                        borderColor: 'green',
                                        minWidth: 90
                                    }}
                                    onClick={() =>
                                        handleNotification(
                                            record.operation_issue_id
                                        )
                                    }
                                >
                                    Đã xử lý
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }
        }
    ]

    const handleChangeDate = (value) => {
        if (value && value.length) {
            console.log('>>> handleChangeDate, value: ', value)
            setValues({
                objectSearch: {
                    ...values.objectSearch,
                    fromDate: moment(value[0]).startOf('d'),
                    toDate: moment(value[1]).endOf('d')
                },
                page_number: 1
            })
        }
    }

    const handleChangeBookingDate = (value) => {
        if (value && value.length) {
            console.log('>>> handleChangeBookingDate, value: ', value)
            setValues({
                objectSearch: {
                    ...values.objectSearch,
                    fromBookingDate: moment(value[0]).startOf('d'),
                    toBookingDate: moment(value[1]).endOf('d')
                },
                page_number: 1
            })
        }
    }

    const onChangeTab = useCallback(
        (key) => {
            console.log(key)
            if (key === 'other') {
                console.log(
                    '>>> values.template_filters: ',
                    values.template_filters
                )
                setValues({
                    data: [],
                    type: 'other',
                    tab_key: key,
                    page_number: 1
                })
                getNotifications({
                    page_size: values.page_size,
                    page_number: 1,
                    type: 'other',
                    template_obj_id: values.template_filter_obj_ids
                })
            } else {
                setValues({
                    data: [],
                    type: 'admin',
                    tab_key: key,
                    page_number: 1
                })
                getNotifications({
                    page_size: values.page_size,
                    page_number: 1,
                    type: 'admin',
                    template_obj_id: key
                })
            }
        },
        [values]
    )

    return (
        <Card title='Notifications'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col className='mb-2' span={16}>
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={4}>Time:</Col>
                                    <Col span={15}>
                                        <Form.Item
                                            name='rangeDate'
                                            className='mb-0 w-100'
                                        >
                                            <RangePicker
                                                allowClear={false}
                                                defaultValue={[
                                                    values.objectSearch
                                                        .fromDate,
                                                    values.objectSearch.toDate
                                                ]}
                                                style={{ width: '100%' }}
                                                clearIcon={false}
                                                onChange={handleChangeDate}
                                                disabled={values.isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Button
                                            type='primary'
                                            htmlType='submit'
                                            disabled={values.isLoading}
                                            onClick={() =>
                                                setTypeFilter('filter_date')
                                            }
                                        >
                                            Search
                                        </Button>
                                    </Col>
                                </Row>
                                <hr />
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={4}>Content Time:</Col>
                                    <Col span={15}>
                                        <Form.Item
                                            name='rangeBookingDate'
                                            className='mb-0 w-100'
                                        >
                                            <RangePicker
                                                allowClear={false}
                                                defaultValue={[
                                                    values.objectSearch
                                                        .fromBookingDate,
                                                    values.objectSearch
                                                        .toBookingDate
                                                ]}
                                                style={{ width: '100%' }}
                                                clearIcon={false}
                                                onChange={
                                                    handleChangeBookingDate
                                                }
                                                disabled={values.isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Button
                                            type='primary'
                                            htmlType='submit'
                                            disabled={values.isLoading}
                                            onClick={() =>
                                                setTypeFilter(
                                                    'filter_booking_date'
                                                )
                                            }
                                        >
                                            Search
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>
            {values.template_filters && values.template_filters.length > 0 && (
                <Tabs
                    defaultActiveKey={values.tab_key}
                    type='card'
                    onChange={onChangeTab}
                    items={values.template_filters.map((data, i) => {
                        return {
                            label: (
                                <>
                                    {data.label}{' '}
                                    <Badge count={data.total_unseen} />
                                </>
                            ),
                            key: `${data.obj_id}`,
                            children: (
                                <>
                                    <div className='text-right mb-4'>
                                        <Button
                                            onClick={() => seenNotification()}
                                        >
                                            Bỏ qua all
                                        </Button>
                                    </div>
                                    <Table
                                        columns={columns}
                                        dataSource={values.data}
                                        pagination={{
                                            defaultCurrent: values.page_number,
                                            pageSize: values.page_size,
                                            total: values.total,
                                            onChange: handleChangePagination,
                                            current: values.page_number
                                        }}
                                        scroll={{
                                            x: 500,
                                            y: 400
                                        }}
                                        loading={values.isLoading}
                                        sticky
                                        rowKey={(record: any) => record._id}
                                    />
                                </>
                            ),
                            disabled: values.isLoading
                        }
                    })}
                ></Tabs>
            )}
        </Card>
    )
}

export default Notifications
