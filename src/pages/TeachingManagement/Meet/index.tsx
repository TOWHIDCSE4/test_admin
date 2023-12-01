/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import BookingAPI from 'api/BookingAPI'
import { notify } from 'utils/notify'
import { ENUM_BOOKING_STATUS } from 'const'
import { Button, Result, Spin } from 'antd'
import _ from 'lodash'
import { SmileOutlined } from '@ant-design/icons'
import { IBooking } from 'types'
import queryString from 'query-string'

const Meet = () => {
    const history = useHistory()

    const { search } = useLocation()

    const [loading, setLoading] = useState<boolean>(false)
    const [booking, setBooking] = useState<IBooking>(null)
    const [meetClassUrl, setMeetClassUrl] = useState<string>('')

    const requestLinkMeet = (booking_id: number) => {
        BookingAPI.requestMeetClassUrl(booking_id)
            .then((res) => {
                setMeetClassUrl(res.join_url)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getDetailLesson = (booking_id: number) => {
        setLoading(true)
        BookingAPI.getBookingDetail(booking_id)
            .then((res) => {
                setBooking(res)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        const parsed: any = queryString.parse(search)
        if (parsed?.room) {
            getDetailLesson(_.toInteger(parsed?.room))
            requestLinkMeet(_.toInteger(parsed?.room))
        }
    }, [search])

    if (booking) {
        if (
            [
                ENUM_BOOKING_STATUS.UPCOMING,
                ENUM_BOOKING_STATUS.TEACHING
            ].includes(booking?.status) &&
            meetClassUrl
        ) {
            return (
                <>
                    <iframe
                        src={meetClassUrl}
                        allow='camera; microphone'
                        key='englishplus'
                        width='100%'
                        height='850px'
                    />
                </>
            )
        }
        return (
            <div style={{ margin: 'auto' }}>
                <Result
                    icon={<SmileOutlined />}
                    title='Great, we have done all the operations!'
                    extra={
                        <Button
                            type='primary'
                            shape='round'
                            onClick={() => history.push('/dashboard')}
                        >
                            Back Home
                        </Button>
                    }
                />
            </div>
        )
    }

    if (loading)
        return (
            <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
                <Spin spinning={loading} size='large' />
            </div>
        )

    return (
        <div style={{ margin: 'auto' }}>
            <Result
                status='403'
                title='403'
                subTitle='Sorry, you are not authorized to access this page.'
                extra={
                    <Button
                        type='primary'
                        shape='round'
                        onClick={() => history.push('/dashboard')}
                    >
                        Back Home
                    </Button>
                }
            />
        </div>
    )
}

export default Meet
