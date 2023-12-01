/* eslint-disable react/no-this-in-sfc */
import { Card, Empty, Space, Table, TableColumnsType, Image, Row } from 'antd'
import { blue, green, red } from '@ant-design/colors'
import _ from 'lodash'
import React, { memo, useCallback } from 'react'
import { IScheduledMemo } from 'types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { calculateClassification } from 'utils/string'
import moment from 'moment'
import HeaderReport from 'assets/images/analytics/Header.png'
import FooterReport from 'assets/images/analytics/Footer.png'
import SignReport from 'assets/images/analytics/sign.png'

interface SummaryProps {
    data?: IScheduledMemo
    month?: moment.Moment
}
interface TableColumn {
    name: string
    point: number
    comment?: string
}
const CourseSummary = ({ data, month }: SummaryProps) => {
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

    function getLevelString(level: number) {
        if (level >= 0 && level <= 4) {
            return 'Bắt đầu'
        }
        if (level >= 5 && level <= 6) {
            return 'Sơ cấp'
        }
        if (level >= 7 && level <= 9) {
            return 'Trung cấp'
        }
        if (level >= 10 && level <= 12) {
            return 'Tiền trung cấp'
        }
        if (level >= 13 && level <= 14) {
            return 'Thành thạo'
        }
        if (level >= 15 && level <= 16) {
            return 'Làm chủ ngôn ngữ'
        }
    }

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
                  type: 'column',
                  style: {
                      fontFamily: 'Times New Roman'
                  }
              },
              title: {
                  text: 'BIỂU ĐỒ TÌNH HÌNH HỌC TẬP TOÀN KHOÁ'
              },
              yAxis: {
                  max: 10
              },
              xAxis: {
                  categories: data.segments.map(
                      (item) =>
                          `Tháng ${new Date(item.start_time).getMonth() + 1}`
                  )
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
                  },
                  {
                      name: 'Điểm TB 4 kĩ năng',
                      data: data.segments.map(
                          (segment) => segment.exam_result || 0
                      )
                  }
              ],
              credits: {
                  enabled: false
              }
          }

    return (
        <>
            {!data ? (
                <Empty />
            ) : (
                // <Card title={`Kết quả học tập khoá ${data.course.name}`}>
                <Card title={false} style={{ fontFamily: 'Times New Roman' }}>
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
                        >{`BÁO CÁO KẾT QUẢ HỌC TẬP TOÀN KHOÁ ${data.course.name}`}</div>
                        <Space direction='vertical'>
                            <h5>
                                <b>
                                    Kính gửi Quý phụ huynh của học viên:{' '}
                                    {`${data?.student?.full_name} - ${data?.student?.username}`}
                                </b>
                            </h5>
                            <div>
                                Hệ thống iSpeak.vn xin trân trọng cảm ơn sự quan
                                tâm của phụ huynh Quý học viên đối với chương
                                trình học tiếng Anh trực tuyến 1 thầy 1 trò.{' '}
                            </div>
                            <div>
                                Dưới đây là các đánh giá kết quả học tập giữa
                                khoá của học viên
                            </div>
                            <h5>
                                <b>I. THÔNG TIN HỌC VIÊN</b>
                            </h5>
                            <div>
                                {' '}
                                Tên học viên:{' '}
                                {`${data?.student?.full_name} - ${data?.student?.username}`}
                            </div>
                            <div> Email: {data?.student?.email}</div>
                            <div> Số ĐT: {data?.student?.phone_number}</div>
                            <div>
                                Ngày sinh:{' '}
                                {moment(data?.student?.date_of_birth).format(
                                    'DD/MM/YYYY'
                                )}
                            </div>
                            <h5>
                                <b>II. LỊCH SỬ HỌC TẬP</b>
                            </h5>
                            <div>
                                Khoá học: {data?.course?.package?.number_class}{' '}
                                buổi
                            </div>
                            <div>
                                Giáo viên giảng dạy:{' '}
                                {`${data.teacher.full_name} - ${data.teacher.username}`}
                            </div>
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
                        </Space>
                        <h5>
                            <b>III. ĐÁNH GIÁ QUÁ TRÌNH HỌC</b>
                        </h5>
                        <h6>
                            Trình độ hiện tại:{' '}
                            {!_.isBoolean(data.student_start_level) &&
                            data.student_start_level
                                ? data.student_start_level
                                : 0}{' '}
                            / 16 - Tương đương trình độ{' '}
                            {getLevelString(
                                !_.isBoolean(data.student_start_level) &&
                                    data.student_start_level
                                    ? data.student_start_level
                                    : 0
                            )}{' '}
                            (theo khung CEFR)
                        </h6>
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
                        <h5 style={{ color: 'blue' }}>
                            Trên cơ sở bài kiểm tra trình độ của học viên, đồng
                            tư vấn iSpeak xin đề xuất giáo trình cho học viên:
                            {` `}
                            <b>{`${data?.student?.full_name} - ${data?.student?.username}`}</b>{' '}
                            như sau:
                        </h5>
                        <h5>
                            <b style={{ color: 'red' }}>
                                Giáo trình: Side by side 4
                            </b>
                        </h5>
                        <div>
                            <b>
                                <i>Lợi ích giáo trình: {` `}</i>
                            </b>
                            <p>
                                Mục tiêu của giáo trình là giúp học viên có thể
                                phát triển toàn diện 4 kĩ năng nghe – nói – đọc
                                – viết. Các bài học trong giáo trình chủ yếu
                                xoay quanh các thoại giao tiếp hàng ngày. Từ đó,
                                học viên có thể tăng thể tăng khả năng giao
                                tiếp, tự tin, chủ động trong cuộc sống. Hơn nữa,
                                giáo trình cũng chú trọng rèn luyện khả năng ngữ
                                pháp, bám sát vào chương trình ngữ pháp của bộ
                                giáo dục. Vì vậy, học viên có thể vừa theo
                                chương trình học trên lớp, vừa rèn luyện được
                                khả năng giao tiếp trong cuộc sống hàng ngày và
                                nâng cao khả năng nghe, đọc hiểu.
                            </p>
                        </div>
                        <h5>
                            <b style={{ color: 'red' }}>
                                Để đăng ký khóa học, vui lòng liên hệ với hệ
                                thống Anh ngữ trực tuyến iSpeak theo các thông
                                tin dưới đây:
                            </b>
                        </h5>
                        <Space direction='vertical'>
                            <div>
                                <b>
                                    Công ty CP Công nghệ và Đào tạo trực tuyến
                                    HAMIA
                                </b>
                            </div>
                            <div>
                                <b>Địa chỉ: </b> Tòa Paragon Hà Nội, 86 Duy Tân-
                                Cầu Giấy- Hà Nội{' '}
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
                                Xin trân trọng cảm ơn Quý học viên và mong được
                                đồng hành cùng Quý phụ huynh trong việc học
                                tiếng Anh của bạn.
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
        </>
    )
}

export default memo(CourseSummary)
