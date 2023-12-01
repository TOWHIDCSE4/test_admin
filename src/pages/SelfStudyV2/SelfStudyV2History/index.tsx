import { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Card, Collapse, Button, Input, Form } from 'antd'
import { StarFilled, CloseCircleOutlined } from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import HomeworkTestResultAPI from 'api/HomeworkTestResultAPI'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz, EnumQuizType, EnumCourseType } from 'types'
import { toReadablePrice } from 'utils'
import { ColumnsType } from 'antd/lib/table'
import _ from 'lodash'
import { MODAL_TYPE } from 'const'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import NameTeacherStudent from 'components/name-teacher-student'
import moment from 'moment'

const { Panel } = Collapse
const baseTrialUrl = process.env.REACT_APP_LIBRARY_TEST_BASE_URL

const SelfStudyV2History = ({ ...props }) => {
    const [form] = Form.useForm()

    const [histories, setHistories] = useState([])
    const [loading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [objSearch, setObjSearch] = useState({})

    const getSelfStudyHistoryV2 = ({ page_size, page_number, obj_search }) => {
        setLoading(true)
        const searchData = {
            page_size,
            page_number,
            ...obj_search
        }
        HomeworkTestResultAPI.getSelfStudyHistoryV2(searchData)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setHistories(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getSelfStudyHistoryV2({
            page_number: pageNumber,
            page_size: pageSize,
            obj_search: objSearch
        })
    }, [])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (pageSize !== _pageSize) {
                setPageSize(_pageSize)
                getSelfStudyHistoryV2({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    obj_search: objSearch
                })
            } else if (pageNumber !== _pageNumber) {
                setPageNumber(_pageNumber)
                getSelfStudyHistoryV2({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    obj_search: objSearch
                })
            }
        },
        [pageNumber, pageSize, objSearch]
    )

    const openResultHomeworkTest = (data) => {
        if (data?.test_url && data?.test_result_code) {
            const url = `${baseTrialUrl}${data.test_url}?code=${data.test_result_code}&type=result`
            window.open(url, '_blank')
        }
    }

    const columns: ColumnsType = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            fixed: 'left',
            align: 'center',
            width: 60,
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            fixed: 'left',
            align: 'left',
            width: 280,
            render: (text, record, index) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Bài học',
            dataIndex: 'unit',
            key: 'unit',
            align: 'left',
            width: 280,
            render: (text, record, index) => text?.name || ''
        },
        {
            title: 'Self-Study',
            dataIndex: 'test_topic_name',
            key: 'test_topic_name',
            align: 'left',
            width: 280,
            render: (text, record, index) => text || ''
        },
        {
            title: 'Type',
            dataIndex: 'course',
            key: 'course',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                switch (text?.course_type) {
                    case EnumCourseType.IELTS:
                        return 'IELTS'

                    case EnumCourseType.Regular:
                        return 'REGULAR'

                    default:
                        return ''
                }
            }
        },
        {
            title: 'Thời gian làm bài (phút)',
            dataIndex: 'topic_information',
            key: 'topic_information',
            align: 'center',
            width: 170,
            render: (text, record, index) => text?.test_time || ''
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'left',
            width: 170,
            render: (text, record, index) =>
                text?.test_start_time
                    ? moment(text?.test_start_time).format(
                          'DD-MM-YYYY HH:mm:ss'
                      )
                    : ''
        },
        {
            title: 'Thời gian nộp bài',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'left',
            width: 170,
            render: (text, record, index) =>
                text?.submission_time
                    ? moment(text?.submission_time).format(
                          'DD-MM-YYYY HH:mm:ss'
                      )
                    : ''
        },
        {
            title: 'Điểm',
            dataIndex: 'test_result',
            key: 'test_result',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                if (text?.avg) {
                    return `${text?.avg}/10`
                }
                if (text?.percent_correct_answers) {
                    return `${text?.percent_correct_answers}%`
                }

                return ''
            }
        },
        {
            title: 'Tính điểm',
            dataIndex: 'is_first_submission',
            key: 'is_first_submission',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if (text) {
                    return (
                        <StarFilled
                            style={{ color: '#fadb14', fontSize: '18px' }}
                        />
                    )
                }
                return (
                    <CloseCircleOutlined
                        style={{ color: '#ff4d4f', fontSize: '18px' }}
                    />
                )
            }
        },
        {
            title: 'Xem kết quả',
            dataIndex: 'index',
            key: 'index',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: (text, record: any) => (
                <Button
                    type='primary'
                    size='small'
                    onClick={() => openResultHomeworkTest(record)}
                >
                    Detail
                </Button>
            )
        }
    ]

    const onSearch = (val) => {
        setObjSearch(val)
        getSelfStudyHistoryV2({
            page_size: pageSize,
            page_number: pageNumber,
            obj_search: val
        })
    }

    return (
        <Card title='History Self-Study V2'>
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
                                span={18}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={4}>Student:</Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name='search_student'
                                            className='mb-0 w-100'
                                        >
                                            <Input
                                                placeholder='name, user name'
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>Self-Study:</Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name='search_self_study'
                                            className='mb-0 w-100'
                                        >
                                            <Input
                                                placeholder='Self-Study name'
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Button
                                            type='primary'
                                            htmlType='submit'
                                        >
                                            Search
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>

            <Table
                dataSource={histories}
                columns={columns}
                loading={loading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500
                }}
                sticky
            />
        </Card>
    )
}

export default SelfStudyV2History
