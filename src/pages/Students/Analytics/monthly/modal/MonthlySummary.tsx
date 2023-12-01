/* eslint-disable react/no-this-in-sfc */
import {
    Card,
    Empty,
    notification,
    Skeleton,
    Space,
    Table,
    TableColumnsType,
    Image,
    Row
} from 'antd'
import { blue, green, red } from '@ant-design/colors'
import ScheduledMemoAPI from 'api/ScheduledMemo'
import _ from 'lodash'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { EnumScheduledMemoType, IScheduledMemo } from 'types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { calculateClassification } from 'utils/string'
import moment from 'moment'
import HeaderReport from 'assets/images/analytics/Header.png'
import FooterReport from 'assets/images/analytics/Footer.png'
import SignReport from 'assets/images/analytics/sign.png'

interface MonthlySummaryProps {
    month: moment.Moment
    data: IScheduledMemo
}
interface TableColumn {
    name: string
    point: number
    comment?: string
}
const MonthlySummary = ({ data }: MonthlySummaryProps) => {
    const [loading, setLoading] = useState(false)
    // const [data, setData] = useState<IScheduledMemo>()

    // const fetch = async () => {
    //     setLoading(true)
    //     try {
    //         const res = await ScheduledMemoAPI.getScheduledMemo({
    //             type: EnumScheduledMemoType.MONTHLY,
    //             year: month.get('year'),
    //             month: month.get('month') + 1,
    //             page_size: 1,
    //             page_number: 1
    //         })
    //         setData(res.data[0])
    //     } catch (error) {
    //         notification.error({
    //             message: 'Error',
    //             description: error.message
    //         })
    //     }
    //     setLoading(false)
    // }

    // useEffect(() => {
    //     if (!month) return
    //     fetch()
    // }, [month])

    const columns: TableColumnsType<TableColumn> = [
        {
            title: 'Nội dung đánh giá',
            dataIndex: 'name'
        },
        {
            title: 'Điểm',
            dataIndex: 'point'
        },
        {
            title: 'Nhận xét',
            dataIndex: 'comment'
        }
    ]

    const getTableData = useCallback(() => {
        if (!data) return []
        const avgPoint = _.round(
            _.mean(
                [
                    data.attendance.point,
                    data.attitude.point,
                    data.homework.point,
                    data.exam_result
                ].filter((point) => _.isFinite(point))
            ),
            2
        )
        return [
            {
                name: 'Điểm chuyên cần',
                ...data.attendance
            },
            {
                name: 'Điểm thái độ học tập',
                ...data.attitude
            },
            {
                name: 'Điểm BTVN',
                ...data.homework
            },
            {
                name: 'Điểm trung bình kiếm tra',
                point: data.exam_result
            },
            {
                name: 'Trung bình',
                point: avgPoint,
                comment: `Xếp loại: ${calculateClassification(avgPoint)}`
            }
        ]
    }, [data])

    // @ts-ignore
    const chartOptions: Highcharts.Options = !data
        ? null
        : {
              chart: {
                  type: 'line',
                  style: {
                      fontFamily: 'Times New Roman'
                  }
              },
              title: {
                  text: 'Bảng điểm tháng'
              },
              yAxis: {
                  max: 10
              },
              xAxis: {
                  categories: [1, 2, 3, 4].map((item) => `Tuần ${item}`)
              },
              plotOptions: {},
              series: [
                  {
                      name: 'Điểm chuyên cần',
                      data: data.segments.map(
                          (segment) => segment.attendance_point || 0
                      )
                  },
                  {
                      name: 'Điểm thái độ học tập',
                      data: data.segments.map(
                          (segment) => segment.attitude_point || 0
                      )
                  },
                  {
                      name: 'Điểm BTVN',
                      data: data.segments.map(
                          (segment) => segment.homework_point || 0
                      )
                  }
              ],
              credits: {
                  enabled: false
              }
          }

    return (
        <>
            <Skeleton active loading={loading} title>
                {!data ? (
                    <Empty />
                ) : (
                    <Card
                        // title={`Kết quả học tập tháng ${month.format(
                        //     'MM-YYYY'
                        // )}`}
                        title={false}
                        style={{ fontFamily: 'Times New Roman' }}
                    >
                        <Space
                            direction='vertical'
                            size='large'
                            style={{ width: '100%' }}
                        >
                            <Image
                                src={HeaderReport}
                                width='100%'
                                preview={false}
                            />
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#0099ff',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                }}
                            >{`BÁO CÁO KẾT QUẢ HỌC TẬP THÁNG ${data?.month} - ${data?.year}`}</div>
                            <Space direction='vertical'>
                                <h5>
                                    <b>
                                        Kính gửi Quý phụ huynh của học viên:{' '}
                                        {data?.student?.full_name}
                                    </b>
                                </h5>
                                <div>
                                    Hệ thống iSpeak.vn xin trân trọng cảm ơn sự
                                    quan tâm của phụ huynh Quý học viên đối với
                                    chương trình học tiếng Anh trực tuyến 1 thầy
                                    1 trò.
                                </div>
                                <div>
                                    Dưới đây là các đánh giá kết quả học tập
                                    giữa khoá của học viên
                                </div>
                                <h5>
                                    <b>I. THÔNG TIN HỌC VIÊN</b>
                                </h5>
                                <div>
                                    {' '}
                                    Tên học viên: {data?.student?.full_name}
                                </div>
                                <div> Email: {data?.student?.email}</div>
                                <div> Số ĐT: {data?.student?.phone_number}</div>
                                <div>
                                    Ngày sinh:{' '}
                                    {moment(
                                        data?.student?.date_of_birth
                                    ).format('DD/MM/YYYY')}
                                </div>
                            </Space>
                            <h5>
                                <b>II. ĐÁNH GIÁ QUÁ TRÌNH HỌC</b>
                            </h5>
                            <Space size='large'>
                                <div style={{ color: blue.primary }}>
                                    Số buổi học theo lịch:{' '}
                                    <span style={{ fontSize: '1.2em' }}>
                                        {data.registered_class}
                                    </span>
                                </div>
                                <div style={{ color: green.primary }}>
                                    Số buổi tham gia học:{' '}
                                    <span style={{ fontSize: '1.2em' }}>
                                        {data.completed_class}
                                    </span>
                                </div>
                                <div style={{ color: red.primary }}>
                                    Số buổi không học:{' '}
                                    <span style={{ fontSize: '1.2em' }}>
                                        {data.registered_class -
                                            data.completed_class}
                                    </span>
                                </div>
                            </Space>
                            <Table
                                columns={columns}
                                dataSource={getTableData()}
                                pagination={false}
                            />
                            {data.teacher_note && (
                                <div>
                                    <h5>Nhận xét của giáo viên</h5>
                                    <p>{data.teacher_note}</p>
                                </div>
                            )}
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={chartOptions}
                            />
                            <h5>
                                <b style={{ color: 'red' }}>
                                    Để đăng ký khóa học, vui lòng liên hệ với hệ
                                    thống Anh ngữ trực tuyến iSpeak theo các
                                    thông tin dưới đây:
                                </b>
                            </h5>
                            <Space direction='vertical'>
                                <div>
                                    <b>
                                        Công ty CP Công nghệ và Đào tạo trực
                                        tuyến HAMIA
                                    </b>
                                </div>
                                <div>
                                    <b>Địa chỉ: </b> Tòa Paragon Hà Nội, 86 Duy
                                    Tân- Cầu Giấy- Hà Nội{' '}
                                </div>
                                <div>
                                    <b>Hotline: </b> 19002095{' '}
                                </div>
                                <div>
                                    <b>Email: </b>
                                    <i style={{ color: 'blueviolet' }}>
                                        info@ispeak.vn – support@ispeak.vn
                                    </i>
                                </div>
                            </Space>
                            <div>
                                <b style={{ color: 'blue' }}>
                                    Xin trân trọng cảm ơn Quý học viên và mong
                                    được đồng hành cùng Quý phụ huynh trong việc
                                    học tiếng Anh của bạn.
                                </b>
                            </div>
                            <Row justify='end'>
                                <Image
                                    src={SignReport}
                                    width={300}
                                    preview={false}
                                />
                            </Row>

                            <Image
                                src={FooterReport}
                                width='100%'
                                preview={false}
                            />
                        </Space>
                    </Card>
                )}
            </Skeleton>
        </>
    )
}

export default memo(MonthlySummary)
