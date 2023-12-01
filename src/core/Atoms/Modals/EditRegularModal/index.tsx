import { FC, memo, useEffect, useState } from 'react'
import {
    Modal,
    Form,
    Select,
    Row,
    Col,
    Button,
    Table,
    TimePicker,
    Popconfirm
} from 'antd'
import {
    EditOutlined,
    CheckSquareOutlined,
    CloseOutlined,
    DeleteOutlined
} from '@ant-design/icons'
import { IRegularCalendar, IUser } from 'types'
import {
    formatTimestamp,
    getTimestampInWeekToLocal,
    getTimestampInWeekToUTC,
    moduloTimestamp
} from 'utils'
import { notify } from 'utils/notify'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { DAY_TO_MS, EnumDaysOfWeek, HOUR_TO_MS, MINUTE_TO_MS } from 'const'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table'
import UserAPI from 'api/UserAPI'
import RegularCalendarAPI from 'api/AutomaticSchedulingAPI'
import { RoleCode } from 'const/role'
import NameTeacherStudent from 'components/name-teacher-student'

const { Option } = Select
type Props = {
    visible: boolean
    toggleModal: (val: boolean) => void
    data: IUser
    refetchData: () => void
}

const EditRegularModal: FC<Props> = ({
    visible,
    toggleModal,
    data,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [regularTimes, setRegularTimes] = useState([])
    const [regularCalendars, setRegularCalendars] = useState<
        IRegularCalendar[]
    >([])
    const [isAddMore, setAddMore] = useState(false)
    const [editRegularTimeId, setEditRegularTimeId] = useState(-1)

    const getRegularCalendars = (user_id: number) => {
        setLoading(true)
        const query: any = {
            page_size: 100,
            page_number: 1
        }
        if (data.role.includes(RoleCode.STUDENT)) {
            query.student_id = user_id
        } else if (data.role.includes(RoleCode.TEACHER)) {
            query.teacher_id = user_id
        }
        RegularCalendarAPI.getAutomaticScheduling(query) // get all regular calendars of student
            .then((res) => {
                setRegularCalendars(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (visible && !_.isEmpty(data)) {
            const regularTimesLocal = data.regular_times
                ? _.clone(data.regular_times).map((t) =>
                      getTimestampInWeekToLocal(t)
                  )
                : []
            setRegularTimes(regularTimesLocal)
            getRegularCalendars(data.id)
        }
    }, [data, visible])

    const onReset = () => {
        setLoading(false)
        setAddMore(false)
        setEditRegularTimeId(-1)
    }

    const onClose = () => {
        toggleModal(false)
    }

    const onSaveRegularTime = async (_values: any) => {
        const cloneForm = _.clone(_values)
        const { day_of_week, time } = cloneForm
        const hours = time.clone().hour()
        const minutes = time.clone().minutes()
        const _time =
            day_of_week * DAY_TO_MS +
            hours * HOUR_TO_MS +
            minutes * MINUTE_TO_MS
        if (hours < 7) {
            notify('error', 'You need select time greater 7 hours')
        } else if (hours > 22) {
            notify('error', 'You need select time less 22 hours')
        } else if (editRegularTimeId === -1 && regularTimes.includes(_time)) {
            notify('error', 'You have regular time with same time')
        } else {
            let diff = [...regularTimes, _time]
            if (editRegularTimeId > 0) {
                const new_regular_times = [...regularTimes]
                new_regular_times[
                    _.indexOf(new_regular_times, editRegularTimeId)
                ] = _time
                diff = new_regular_times
            }
            try {
                setLoading(true)
                const convertToUtc = _.clone(diff).map((t) =>
                    getTimestampInWeekToUTC(t)
                )
                await UserAPI.editUser(data.id, { regular_times: convertToUtc })
                setRegularTimes(diff)
                onReset()
                refetchData()
                notify('success', 'Update successfully')
            } catch (err) {
                notify('error', err.message)
            } finally {
                setLoading(false)
            }
        }
    }

    const onRemoveRegularTime = async (item) => {
        const diff = [...regularTimes]
        _.remove(diff, (o) => o === item)
        const convertToUtc = _.clone(diff).map((t) =>
            getTimestampInWeekToUTC(t)
        )
        try {
            setLoading(true)
            await UserAPI.editUser(data.id, { regular_times: convertToUtc })
            setRegularTimes(diff)
            onReset()
            refetchData()
            notify('success', 'Remove successfully')
        } catch (err) {
            notify('error', err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderDaysOfWeek = () =>
        Object.keys(EnumDaysOfWeek)
            .filter((key: any) => !isNaN(Number(EnumDaysOfWeek[key])))
            .map((key: any) => (
                <Option value={EnumDaysOfWeek[key]} key={key}>
                    {key}
                </Option>
            ))

    const getDisabledHours = () => [0, 1, 2, 3, 4, 5, 6, 23, 24] // disable if hour < 7 or hour > 22

    const renderRegularTimes = () => {
        if (regularTimes.length > 0) {
            const newRegularTimes = regularTimes.filter(
                (i) =>
                    !regularCalendars
                        .map((x) =>
                            getTimestampInWeekToLocal(x.regular_start_time)
                        )
                        .includes(i)
            )
            return newRegularTimes.map((item, index) => {
                const parseTime = moduloTimestamp(item)
                const disabled = item !== editRegularTimeId
                return (
                    <Form
                        key={nanoid()}
                        onFinish={onSaveRegularTime}
                        layout='vertical'
                        labelCol={{ span: 22 }}
                        wrapperCol={{ span: 24 }}
                        initialValues={{
                            day_of_week: parseTime.day,
                            time: moment(
                                `${parseTime.hour}:${parseTime.minute}`,
                                'HH:mm'
                            )
                        }}
                    >
                        <Row gutter={[20, 10]}>
                            <Col sm={24} md={8}>
                                <Form.Item
                                    name='day_of_week'
                                    rules={[
                                        {
                                            required: true,
                                            message: `Day of week is required`
                                        }
                                    ]}
                                >
                                    <Select
                                        disabled={disabled}
                                        placeholder='Choose day'
                                    >
                                        {renderDaysOfWeek()}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col sm={12} md={4}>
                                <Form.Item
                                    name='time'
                                    rules={[
                                        {
                                            required: true,
                                            message: `Time is required`
                                        }
                                    ]}
                                >
                                    <TimePicker
                                        format='HH:mm'
                                        minuteStep={30}
                                        disabled={disabled}
                                        disabledHours={getDisabledHours}
                                    />
                                </Form.Item>
                            </Col>
                            <Col sm={12} md={8}>
                                <Form.Item>
                                    <>
                                        {editRegularTimeId !== -1 &&
                                        item === editRegularTimeId ? (
                                            <>
                                                <Button
                                                    htmlType='submit'
                                                    icon={
                                                        <CheckSquareOutlined />
                                                    }
                                                    className='ml-3 border-0'
                                                />
                                                <Popconfirm
                                                    placement='top'
                                                    title='Are you sure remove this item?'
                                                    onConfirm={() =>
                                                        onRemoveRegularTime(
                                                            item
                                                        )
                                                    }
                                                    okText='Ok'
                                                    cancelText='Cancel'
                                                >
                                                    <Button
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        className='ml-3 border-0'
                                                    />
                                                </Popconfirm>

                                                <Button
                                                    icon={<CloseOutlined />}
                                                    className='ml-3 border-0'
                                                    onClick={() => onReset()}
                                                />
                                            </>
                                        ) : (
                                            editRegularTimeId === -1 && (
                                                <Button
                                                    icon={<EditOutlined />}
                                                    className='ml-3 border-0'
                                                    onClick={() =>
                                                        setEditRegularTimeId(
                                                            item
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                )
            })
        }
    }

    const columns: ColumnsType<IRegularCalendar> = [
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 200,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='teacher'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            width: 200,
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 250,
            render: (text, record) => text && text.name
        },
        {
            title: 'Regular time',
            dataIndex: 'regular_start_time',
            key: 'regular_start_time',
            width: 200,
            fixed: 'right',
            render: (text, record) => {
                const convertToLocal = getTimestampInWeekToLocal(text)
                return formatTimestamp(convertToLocal)
            }
        }
    ]

    return (
        <Modal
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={`Edit regular time - ${data?.full_name} - ${data?.username}`}
            width={850}
            centered
            footer={null}
        >
            {regularCalendars.length > 0 && (
                <Table
                    bordered
                    dataSource={regularCalendars}
                    columns={columns}
                    pagination={{
                        defaultCurrent: 1,
                        pageSize: 10,
                        total: regularCalendars.length
                    }}
                    rowKey={(record: IRegularCalendar) => record?._id}
                    scroll={{
                        x: 300,
                        y: 300
                    }}
                />
            )}

            <div
                style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                {renderRegularTimes()}
            </div>
            {isAddMore && (
                <Form
                    form={form}
                    onFinish={onSaveRegularTime}
                    layout='vertical'
                    labelCol={{ span: 22 }}
                    wrapperCol={{ span: 24 }}
                >
                    <Row gutter={[20, 20]}>
                        <Col span={8}>
                            <Form.Item
                                name='day_of_week'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select days of week!'
                                    }
                                ]}
                            >
                                <Select placeholder='Choose day'>
                                    {renderDaysOfWeek()}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item
                                name='time'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select time!'
                                    }
                                ]}
                            >
                                <TimePicker
                                    format='HH:mm'
                                    minuteStep={30}
                                    disabledHours={getDisabledHours}
                                    defaultValue={moment()
                                        .set('h', 7)
                                        .set('m', 30)}
                                    className='w-100'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <>
                                    <Button
                                        htmlType='submit'
                                        icon={<CheckSquareOutlined />}
                                        className='ml-3 border-0'
                                    />
                                    <Button
                                        icon={<CloseOutlined />}
                                        className='border-0'
                                        onClick={() => onReset()}
                                    />
                                </>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            )}

            {!isAddMore && editRegularTimeId === -1 && (
                <Row>
                    <Col offset={9}>
                        <Button
                            type='primary'
                            disabled={loading}
                            onClick={() => setAddMore(true)}
                        >
                            <span>Add more</span>
                        </Button>
                    </Col>
                </Row>
            )}
        </Modal>
    )
}

export default memo(EditRegularModal)
