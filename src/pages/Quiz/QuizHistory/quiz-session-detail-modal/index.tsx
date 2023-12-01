import { FC, memo, useCallback, useEffect, useState } from 'react'
import { ColumnsType } from 'antd/lib/table'
import { Modal, Button, Row, Col, Descriptions, Card, Table, Tag } from 'antd'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz, EnumQuestionType } from 'types'
import QuizAPI from 'api/QuizAPI'
import moment from 'moment'
import sanitizeHtml from 'sanitize-html'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

type Props = {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
}

const QuizSessionDetailModal: FC<Props> = ({ visible, data, toggleModal }) => {
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<any[]>([])

    const getQuizSessionInfo = (id: number) => {
        setLoading(true)
        QuizAPI.getQuizSessionInfo(id)
            .then((res) => {
                setQuestions(res.questions)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (data) {
            getQuizSessionInfo(data?.id)
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const columns: ColumnsType = [
        {
            title: 'Question',
            dataIndex: 'question',
            key: 'question',
            width: 300,
            render: (text, record) => (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitize(text?.name?.replace('\\r\\n', ''))
                    }}
                />
            )
        },
        {
            title: 'Question Type',
            dataIndex: 'question',
            key: 'question',
            width: 100,
            align: 'center',
            render: (text) =>
                _.startCase(
                    _.findKey(
                        EnumQuestionType,
                        (o) => o === text?.question_type
                    )
                )
        },
        {
            title: 'Answers',
            dataIndex: 'question',
            key: 'question',
            width: 250,
            render: (text) => (
                <>
                    {text?.answers?.map((item, index) => (
                        <p
                            key={index}
                            style={{
                                color: item.is_correct ? '#52c41a' : '#000'
                            }}
                        >
                            {item.label}. {item.text}{' '}
                        </p>
                    ))}
                </>
            )
        },
        {
            title: 'User answer',
            dataIndex: 'user_answer',
            key: 'user_answer',
            width: 100,
            align: 'center',
            render: (text) => text
        },
        {
            title: 'Is Correct',
            dataIndex: 'is_correct',
            key: 'is_correct',
            width: 100,
            align: 'center',
            render: (text) =>
                text ? <Tag color='green'>Yes</Tag> : <Tag color='red'>No</Tag>
        }
    ]

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Quiz Session Detail'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>
            ]}
            width='80%'
        >
            <Descriptions title='Quiz Description' bordered className='mb-3'>
                <Descriptions.Item label={`Quiz name: ${data?.quiz?.name}`}>
                    {`Total questions: ${data?.quiz?.questions?.length}`}
                </Descriptions.Item>
                <Descriptions.Item
                    label={`Time: ${moment(
                        data?.quiz?.time_limit * 1000
                    ).format('mm')} minutes`}
                >
                    {`Passed minimum: ${data?.quiz?.passed_minimum}/${data?.quiz?.score}`}
                </Descriptions.Item>
            </Descriptions>
            <Descriptions title='User answers'>
                <Descriptions.Item>
                    <Table
                        bordered
                        dataSource={questions}
                        columns={columns}
                        loading={loading}
                        pagination={false}
                        scroll={{
                            x: 500
                        }}
                        sticky
                    />
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    )
}

export default QuizSessionDetailModal
