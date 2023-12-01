import { FC, memo, useCallback, useEffect, useState } from 'react'
import { ColumnsType } from 'antd/lib/table'
import {
    Modal,
    Button,
    Form,
    Input,
    Row,
    InputNumber,
    Col,
    Select,
    Checkbox,
    Upload,
    Space,
    Card,
    Table,
    Tag
} from 'antd'
import {
    UploadOutlined,
    DownloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz, EnumQuestionType } from 'types'
import QuizAPI from 'api/QuizAPI'
import UploadAPI from 'api/UploadAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import sanitizeHtml from 'sanitize-html'
import QuestionAPI from 'api/QuestionAPI'
import { Link } from 'react-router-dom'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { TextArea, Search } = Input
const { Option } = Select
type Props = {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    refetchData: () => void
    updateQuiz: (quiz: any) => void
}

const AddQuestionModal: FC<Props> = ({
    visible,
    data,
    toggleModal,
    refetchData,
    updateQuiz
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [questionToAdd, setQuestionToAdd] = useState(null)
    const [modalData, setModalData] = useState(data)
    const [quizToAdd, setQuizToAdd] = useState(null)

    const getInfoQuiz = async (quizId: number) => {
        QuizAPI.getQuizByIdNEW(quizId)
            .then((res) => {
                setModalData(res)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        setModalData(data)
        if (data?.id) {
            getInfoQuiz(data?.id)
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const addQuestionToQuiz = async () => {
        if (questionToAdd) {
            const tmp = modalData
            if (tmp.questions.find((q) => q._id === questionToAdd))
                return notify('error', ` Question already exist in quiz`)
            tmp.questions.push({ _id: questionToAdd })
            setModalData(tmp)
            await updateQuiz(modalData)
            getInfoQuiz(modalData.id)
        }
    }

    const addQuizToQuiz = async () => {
        if (quizToAdd) {
            const tmp = modalData
            const qs = JSON.parse(quizToAdd)
            await Promise.all(
                qs.map(async (q) => {
                    if (!tmp.questions.find((_q) => _q._id === q._id)) {
                        tmp.questions.push({ _id: q._id })
                    }
                })
            )
            setModalData(tmp)
            await updateQuiz(modalData)
            getInfoQuiz(modalData.id)
        }
    }

    const removeQuestionFromQuiz = async (_id) => {
        if (_id) {
            const tmp = modalData
            tmp.questions = tmp.questions.filter((q) => q._id !== _id)
            setModalData(tmp)
            await updateQuiz(modalData)
            getInfoQuiz(modalData.id)
        }
    }

    const moveItemUp = async (item) => {
        const tmp = modalData
        const index = tmp.questions.findIndex((q) => q._id === item._id)
        if (index > 0) {
            tmp.questions[index] = tmp.questions[index - 1]
            tmp.questions[index - 1] = item
            setModalData(tmp)
            await updateQuiz(modalData)
            getInfoQuiz(modalData.id)
        }
    }

    const moveItemDown = async (item) => {
        const tmp = modalData
        const index = tmp.questions.findIndex((q) => q._id === item._id)
        if (index < tmp.questions.length - 1) {
            tmp.questions[index] = tmp.questions[index + 1]
            tmp.questions[index + 1] = item
            setModalData(tmp)
            await updateQuiz(modalData)
            getInfoQuiz(modalData.id)
        }
    }
    const columns: ColumnsType = [
        {
            title: 'Display order',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 60,
            align: 'center',
            fixed: true,
            render: (text, record, index) => index + 1
        },
        {
            title: 'Change Order',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 100,
            align: 'center',
            fixed: true,
            render: (text, record, index) => (
                <>
                    <Button onClick={() => moveItemUp(record)} title='Move up'>
                        <ArrowUpOutlined />
                    </Button>{' '}
                    <Button
                        onClick={() => moveItemDown(record)}
                        title='Move Down'
                    >
                        <ArrowDownOutlined />
                    </Button>
                    {/* {index + 1} */}
                </>
            )
        },
        {
            title: 'Question',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            align: 'left',
            fixed: true,
            render: (text, record: any) => (
                <Link
                    to={`/question/?id=${record.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html: sanitize(text.replace('\\r\\n', ''))
                        }}
                    />
                </Link>
            )
        },
        {
            title: 'Question Type',
            dataIndex: 'question_type',
            key: 'question_type',
            width: 100,
            align: 'center',
            fixed: true,
            render: (text, record) => EnumQuestionType[text]
        },
        {
            title: 'Section',
            dataIndex: 'section',
            key: 'section',
            width: 100,
            align: 'center',
            fixed: true,
            render: (text, record) => text
        },
        {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            fixed: true,
            render: (text, record: any) => (
                <>
                    <Button
                        size='small'
                        type='primary'
                        onClick={() => removeQuestionFromQuiz(record?._id)}
                    >
                        Remove
                    </Button>
                </>
            )
        }
    ]

    const fetchQuestions = async (search) => {
        try {
            const res = await QuestionAPI.getQuestionsNEW({
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.name}`,
                value: i._id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const fetchQuiz = async (search) => {
        try {
            const res = await QuizAPI.getQuizzesNEW({
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.name}`,
                value: JSON.stringify(i.questions)
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const renderBody = () => (
        <Card>
            <Row justify='center' className='mb-3'>
                <Col span={18}>
                    <Form.Item>
                        <DebounceSelect
                            placeholder='Search questions to add'
                            fetchOptions={fetchQuestions}
                            allowClear
                            style={{ width: '70%' }}
                            onChange={(v) => {
                                setQuestionToAdd(v)
                            }}
                        />{' '}
                        <Button
                            type='primary'
                            style={{ width: '20%' }}
                            onClick={() => addQuestionToQuiz()}
                        >
                            Add to quiz
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
            <Row justify='center' className='mb-3'>
                <Col span={18}>
                    <Form.Item>
                        <DebounceSelect
                            placeholder='Import questions from quiz'
                            fetchOptions={fetchQuiz}
                            allowClear
                            style={{ width: '60%' }}
                            onChange={(v) => {
                                setQuizToAdd(v)
                            }}
                        />{' '}
                        <Button
                            type='primary'
                            style={{ width: '20%' }}
                            onClick={() => addQuizToQuiz()}
                        >
                            Import
                        </Button>{' '}
                        {quizToAdd ? (
                            <Tag color='geekblue' style={{ width: '10%' }}>
                                {JSON.parse(quizToAdd)?.length} questions
                            </Tag>
                        ) : null}
                    </Form.Item>
                </Col>
            </Row>
            <Table
                bordered
                dataSource={modalData?.questions}
                columns={columns}
                loading={loading}
                pagination={{
                    defaultCurrent: 1,
                    current: 1,
                    pageSize: 1000,
                    total: modalData?.questions.length,
                    onChange: () => {}
                }}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500
                }}
                sticky
            />
        </Card>
    )

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Edit quiz questions'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>
                // <Button
                //     key='submit'
                //     type='primary'
                //     onClick={form.submit}
                //     loading={loading}
                // >
                //     Save
                // </Button>
            ]}
            width='80%'
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AddQuestionModal)
