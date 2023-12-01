import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Col,
    Row,
    DatePicker,
    DatePickerProps,
    Select,
    Input,
    notification,
    Spin
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _, { forEach } from 'lodash'
import BookingApi from 'api/BookingAPI'
import moment from 'moment'
import type { RangePickerProps } from 'antd/es/date-picker'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import TeacherAPI from 'api/TeacherAPI'
import PackageAPI from 'api/PackageAPI'
import { IModalProps } from 'const/common'
import { EnumBookingTypes } from 'const'
import { EnumPackageOrderType } from 'types'
import TeacherTrialAPI from 'api/TeacherTrialAPI'

const { Option } = Select

interface IProps extends IModalProps {
    data?: any
    reload: () => void
}

const UpdateTimeModal: FC<IProps> = ({
    visible,
    data,
    toggleModal,
    reload
}) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState<boolean>(false)
    const [listTime, setListTime] = useState([])
    const [listTeacher, setListTeacher] = useState([])
    const [page_number, setPageNumber] = useState<number>(1)
    const [startTime, setStartTime] = useState()
    const [total, setTotal] = useState<number>(0)
    const [packageInfo, setPackageInfo] = useState(null)

    const getPackageInfo = async (id) => {
        try {
            const res = await PackageAPI.getPackageInfo(id)
            if (res) {
                setPackageInfo(res)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                teacher: data?.teacher.full_name,
                old_time: moment(data?.calendar?.start_time).format(
                    'HH:mm DD/MM/YYYY'
                )
            })
            getPackageInfo(data.ordered_package.package_id)
        } else {
            form.resetFields()
        }
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            if (values.time) {
                const hours = values.time.split(':')[0]
                const minutes = values.time.split(':')[1]
                values.date.set({
                    hour: parseInt(hours, 10),
                    minute: parseInt(minutes, 10),
                    second: 0,
                    millisecond: 0
                })
            }
            const dataUpdate = {
                id: data._id,
                date: values.date.toDate().getTime(),
                teacher: values.new_teacher
            }

            BookingApi.editBookingTime(data._id, dataUpdate)
                .then((res) => {
                    notify('success', 'Update info successfully')
                    toggleModal(false)
                    reload()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, data]
    )
    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        const start_time = moment(data.calendar.start_time)
        const list = []
        let temp = moment(start_time)
        temp = moment(temp).add(30, 'minutes')
        const now = moment()
        if (now.format('YYYY-MM-DD') === dateString) {
            temp.set({
                hour: now.minute() > 30 ? now.hours() + 2 : now.hours() + 1,
                minute: now.minute() <= 30 ? 30 : 0,
                second: 0,
                millisecond: 0
            })
        } else {
            temp.set({
                hour: 7,
                minute: 0,
                second: 0,
                millisecond: 0
            })
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
            list.push(temp.format('HH:mm'))
        }
        while (temp.hours() !== 23) {
            list.push(temp.format('HH:mm'))
            temp = moment(temp).add(30, 'minutes')
        }
        setListTime(list)
        setLoading(true)
        form.setFieldsValue({ time: '' })
    }

    const getTeachersWithStartTime = (
        query?: {
            start_time: number
            page_size?: number
            page_number?: number
            location_id?: string
        },
        isLoadMore?
    ) => {
        setLoading(true)
        form.setFieldsValue({
            new_teacher: ''
        })
        const startTimeTemp = moment(query.start_time)
            .set('s', 0)
            .set('millisecond', 0)
            .valueOf()
        if (packageInfo) {
            query.location_id = packageInfo?.location_id
        }
        if (
            data &&
            data?.ordered_package?.type === EnumPackageOrderType.TRIAL
        ) {
            TeacherTrialAPI.getTrialTeacherProfiles({
                ...query,
                start_time: startTimeTemp
            })
                .then((res) => {
                    let dataRes = []
                    if (isLoadMore) {
                        dataRes = listTeacher
                        res.data.forEach((element) => {
                            const exits = dataRes.find(
                                (e) => e.id === element.teacher.id
                            )

                            if (!exits) {
                                dataRes.push(element.teacher)
                            }
                        })
                    } else {
                        res.data.forEach((element) => {
                            dataRes.push(element.teacher)
                        })
                    }
                    setListTeacher(dataRes)
                    setTotal(res.pagination.total)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            TeacherAPI.getTeachersByTime({
                ...query,
                start_time: startTimeTemp
            })
                .then((res) => {
                    let dataRes = res.data
                    if (isLoadMore) {
                        dataRes = listTeacher
                        res.data.forEach((element) => {
                            const exits = dataRes.find(
                                (e) => e.id === element.id
                            )
                            if (!exits) {
                                dataRes.push(element)
                            }
                        })
                    }
                    setListTeacher(dataRes)
                    setTotal(res.pagination.total)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }

    const onChangeTime = () => {
        const values = form.getFieldsValue()
        if (values.time) {
            const hours = values.time.split(':')[0]
            const minutes = values.time.split(':')[1]
            values.date.set({
                hour: parseInt(hours, 10),
                minute: parseInt(minutes, 10),
                second: 0,
                millisecond: 0
            })
        }
        const query = {
            start_time: values.date.toDate().getTime(),
            page_size: 50,
            page_number: 1
        }
        setPageNumber(1)
        setStartTime(values.date.toDate().getTime())
        getTeachersWithStartTime(query)
    }
    const loadMore = (event) => {
        const { target } = event
        if (
            !loading &&
            target &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            if (!total || page_number * 50 < total) {
                const query = {
                    start_time: startTime,
                    page_size: 50,
                    page_number: page_number + 1
                }
                getTeachersWithStartTime(query, true)
                setPageNumber(page_number + 1)
            }
        }
    }
    const searchTeacher = (text) => {
        if (text) {
            setPageNumber(1)
            const query = {
                start_time: startTime,
                page_size: 50,
                page_number: 1,
                search: text
            }
            getTeachersWithStartTime(query)
        }
    }

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        const customDate = moment().format('YYYY-MM-DD')
        return current && current < moment(customDate, 'YYYY-MM-DD')
    }
    const columns: ColumnsType = [
        {
            title: `Teacher`,
            dataIndex: 'teacher',
            key: 'teacher',
            render: (text, record) =>
                text && `${text.full_name} - ${text.username}`
        },
        {
            title: `Regular time`,
            dataIndex: 'regular_start_time',
            key: 'regular_start_time'
        }
    ]

    const renderBody = () => (
        <>
            <Form
                name='basic'
                layout='vertical'
                form={form}
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Old Teacher'
                            name='teacher'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Old Time'
                            name='old_time'
                        >
                            <Input disabled></Input>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Date'
                            name='date'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Date!'
                                }
                            ]}
                        >
                            <DatePicker
                                allowClear={false}
                                className='w-100'
                                onChange={onChange}
                                disabledDate={disabledDate}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='w-100'
                            label='Time'
                            name='time'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Time!'
                                }
                            ]}
                        >
                            <Select
                                defaultValue=''
                                style={{ width: '100%' }}
                                onChange={onChangeTime}
                            >
                                {listTime.map((item, index) => (
                                    <Option key={`${index}`} value={item}>
                                        {_.capitalize(item)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            className='w-100'
                            label='Teacher'
                            name='new_teacher'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select Teacher!'
                                }
                            ]}
                        >
                            <Select
                                defaultValue=''
                                style={{ width: '100%' }}
                                filterOption={false}
                                loading={loading}
                                onPopupScroll={loadMore}
                                showSearch
                                onSearch={_.debounce(searchTeacher, 300)}
                            >
                                {!loading &&
                                    listTeacher.map((item, index) => (
                                        <Option
                                            key={`${index}`}
                                            value={item.user_id}
                                        >
                                            {`${item.user?.full_name} - ${item.user?.username}`}
                                            ({item.average_rating}{' '}
                                            <i
                                                className='fa fa-star'
                                                style={{ color: '#ff9800' }}
                                                aria-hidden='true'
                                            ></i>
                                            )
                                        </Option>
                                    ))}
                                {loading && (
                                    <Option key='loading'>
                                        <Spin size='small' />
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )

    return (
        <Modal
            maskClosable={true}
            centered
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title='Update Time/Teacher'
            footer={[
                <Button
                    key='Close'
                    type='primary'
                    danger
                    onClick={() => handleClose()}
                >
                    Close
                </Button>,
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
            width={500}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(UpdateTimeModal)
