import { useEffect, useCallback, useState } from 'react'
import { Row, Col, Card, DatePicker } from 'antd'
import moment from 'moment'
import ReportAPI from 'api/ReportAPI'
import _ from 'lodash'

const RenewAndCommission = ({ ...props }) => {
    const [loading, setLoading] = useState(false)
    const [startTime, setStartTime] = useState(moment())
    const [statistic, setStatistic] = useState({
        renew_for_previous_expired_package_count: 0,
        renew_for_current_epxired_package_count: 0,
        renew_for_future_epxired_package_count: 0,
        current_time_expired_count: 0
    })

    const fetchRenewStatistic = (query: { month: number; year: number }) => {
        setLoading(true)
        ReportAPI.getRenewAndCommission(query)
            .then((res) => {
                setStatistic(res)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchRenewStatistic({
            month: moment(startTime).get('month'),
            year: moment(startTime).get('year')
        })
    }, [])

    const handlerDateFilter = useCallback(
        (v) => {
            setStartTime(v)
            fetchRenewStatistic({
                month: moment(v).get('month'),
                year: moment(v).get('year')
            })
        },
        [startTime]
    )

    return (
        <Card
            title={
                <div className='text-center'>
                    <p>BÁO CÁO TỈ LỆ RENEW</p>
                    <p>Tháng {moment(startTime).format('MM/YYYY')}</p>
                </div>
            }
            style={{ width: '100%' }}
            size='small'
            loading={loading}
        >
            <Row className='mb-4' justify='end' gutter={[10, 10]}>
                <Col span={4}>
                    <DatePicker
                        format='MM-YYYY'
                        allowClear={false}
                        picker='month'
                        value={startTime}
                        onChange={handlerDateFilter}
                        disabledDate={(current) => current > moment()}
                    />
                </Col>
            </Row>
            <table className='table'>
                <tbody>
                    <tr>
                        <td colSpan={6}>
                            A1: là HV renew mà có gói hết hạn ở các tháng trước
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={6}>
                            A2: là HV renew mà có gói hết hạn trong tháng
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={6}>
                            A3: là HV renew mà có gói hết hạn ở các tháng sau
                            (tháng tương lai)
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={6}>
                            <span className='mr-5'>A = A1+A2+A3</span>
                            <span>
                                B là danh sách học viên hết hạn trong tháng
                            </span>
                        </td>
                    </tr>
                    <tr>
                        {/* <th scope='row'>Tên CS</th> */}
                        <th scope='row'>A1</th>
                        <th scope='row'>A2</th>
                        <th scope='row'>A3</th>
                        <th scope='row'>A</th>
                        <th scope='row'>B</th>
                        <th scope='row'>Tỷ lệ renew (A/B)</th>
                    </tr>
                    <tr>
                        {/* <td /> */}
                        <td>
                            {
                                statistic?.renew_for_previous_expired_package_count
                            }
                        </td>
                        <td>
                            {statistic?.renew_for_current_epxired_package_count}
                        </td>
                        <td>
                            {statistic?.renew_for_future_epxired_package_count}
                        </td>
                        <td>
                            {statistic?.renew_for_previous_expired_package_count +
                                statistic?.renew_for_current_epxired_package_count +
                                statistic?.renew_for_future_epxired_package_count}
                        </td>
                        <td>{statistic?.current_time_expired_count}</td>
                        <td>
                            {statistic?.current_time_expired_count !== 0 &&
                                (
                                    (statistic?.renew_for_previous_expired_package_count +
                                        statistic?.renew_for_current_epxired_package_count +
                                        statistic?.renew_for_future_epxired_package_count) /
                                    statistic?.current_time_expired_count
                                ).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </Card>
    )
}
export default RenewAndCommission
