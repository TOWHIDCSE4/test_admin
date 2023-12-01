import { useCallback, useEffect, useReducer, useState } from 'react'
import {
    Table,
    Card,
    notification,
    DatePicker,
    Row,
    Col,
    Tag,
    Button,
    Form,
    Collapse,
    Spin
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import { notify } from 'utils/notify'
import { DATE_FORMAT } from 'const'
import _ from 'lodash'
import DetailTrialProportionModal from './modals/DetailTrialProportionModal'

const TrialReport = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data_reports: [],
            isLoading: false,
            start_time: moment().startOf('month'),
            end_time: moment().endOf('month')
        }
    )

    const [visibleModal, setVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [form] = Form.useForm()
    const { Panel } = Collapse

    const fetchReport = useCallback(
        ({ start_time, end_time }) => {
            setValues({ isLoading: true })
            ReportAPI.getTrialProportion({
                start_time: start_time.valueOf(),
                end_time: end_time.valueOf()
            })
                .then((res) => {
                    setValues({ data_reports: res.data })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    useEffect(() => {
        form.setFieldValue('month', values.start_time)
        fetchReport({ ...values })
    }, [])

    // const handlerDateFilter = useCallback(
    //     (v) => {
    //         setValues({ start_time: v })
    //     },
    //     [values]
    // )

    const onSearch = (valuesForm) => {
        setValues({
            start_time: moment(valuesForm.month).startOf('month'),
            end_time: moment(valuesForm.month).endOf('month')
        })
        fetchReport({
            start_time: moment(valuesForm.month).startOf('month'),
            end_time: moment(valuesForm.month).endOf('month')
        })
    }

    const onDetail = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
        },
        [visibleModal, selectedItem]
    )

    const toggleModal = (val: boolean) => {
        setVisible(val)
    }

    const columns: ColumnsType<any> = [
        {
            title: 'Sale',
            dataIndex: 'sale_name',
            key: 'sale_name',
            fixed: true,
            width: 150,
            align: 'center',
            render: (text, record: any, index) =>
                index === 0 ? <b>{text}</b> : text
        },
        {
            title: 'Tổng số HV học trial',
            dataIndex: 'trial_student_number',
            key: 'trial_student_number',
            width: 150,
            align: 'center',
            render: (text, record: any, index) =>
                index === 0 ? (
                    <Tag color='#FAAD14'>
                        <b style={{ fontWeight: 800, padding: 10 }}>{text}</b>
                    </Tag>
                ) : (
                    <Tag color='#FAAD14'>{text}</Tag>
                )
        },
        {
            title: 'Số học viên đã mua gói chính',
            dataIndex: 'paid_student_number',
            key: 'paid_student_number',
            align: 'center',
            width: 150,
            render: (text, record: any, index) =>
                index === 0 ? (
                    <Tag color='#108ee9'>
                        <b style={{ fontWeight: 800, padding: 10 }}>{text}</b>
                    </Tag>
                ) : (
                    <Tag color='#108ee9'>{text}</Tag>
                )
        },
        {
            title: 'Tỉ lệ(%)',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 120,
            align: 'center',
            render: (text, record: any, index) => {
                const per =
                    record?.trial_student_number &&
                    record?.paid_student_number &&
                    record?.paid_student_number > 0 &&
                    record?.trial_student_number > 0
                        ? _.round(
                              (record?.paid_student_number /
                                  record?.trial_student_number) *
                                  100,
                              2
                          )
                        : 0
                return index === 0 ? (
                    <b style={{ color: '#52C41A', fontWeight: 800 }}>{per}%</b>
                ) : (
                    <b style={{ color: '#52C41A' }}>{per}%</b>
                )
            }
        },
        {
            title: 'Chi tiết',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record: any, index) =>
                index === 0 ? (
                    <></>
                ) : (
                    <Button
                        type='primary'
                        shape='round'
                        onClick={() => onDetail(record)}
                        title='Detail'
                    >
                        View
                    </Button>
                )
        }
    ]

    return (
        <Card title='BÁO CÁO TỶ LỆ TRIAL'>
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
                                    <Col span={4}>Month:</Col>
                                    <Col span={10}>
                                        <Form.Item
                                            name='month'
                                            className='mb-0 w-100'
                                        >
                                            <DatePicker
                                                format='MM-YYYY'
                                                allowClear={false}
                                                picker='month'
                                                value={values.start_time}
                                                // onChange={handlerDateFilter}
                                                disabledDate={(current) =>
                                                    current >= moment()
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Button
                                            type='primary'
                                            disabled={values.isLoading}
                                            htmlType='submit'
                                        >
                                            <Spin
                                                size='small'
                                                className='mr-2'
                                                spinning={values.isLoading}
                                            />
                                            View
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>

            <Table
                bordered
                dataSource={values.data_reports}
                columns={columns}
                loading={values.isLoading}
                rowKey={(record: any) => record?.sale_id}
                pagination={false}
                scroll={{
                    x: 500,
                    y: 768
                }}
                sticky
            />
            <DetailTrialProportionModal
                data={selectedItem}
                visible={visibleModal}
                toggleModal={toggleModal}
                start_time={values.start_time}
                end_time={values.end_time}
            />
        </Card>
    )
}

export default TrialReport
