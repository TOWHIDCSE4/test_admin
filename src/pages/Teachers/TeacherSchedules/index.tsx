/* eslint-disable react/button-has-type */
import {
    Card,
    Collapse,
    DatePicker,
    notification,
    Pagination,
    PaginationProps,
    Select,
    Space,
    Spin,
    Row,
    Col,
    Form,
    Button,
    TimePicker
} from 'antd'
import TeacherAPI from 'api/TeacherAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { EnumTeacherStatus } from 'const/status'
import _ from 'lodash'
import moment from 'moment'
import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import './style.scss'
import TeacherBox from './TeacherBox'

import SearchUser from 'components/search-user-with-lazy-load'
import LocationAPI from 'api/LocationAPI'
import { notify } from 'utils/notify'
import { ILocation } from 'types'
import { RangePickerProps } from 'antd/lib/date-picker'
import { DAY_OF_WEEK_OPTION, DAY_TO_MS, HOUR_TO_MS, MINUTE_TO_MS } from 'const'
import Search from 'antd/lib/transfer/search'
import { getTimestampInWeekToUTC } from 'utils/datetime'

const { Option } = Select
const { RangePicker } = DatePicker
const { Panel } = Collapse

const TeacherSchedules = () => {
    const childRef = useRef(null)
    const [form] = Form.useForm()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            teachers: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            search: '',
            location_id: '',
            time: moment().set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            }),
            locations: [],
            teacher_id: null,
            filter_type: 'filter_1',
            fromDate: moment().set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            }),
            toDate: moment().set({
                hour: 23,
                minute: 0,
                second: 0,
                millisecond: 0
            }),
            weekDay: '',
            fromTime: moment().set('h', 7).set('m', 0),
            toTime: moment().set('h', 22).set('m', 30),
            selectedTeacher: []
        }
    )

    const [filterTeacher, setFilterTeacher] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            status: 'active',
            search: ''
        }
    )

    const getRegularTime = (fromTime, toTime, weekDay) => {
        const arrayRegularTime = []
        const startTime =
            fromTime.hour() * HOUR_TO_MS + fromTime.minute() * MINUTE_TO_MS
        const endTime =
            toTime.hour() * HOUR_TO_MS + toTime.minute() * MINUTE_TO_MS
        if (!weekDay) {
            for (let i = 0; i < 7; i++) {
                const regularFromTime = getTimestampInWeekToUTC(
                    i * DAY_TO_MS + startTime
                )
                const regularToTime = getTimestampInWeekToUTC(
                    i * DAY_TO_MS + endTime
                )
                arrayRegularTime.push({
                    start_time: regularFromTime,
                    end_time: regularToTime
                })
            }
        } else {
            const regularFromTime = getTimestampInWeekToUTC(
                weekDay * DAY_TO_MS + startTime
            )
            const regularToTime = getTimestampInWeekToUTC(
                weekDay * DAY_TO_MS + endTime
            )
            arrayRegularTime.push({
                start_time: regularFromTime,
                end_time: regularToTime
            })
        }
        return arrayRegularTime
    }

    const getTeacherSchedule = useCallback(
        ({
            page_size,
            page_number,
            search,
            location_id,
            teacher_id,
            filter_type,
            time,
            weekDay,
            fromDate,
            toDate,
            fromTime,
            toTime
        }) => {
            setValues({ isLoading: true })
            let arrRegularTime = []
            if (filter_type === 'filter_2') {
                arrRegularTime = getRegularTime(fromTime, toTime, weekDay)
            }

            TeacherAPI.getAllTeachers({
                page_size,
                page_number,
                search,
                location_id,
                status: EnumTeacherStatus.ACTIVE,
                teacher_id,
                filter_type,
                weekDay,
                regular_time: JSON.stringify(arrRegularTime)
            })
                .then((res) => {
                    let total = 0
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ teachers: res.data, total })
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

    const onPageChange = (page_number, page_size) => {
        console.log('onPageChange', page_number, page_size)
        setValues({
            page_number,
            page_size
        })
        getTeacherSchedule({ ...values, page_number, page_size })
    }

    const onChangeDate = async (val) => {
        setValues({
            time: val.set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            })
        })
        // await getTeacherSchedule({
        //     ...values,
        //     time: val.set({
        //         hour: 0,
        //         minute: 0,
        //         second: 0,
        //         millisecond: 0
        //     })
        // })
    }

    const searchDataUser = (data) => {
        values.selectedTeacher = data
    }

    const getLocations = () => {
        LocationAPI.getLocations()
            .then((res) => {
                setValues({
                    locations: res.data
                })
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const onChangeLocation = useCallback(
        (id) => {
            setValues({
                page_number: 1,
                search: '',
                total: 1,
                location_id: id,
                teacher_id: null
            })
            getTeacherSchedule({
                ...values,
                teachers: [],
                page_number: 1,
                search: '',
                location_id: id === -1 ? '' : id,
                teacher_id: null
            })
            childRef.current.setValuesChild({
                page_number: 1,
                total: 1,
                search: '',
                location_id: id === -1 ? '' : id
            })
        },
        [values.location_id]
    )
    const renderLocations = () => {
        return values.locations.map((e, index) => (
            <Select.Option key={e.id} value={e.id}>
                {e.name}
            </Select.Option>
        ))
    }

    const renderWeekdays = () => {
        return DAY_OF_WEEK_OPTION.map((e, index) => (
            <Select.Option key={e.value} value={e.value}>
                {e.title}
            </Select.Option>
        ))
    }
    const onSearch = (valuesForm: any) => {
        const data = values.selectedTeacher
        if (values.filter_type === 'filter_1') {
            setValues({
                location_id: valuesForm.location_id,
                time: valuesForm.date.set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                })
            })
            values.time = valuesForm.date.set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            })
            if (data.selected) {
                setValues({
                    teachers: [data.selected],
                    page_number: 1,
                    search: '',
                    total: 1
                })
                values.teacher_id = data.selected.user_id
                values.page_number = 1
            }
            if (data.clear) {
                setValues({ page_number: 1, search: '', teacher_id: null })
            }
        } else if (values.filter_type === 'filter_2') {
            setValues({
                location_id: valuesForm.location_id,
                page_number: 1,
                search: '',
                weekDay: valuesForm.weekday,
                fromDate:
                    valuesForm.range_date && valuesForm.range_date[0]
                        ? valuesForm.range_date[0].set({
                              hour: 0,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                          })
                        : moment().set({
                              hour: 0,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                          }),
                toDate:
                    valuesForm.range_date && valuesForm.range_date[1]
                        ? valuesForm.range_date[1].set({
                              hour: 23,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                          })
                        : moment().set({
                              hour: 23,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                          }),
                fromTime:
                    valuesForm.from_time ?? moment().set('h', 7).set('m', 0),
                toTime: valuesForm.to_time ?? moment().set('h', 22).set('m', 30)
            })
            values.page_number = 1
            values.weekDay = valuesForm.weekday
            values.fromDate =
                valuesForm.range_date && valuesForm.range_date[0]
                    ? valuesForm.range_date[0].set({
                          hour: 0,
                          minute: 0,
                          second: 0,
                          millisecond: 0
                      })
                    : moment().set({
                          hour: 0,
                          minute: 0,
                          second: 0,
                          millisecond: 0
                      })
            values.toDate =
                valuesForm.range_date && valuesForm.range_date[1]
                    ? valuesForm.range_date[1].set({
                          hour: 23,
                          minute: 0,
                          second: 0,
                          millisecond: 0
                      })
                    : moment().set({
                          hour: 23,
                          minute: 0,
                          second: 0,
                          millisecond: 0
                      })
            values.fromTime =
                valuesForm.from_time ?? moment().set('h', 7).set('m', 0)
            values.toTime =
                valuesForm.to_time ?? moment().set('h', 22).set('m', 30)
        }
        getTeacherSchedule({
            ...values
        })
    }

    const reload = () => {
        onSearch(form.getFieldsValue())
    }

    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                fromDate: value[0],
                toDate: value[1]
            })
        }
    }

    const disabledTime = () => ({
        disabledHours: () => _.range(0, 7).concat([23])
    })

    const setTypeFilter = (type) => {
        setValues({ filter_type: type })
    }

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        // Can not select days before today and today
        return (
            current &&
            (current < moment().startOf('day') ||
                current >
                    moment().endOf('day').add({
                        day: 14
                    }))
        )
    }

    // const filterEngines: IFilterEngine[] = [
    //     {
    //         label: 'Location',
    //         engine: (
    //             <Select
    //                 allowClear={false}
    //                 showSearch
    //                 showArrow
    //                 style={{ minWidth: 200, width: 'auto' }}
    //                 placeholder='Filter by location'
    //                 optionFilterProp='children'
    //                 value={values.location_id}
    //                 defaultValue={values.location_id}
    //                 onChange={onChangeLocation}
    //                 filterOption={(input, option) =>
    //                     _.isString(option.children) &&
    //                     option.children
    //                         .toLowerCase()
    //                         .indexOf(input.toLowerCase()) >= 0
    //                 }
    //             >
    //                 <Select.Option value=''>All</Select.Option>
    //                 {renderLocations()}
    //             </Select>
    //         )
    //     },
    //     {
    //         label: 'Choose Teacher',
    //         engine: (
    //             <SearchUser
    //                 ref={childRef}
    //                 api={TeacherAPI.getAllTeachers}
    //                 placeholder='Search by teacher'
    //                 searchDataUser={searchDataUser}
    //                 filter={filterTeacher}
    //             ></SearchUser>
    //         )
    //     },
    //     {
    //         label: 'Date time',
    //         engine: (
    //             <DatePicker
    //                 allowClear={false}
    //                 defaultValue={moment()}
    //                 // onChange={onChangeDate}
    //                 // disabled={values.teachers.length === 1}
    //             />
    //         )
    //     }
    // ]

    const renderTeacher = useCallback(
        (e) => {
            const time = values.time.clone()
            if (values.filter_type === 'filter_1') {
                if (values.teachers.length > 1) {
                    return (
                        <TeacherBox
                            key={e.user_id}
                            filter_type={values.filter_type}
                            time={time}
                            teacher={e}
                        ></TeacherBox>
                    )
                }
                const arr = []
                for (let index = 0; index < 7; index++) {
                    arr.push(
                        <TeacherBox
                            key={e.user_id + index}
                            filter_type={values.filter_type}
                            time={time.clone()}
                            teacher={e}
                        ></TeacherBox>
                    )
                    time.add(1, 'day')
                }
                return arr
            }
            if (values.filter_type === 'filter_2') {
                const start_date = values.fromDate.clone()
                const end_date = values.toDate.clone()
                const arr = []
                const countDay = end_date.diff(start_date, 'days')
                for (let index = 0; index <= countDay; index++) {
                    if (
                        (!values.weekDay && values.weekDay !== 0) ||
                        start_date.day() === values.weekDay
                    ) {
                        arr.push(
                            <TeacherBox
                                key={e.user_id + index}
                                filter_type={values.filter_type}
                                time={start_date.clone()}
                                teacher={e}
                                toDate={values.toDate}
                                weekDay={values.weekDay}
                                fromTime={values.fromTime}
                                toTime={values.toTime}
                            ></TeacherBox>
                        )
                    }
                    start_date.add(1, 'day')
                }
                return arr
            }
        },
        [values.teachers]
    )

    useEffect(() => {
        getLocations()
        getTeacherSchedule(values)
        const objectFilter2 = {
            location_id: values.location_id,
            teacher_id: values.teacher_id,
            date: values.time
        }
        form.setFieldsValue({
            ...objectFilter2
        })
    }, [])

    return (
        <>
            <Card title='Teacher Schedules'>
                {/* <FilterDataWrapper engines={filterEngines}></FilterDataWrapper> */}
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
                            <Row
                                className='mb-2 justify-content-start'
                                gutter={12}
                            >
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={8}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={22}>Location</Col>
                                        <Col span={22}>
                                            <Form.Item
                                                name='location_id'
                                                className='mb-0 w-100'
                                            >
                                                <Select
                                                    allowClear={false}
                                                    showSearch
                                                    showArrow
                                                    style={{
                                                        minWidth: 200
                                                    }}
                                                    placeholder='Filter by location'
                                                    optionFilterProp='children'
                                                    value={values.location_id}
                                                    defaultValue={
                                                        values.location_id
                                                    }
                                                    onChange={onChangeLocation}
                                                    filterOption={(
                                                        input,
                                                        option
                                                    ) =>
                                                        _.isString(
                                                            option.children
                                                        ) &&
                                                        option.children
                                                            .toLowerCase()
                                                            .indexOf(
                                                                input.toLowerCase()
                                                            ) >= 0
                                                    }
                                                >
                                                    <Select.Option value=''>
                                                        All
                                                    </Select.Option>
                                                    {renderLocations()}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <hr />
                            <Row
                                className='mb-2 justify-content-start'
                                gutter={12}
                            >
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={8}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={22}>Choose Teacher</Col>
                                        <Col span={22}>
                                            <Form.Item
                                                name='teacher_id'
                                                className='mb-0 w-100'
                                            >
                                                <SearchUser
                                                    ref={childRef}
                                                    api={
                                                        TeacherAPI.getAllTeachers
                                                    }
                                                    placeholder='Search by teacher'
                                                    searchDataUser={
                                                        searchDataUser
                                                    }
                                                    filter={filterTeacher}
                                                ></SearchUser>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={6}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={20}>Date time</Col>
                                        <Col span={20}>
                                            <Form.Item
                                                name='date'
                                                className='mb-0 w-100'
                                            >
                                                <DatePicker
                                                    className='w-100'
                                                    allowClear={false}
                                                    defaultValue={moment()}
                                                    onChange={onChangeDate}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={7}
                                ></Col>
                                <Col style={{ marginTop: 21 }}>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        onClick={() =>
                                            setTypeFilter('filter_1')
                                        }
                                    >
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                            <hr />
                            <Row
                                className='mb-2 justify-content-start'
                                gutter={12}
                            >
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={8}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={22}>Range Date</Col>
                                        <Col span={22}>
                                            <Form.Item
                                                name='range_date'
                                                className='mb-0 w-100'
                                            >
                                                <RangePicker
                                                    allowClear={false}
                                                    defaultValue={[
                                                        values.fromDate,
                                                        values.toDate
                                                    ]}
                                                    disabledDate={disabledDate}
                                                    style={{ width: '100%' }}
                                                    clearIcon={false}
                                                    // onChange={handleChangeDate}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={6}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={20}>Choose day</Col>
                                        <Col span={20}>
                                            <Form.Item
                                                name='weekday'
                                                className='mb-0 w-100'
                                            >
                                                <Select
                                                    defaultValue=''
                                                    style={{ width: '100%' }}
                                                    loading={values.isLoading}
                                                >
                                                    <Select.Option value=''>
                                                        All
                                                    </Select.Option>
                                                    {renderWeekdays()}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col
                                    className='d-flex align-items-center mb-2'
                                    span={7}
                                >
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={22}>Start Time</Col>
                                        <Col span={22}>
                                            <Form.Item
                                                name='from_time'
                                                className='mb-0 w-100'
                                            >
                                                <TimePicker
                                                    format='HH:mm'
                                                    minuteStep={30}
                                                    disabledTime={disabledTime}
                                                    defaultValue={moment()
                                                        .set('h', 7)
                                                        .set('m', 30)}
                                                    className='w-100'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row className='w-100 d-flex align-items-center'>
                                        <Col span={22}>End Time</Col>
                                        <Col span={22}>
                                            <Form.Item
                                                name='to_time'
                                                className='mb-0 w-100'
                                            >
                                                <TimePicker
                                                    format='HH:mm'
                                                    minuteStep={30}
                                                    disabledTime={disabledTime}
                                                    defaultValue={moment()
                                                        .set('h', 22)
                                                        .set('m', 30)}
                                                    className='w-100'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col style={{ marginTop: 21 }}>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        disabled={values.isLoading}
                                        onClick={() =>
                                            setTypeFilter('filter_2')
                                        }
                                    >
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Panel>
                </Collapse>
            </Card>

            <div className='row'>
                <div className='col-12 col-xl-12'>
                    <div className='card'>
                        <div className='card-body'>
                            {values.isLoading && (
                                <div className='d-flex justify-content-center'>
                                    <Space size='middle'>
                                        <Spin size='large' />
                                    </Space>
                                </div>
                            )}

                            {!values.isLoading &&
                                values.teachers.map((e) => renderTeacher(e))}

                            {!values.isLoading && !values?.teachers?.length && (
                                <div className='p-5 text-center'>No data</div>
                            )}

                            {!values.isLoading &&
                                values.teachers.length > 0 && (
                                    <Pagination
                                        current={values.page_number}
                                        total={values.total}
                                        pageSize={values.page_size}
                                        onChange={onPageChange}
                                    />
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TeacherSchedules
