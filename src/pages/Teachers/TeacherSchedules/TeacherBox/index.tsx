/* eslint-disable react/button-has-type */
import { notification, Select, Space, Spin } from 'antd'
import TeacherAPI from 'api/TeacherAPI'
import _ from 'lodash'
import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import ItemTime from './item-time'

interface IProps {
    filter_type: string
    time?: any
    teacher?: any
    toDate?: any
    weekDay?: number
    fromTime?: any
    toTime?: any
}

export default React.memo(
    ({ ...props }: IProps) => {
        const [isShow, setShow] = useState(true)
        const [schedules, setSchedules] = useState(null)
        const [isLoading, setIsLoading] = useState(false)
        const renderTime = () => {
            const listTime = []
            const time = props.time.clone()
            time.set({
                hour: 7,
                minute: 0,
                second: 0,
                millisecond: 0
            })
            while (time.hour() < 23) {
                listTime.push(
                    <ItemTime
                        key={time.clone()}
                        start_time={time.clone()}
                        end_time={time.clone().add({
                            minute: 30
                        })}
                        schedules={schedules}
                    ></ItemTime>
                )
                time.add({
                    minute: 30
                })
            }
            return listTime
        }
        const getData = async () => {
            setIsLoading(true)
            try {
                const startTime = props.time.clone()
                const endTime = props.time.clone()
                startTime.set({
                    hour: props.fromTime ? props.fromTime.hour() : 0,
                    minute: props.fromTime ? props.fromTime.minute() : 0,
                    second: 0,
                    millisecond: 0
                })
                endTime.set({
                    hour: props.toTime
                        ? props.toTime.clone().subtract({ minutes: 10 }).hour()
                        : 24,
                    minute: props.toTime
                        ? props.toTime
                              .clone()
                              .subtract({ minutes: 10 })
                              .minute()
                        : 0,
                    second: 0,
                    millisecond: 0
                })

                const res = await TeacherAPI.getAllTeachersSchedule({
                    teacher_id: props.teacher.user_id,
                    start_time: startTime.valueOf(),
                    end_time: endTime.valueOf()
                })
                if (res) {
                    if (props.filter_type === 'filter_2') {
                        if (res.available_regular_schedule.length === 0) {
                            setShow(false)
                        }
                        res.booked_schedule = []
                    }
                    setSchedules(res)
                }
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: error.message
                })
            }
            setIsLoading(false)
        }

        useEffect(() => {
            getData()
        }, [props.teacher._id, props.time.valueOf()])

        return isShow ? (
            <div className='mb-4 item-teacher'>
                <div className='col-date'>
                    <p className='name text-center'>
                        {props.teacher.user_info
                            ? `${props.teacher.user_info.full_name} - ${props.teacher.user_info.username}`
                            : props.teacher.user[0]
                            ? `${props.teacher.user[0].full_name} - ${props.teacher.user[0].username}`
                            : `${props.teacher.user.full_name} - ${props.teacher.user.username}`}
                    </p>
                </div>

                {isLoading ? (
                    <div className='w-100 d-flex justify-content-center'>
                        <Space size='middle'>
                            <Spin size='large' />
                        </Space>
                    </div>
                ) : (
                    <div className='d-flex align-items-center'>
                        <div>
                            <div className='text-center h-100 text-success font-weight-bold px-2'>{`${
                                new Date(props.time)
                                    .toLocaleDateString('en', {
                                        weekday: 'short'
                                    })
                                    .split(' ')[0]
                            }`}</div>
                            <div className='text-center h-100 text-success font-weight-bold px-2'>{`${props.time.format(
                                'DD/MM'
                            )}`}</div>
                        </div>
                        <div className='col-time p-2'>{renderTime()}</div>
                    </div>
                )}
            </div>
        ) : (
            <></>
        )
    },
    (pre, next) => {
        return (
            pre.teacher._id === next.teacher._id &&
            pre.time.valueOf() === next.time.valueOf()
        )
    }
)
