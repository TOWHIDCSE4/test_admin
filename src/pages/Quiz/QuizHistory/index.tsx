import { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Card, Space, Button, Tag, Select, Input } from 'antd'
import { notify } from 'utils/notify'
import { ColumnsType } from 'antd/lib/table'
import QuizAPI from 'api/QuizAPI'
import UserAPI from 'api/UserAPI'
import _ from 'lodash'
import moment from 'moment'
import { EnumQuizSessionType } from 'types'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import QuizSessionDetailModal from './quiz-session-detail-modal'

const { Search } = Input

const QuizHistory = () => {
    const [quizSessions, setQuizSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [searchType, setSearchType] = useState(0)
    const [searchUser, setSearchUser] = useState(null)
    const [searchQuiz, setSearchQuiz] = useState(null)

    const getQuizSessions = (query: {
        page_size: number
        page_number: number
        quiz_id?: number
        type?: number
        user_id?: number
    }) => {
        setLoading(true)
        QuizAPI.getQuizSession(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                console.log(res.data[0])
                setQuizSessions(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }
    useEffect(() => {
        getQuizSessions({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (pageSize !== _pageSize) {
                setPageSize(_pageSize)
                getQuizSessions({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    quiz_id: searchQuiz,
                    type: searchType,
                    user_id: searchUser
                })
            } else if (pageNumber !== _pageNumber) {
                setPageNumber(_pageNumber)
                getQuizSessions({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    quiz_id: searchQuiz,
                    type: searchType,
                    user_id: searchUser
                })
            }
        },
        [searchQuiz, searchType, searchUser, pageNumber, pageSize]
    )

    const toggleModal = useCallback(
        (value: boolean, record?: any) => {
            setVisible(value)
            setSelectedRecord(record)
        },
        [visibleModal]
    )

    const columns: ColumnsType = [
        {
            title: 'Quiz Name',
            dataIndex: 'quiz',
            key: 'quiz',
            width: 150,
            align: 'center',
            render: (text, record: any) => record?.quiz?.name
        },
        {
            title: 'Start by',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 150,
            align: 'center',
            render: (text, record: any) => (
                <b title={record?.user_email}>
                    {text} {record?.user_email ? `- ${record?.user_email}` : ''}
                </b>
            )
        },
        {
            title: 'Quiz Type',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            align: 'center',
            render: (text, record: any) => EnumQuizSessionType[text]
        },
        {
            title: 'Time limit (seconds)',
            dataIndex: 'quiz',
            key: 'quiz',
            width: 150,
            align: 'center',
            render: (text, record: any) => text?.time_limit
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            width: 150,
            align: 'center',
            render: (text, record: any) =>
                moment(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Submit Time',
            dataIndex: 'submit_time',
            key: 'submit_time',
            width: 150,
            align: 'center',
            render: (text, record: any) =>
                text ? (
                    moment(text).format('DD/MM/YYYY HH:mm:ss')
                ) : moment(record?.start_time)
                      .add(record?.quiz?.time_limit, 'seconds')
                      .isAfter(new Date()) ? (
                    <Tag color='green'>Doing</Tag>
                ) : (
                    <></>
                )
        },
        {
            title: 'Score',
            dataIndex: 'user_score',
            key: 'user_score',
            width: 150,
            align: 'center',
            render: (text, record: any) =>
                `${text.toFixed(2).replace(/\.00$/, '')}/${record?.quiz?.score}`
        },
        {
            title: 'Status',
            dataIndex: 'quiz',
            key: 'passed_minimum',
            width: 150,
            align: 'center',
            render: (text, record: any) =>
                record?.user_score >= text?.passed_minimum ? (
                    <Tag color='green'>Passed</Tag>
                ) : (
                    <Tag color='grey'>Failed</Tag>
                )
        },
        {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            width: 150,
            align: 'center',
            render: (text, record: any) => (
                <Button
                    type='primary'
                    size='small'
                    onClick={() => {
                        toggleModal(true, record)
                    }}
                >
                    Detail
                </Button>
            )
        }
    ]

    const onSearchType = useCallback(
        (type) => {
            setSearchType(type)
            getQuizSessions({
                page_size: pageSize,
                page_number: pageNumber,
                quiz_id: searchQuiz,
                type,
                user_id: searchUser
            })
        },
        [pageSize, pageNumber, searchQuiz, searchUser]
    )

    const onSearchQuiz = useCallback(
        (id) => {
            setSearchQuiz(id)
            getQuizSessions({
                page_size: pageSize,
                page_number: pageNumber,
                quiz_id: id,
                type: searchType,
                user_id: searchUser
            })
        },
        [pageSize, pageNumber, searchType, searchUser]
    )

    const onSearchUser = useCallback(
        (id) => {
            setSearchUser(id)
            getQuizSessions({
                page_size: pageSize,
                page_number: pageNumber,
                quiz_id: searchQuiz,
                type: searchType,
                user_id: id
            })
        },
        [pageSize, pageNumber, searchType, searchQuiz]
    )

    const fetchQuiz = async (search) => {
        try {
            const res = await QuizAPI.getQuizzesNEW({
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.name}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const fetchUser = async (q) => {
        try {
            const res = await UserAPI.searchUserByString({
                page_number: 1,
                page_size: 100,
                q
            })
            return res.data.map((i) => ({
                label: `${i.full_name} - ${i.username}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search Student',
            engine: (
                <DebounceSelect
                    style={{ width: '100%' }}
                    placeholder='By name , email'
                    fetchOptions={fetchUser}
                    allowClear
                    onChange={onSearchUser}
                />
            )
        },
        {
            label: 'Search Quiz',
            engine: (
                <DebounceSelect
                    style={{ width: '100%' }}
                    placeholder='Search by quiz name'
                    fetchOptions={fetchQuiz}
                    allowClear
                    onChange={onSearchQuiz}
                />
            )
        },
        {
            label: 'Type',
            engine: (
                <Select
                    style={{ width: '100%' }}
                    onChange={onSearchType}
                    value={searchType}
                >
                    <Select.Option value={0} default>
                        All
                    </Select.Option>
                    <Select.Option value={1}>HOMEWORK</Select.Option>
                    <Select.Option value={2}>TEST</Select.Option>
                    <Select.Option value={3}>EXAM</Select.Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='Self-Study-V1 History'>
            <FilterDataWrapper engines={filterEngines}></FilterDataWrapper>

            <Table
                bordered
                dataSource={quizSessions}
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
            <QuizSessionDetailModal
                visible={visibleModal}
                toggleModal={toggleModal}
                data={selectedRecord}
            />
        </Card>
    )
}

export default QuizHistory
