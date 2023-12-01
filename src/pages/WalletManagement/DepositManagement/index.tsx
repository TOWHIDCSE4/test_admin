/* eslint-disable react/no-danger */
import React, { useEffect, useState, useCallback, useReducer } from 'react'
import './index.css'
import {
    Row,
    Col,
    Card,
    Table,
    notification,
    Select,
    Collapse,
    Form,
    Button,
    Input,
    Timeline,
    Modal
} from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import _, { isNumber } from 'lodash'
import moment from 'moment'
import WalletAPI from 'api/WalletAPI'
import {
    EnumWalletHistoryType,
    EnumWalletHistoryStatus,
    OrderSource
} from 'const'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import UserAPI from 'api/UserAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import ModalHistory from './modal-history'
import ModalConfirm from './modal-confirm'
import ModalReject from './modal-reject'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select
const { Panel } = Collapse

const DepositManagement = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            objectSearch: {}
        }
    )
    const [isModalConfirmVisible, setModalConfirmVisible] = useState(false)
    const [isModalTimeLineVisible, setModalTimeLineVisible] = useState(false)
    const [isModalRejectVisible, setModalRejectVisible] = useState(false)
    const [timeLine, setTimeLine] = useState([])
    const [selectedItem, setSelectedItem] = useState({})

    const [form] = Form.useForm()

    const getData = async ({ page_size, page_number, objectSearch }) => {
        setValues({ isLoading: true })
        try {
            const searchData = {
                page_size,
                page_number,
                ...objectSearch
            }
            const res = await WalletAPI.getDepositWithdrawRequest(searchData)
            if (res) {
                setValues({ reports: res.data, total: res.pagination.total })
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
        setValues({ isLoading: false })
    }

    const refresh = () => {
        getData({
            page_size: values.page_size,
            page_number: values.page_number,
            objectSearch: values.objectSearch
        })
    }

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getData({
            page_number,
            page_size,
            objectSearch: values.objectSearch
        })
    }
    const onSearch = (valuesForm) => {
        setValues({
            objectSearch: valuesForm,
            page_number: 1
        })
        getData({
            page_size: values.page_size,
            page_number: 1,
            objectSearch: valuesForm
        })
    }

    useEffect(() => {
        form.setFieldsValue({
            ...values.objectSearch
        })
        getData({
            page_number: values.page_number,
            page_size: values.page_size,
            objectSearch: form.getFieldsValue()
        })
    }, [])

    const onReset = () => {
        const objectSearch = {
            month: moment().month() + 1,
            resolve_user_id: '',
            report_user_id: '',
            recommend_status: '',
            recommend_section: ''
        }
        form.setFieldsValue({
            ...objectSearch
        })
        setValues({
            objectSearch,
            page_number: 1
        })
        getData({
            page_size: values.page_size,
            page_number: 1,
            objectSearch
        })
    }
    const fetchUser = async (q) => {
        try {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
                // role: 'STUDENT',
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const renderStatus = () => {
        const options = []
        // eslint-disable-next-line guard-for-in
        for (const property in EnumWalletHistoryStatus) {
            const value = EnumWalletHistoryStatus[property]
            if (!isNumber(value)) {
                options.push(
                    <Option key={property} value={property}>
                        {value}
                    </Option>
                )
            }
        }
        return options
    }

    const renderSource = () => {
        const options = []
        // eslint-disable-next-line guard-for-in
        for (const property in OrderSource) {
            const value = OrderSource[property]
            if (!isNumber(value)) {
                options.push(
                    <Option key={property} value={property}>
                        {value}
                    </Option>
                )
            }
        }
        return options
    }

    const toggleModalHistory = useCallback(
        (value) => {
            setModalTimeLineVisible(value)
        },
        [isModalTimeLineVisible]
    )

    const toggleModalConfirm = useCallback(
        (value) => {
            setModalConfirmVisible(value)
        },
        [isModalConfirmVisible]
    )

    const toggleModalReject = useCallback(
        (value) => {
            setModalRejectVisible(value)
        },
        [isModalRejectVisible]
    )

    const columns: any = [
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            align: 'left',
            width: 150,
            render: (text, record: any) => {
                return (
                    <>
                        {moment(record.created_time).format('DD/MM/YYYY HH:mm')}
                    </>
                )
            }
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            align: 'left',
            width: 200,
            render: (text, record: any) => {
                if (text)
                    return (
                        <NameTeacherStudent
                            data={text}
                            type='student'
                        ></NameTeacherStudent>
                    )
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'left',
            width: 100,
            render: (text, record: any) => {
                return <>{EnumWalletHistoryType[text]}</>
            }
        },

        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'left',
            width: 100,
            render: (text, record: any) => {
                return <>{Intl.NumberFormat('en-US').format(text)}</>
            }
        },
        {
            title: 'iXu',
            dataIndex: 'coin',
            key: 'coin',
            align: 'left',
            width: 100,
            render: (text, record: any) => {
                return <>{Intl.NumberFormat('en-US').format(text)}</>
            }
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            align: 'left',
            width: 100,
            render: (text, record: any) => {
                return <>{text}</>
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            align: 'left',
            width: 200,
            render: (text, record: any) => {
                return <>{text}</>
            }
        },
        {
            title: 'Info',
            dataIndex: 'source',
            key: 'source',
            align: 'left',
            width: 200,
            render: (text, record: any) => {
                const html = []
                if (text) html.push(<p>Source : {text}</p>)
                if (record.source_data?.ACCOUNT_NAME)
                    html.push(
                        <p>ACCOUNT_NAME : {record.source_data?.ACCOUNT_NAME}</p>
                    )
                if (record.source_data?.ACCOUNT_NO)
                    html.push(
                        <p>ACCOUNT_NO : {record.source_data?.ACCOUNT_NO}</p>
                    )
                if (record.source_data?.AMOUNT)
                    html.push(
                        <p>
                            AMOUNT :{' '}
                            {Intl.NumberFormat('en-US').format(
                                record.source_data?.AMOUNT
                            )}
                        </p>
                    )
                if (record.source_data?.BANK_ID)
                    html.push(<p>BANK_ID : {record.source_data?.BANK_ID}</p>)
                if (record.source_data?.DESCRIPTION)
                    html.push(
                        <p>DESCRIPTION : {record.source_data?.DESCRIPTION}</p>
                    )
                return html
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            width: 100,
            render: (text, record: any) => {
                return <>{EnumWalletHistoryStatus[text]}</>
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 100,
            render: (text, record: any) => {
                const arrButton = []
                if (record.history.length) {
                    arrButton.push(
                        <Button
                            className='m-1  w-100'
                            type='primary'
                            onClick={() => {
                                setTimeLine(record.history)
                                toggleModalHistory(true)
                            }}
                        >
                            History
                        </Button>
                    )
                }

                if (
                    record.status === EnumWalletHistoryStatus.PROCESSING ||
                    record.status === EnumWalletHistoryStatus.FAILED
                ) {
                    if (checkPermission(PERMISSIONS.wmdm_approve)) {
                        arrButton.push(
                            <Button
                                className='m-1 w-100'
                                type='primary'
                                onClick={() => {
                                    setSelectedItem(record)
                                    toggleModalConfirm(true)
                                }}
                            >
                                Approve
                            </Button>
                        )
                    }
                    if (checkPermission(PERMISSIONS.wmdm_reject)) {
                        arrButton.push(
                            <Button
                                className='m-1  w-100'
                                type='primary'
                                danger
                                onClick={() => {
                                    setSelectedItem(record)
                                    toggleModalReject(true)
                                }}
                            >
                                Reject
                            </Button>
                        )
                    }
                }
                return arrButton
            }
        }
    ]

    return (
        <Card title='Deposit Management'>
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
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Student:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='user_id'
                                            className='mb-0 w-100'
                                        >
                                            <DebounceSelect
                                                placeholder='By name , username'
                                                fetchOptions={fetchUser}
                                                allowClear
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Code:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='code'
                                            className='mb-0 w-100'
                                        >
                                            <Input allowClear></Input>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Source:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='source'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                allowClear
                                            >
                                                {renderSource()}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={12}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Status:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='status'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                allowClear
                                            >
                                                {renderStatus()}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            <Col>
                                <Button
                                    type='primary'
                                    danger
                                    onClick={() => onReset()}
                                >
                                    Reset
                                </Button>
                            </Col>
                            <Col>
                                <Button type='primary' htmlType='submit'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>
            <Table
                className='student-management-table'
                size='small'
                columns={columns.filter((e) => !e.hidden)}
                dataSource={values.reports}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                scroll={{
                    x: 500,
                    y: 500
                }}
                loading={values.isLoading}
                sticky
                rowKey='_id'
            />
            <ModalHistory
                timeLine={timeLine}
                visible={isModalTimeLineVisible}
                toggleModal={toggleModalHistory}
            ></ModalHistory>

            <ModalConfirm
                item={selectedItem}
                visible={isModalConfirmVisible}
                toggleModal={toggleModalConfirm}
                refresh={refresh}
            ></ModalConfirm>

            <ModalReject
                item={selectedItem}
                visible={isModalRejectVisible}
                toggleModal={toggleModalReject}
                refresh={refresh}
            ></ModalReject>
        </Card>
    )
}

export default DepositManagement
