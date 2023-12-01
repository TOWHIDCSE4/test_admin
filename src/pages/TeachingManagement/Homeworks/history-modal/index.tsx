import { FunctionComponent, useCallback, useEffect, useReducer } from 'react'
import {
    Modal,
    Tag,
    Card,
    Row,
    Col,
    Divider,
    Descriptions,
    Table,
    Tooltip
} from 'antd'
import _ from 'lodash'
import { EnumQuizSessionStatus } from 'const/status'
import { IBooking } from 'types'
import moment from 'moment'
import HomeworkAPI from 'api/HomeworkAPI'
import { ColumnsType } from 'antd/lib/table'
import { IModalProps } from 'const'

interface Props extends IModalProps {
    booking: IBooking
}

const HomeworkHistory: FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, booking } = props

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            historyHomeworks: []
        }
    )

    const getHomeworksDone = useCallback(() => {
        setValues({ isLoading: true })
        HomeworkAPI.getHomeworkHistory({ booking_id: booking.id }).then(
            (res) => {
                setValues({ isLoading: false })
                setValues({ historyHomeworks: res.data })
            }
        )
    }, [booking])

    useEffect(() => {
        if (!_.isEmpty(booking)) {
            getHomeworksDone()
        }
    }, [visible])

    const columns: ColumnsType = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            align: 'center'
        },
        {
            title: 'Score',
            dataIndex: 'user_score',
            key: 'user_score',
            width: 150,
            align: 'center',
            render: (text, record: any) => `${text}/${record?.score}`
        },
        {
            title: 'Start time',
            dataIndex: 'start_time',
            key: 'start_time',
            width: 250,
            align: 'center',
            render: (text, record) =>
                text && moment(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Submit time',
            dataIndex: 'submit_time',
            key: 'submit_time',
            width: 250,
            align: 'center',
            render: (text, record) =>
                text && moment(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            fixed: 'right',
            align: 'center',
            render: (text, record: IBooking) => {
                if (text === EnumQuizSessionStatus.PASS) {
                    return <Tag color='#36cb7c'>PASS</Tag>
                }
                if (text === EnumQuizSessionStatus.FAIL) {
                    return <Tag color='#f15179'>FAIL</Tag>
                }
                if (text === EnumQuizSessionStatus.DOING) {
                    return <Tag color='#076fd6'>DOING</Tag>
                }
                return null
            }
        }
    ]
    const renderBody = () => (
        <>
            <Card loading={values.isLoading}>
                <Row>
                    <Col xs={24} sm={24} md={8}>
                        <p>Course:</p>
                        <strong className='text-primary'>
                            {booking?.unit?.course?.name}
                        </strong>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p>Unit: </p>
                        <strong className='text-primary'>
                            {booking?.unit?.name}
                        </strong>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <p>Teacher: </p>
                        <strong className='text-primary'>
                            {`${booking?.teacher?.full_name} - ${booking?.teacher?.username}`}
                        </strong>
                    </Col>
                </Row>
                <Divider />
                <Descriptions
                    title='Description about homework'
                    bordered
                    className='mb-3'
                >
                    <Descriptions.Item label={`Name: ${booking?.quiz?.name}`}>
                        {`Number of questions: ${booking?.quiz?.score}`}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label={`Time: ${moment(
                            booking?.quiz?.time_limit * 1000
                        ).format('mm')} minutes`}
                    >
                        {`Passed minimum score: ${booking?.quiz?.passed_minimum}/${booking?.quiz?.score}`}
                    </Descriptions.Item>
                </Descriptions>
                {!_.isEmpty(values.historyHomeworks) && (
                    <>
                        <Divider />
                        <Table
                            bordered
                            dataSource={values.historyHomeworks}
                            columns={columns}
                            // pagination={{
                            //     defaultCurrent: 1,
                            //     current: pageNumber,
                            //     pageSize: 10,
                            //     total,
                            //     onChange: handleChangePagination
                            // }}
                            rowKey={(record: any) => record?._id}
                            scroll={{
                                x: 300,
                                y: 300
                            }}
                            title={() => (
                                <p className='text-center mb-0 fs-17'>
                                    <Tooltip title='Average Score'>
                                        <strong>
                                            Average Score: {booking?.average}
                                        </strong>
                                    </Tooltip>
                                </p>
                            )}
                        />
                    </>
                )}
                {_.isEmpty(values.historyHomeworks) && (
                    <h2 className='text-center'>No history</h2>
                )}
            </Card>
        </>
    )
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => toggleModal(false)}
            title='Homework History'
            footer={null}
            width='80%'
        >
            {renderBody()}
        </Modal>
    )
}

export default HomeworkHistory
