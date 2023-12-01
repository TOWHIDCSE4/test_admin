import { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Card, Space, Button, Input, Select } from 'antd'
import { EditOutlined, FileAddOutlined, BookOutlined } from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import QuizAPI from 'api/QuizAPI'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz, EnumQuizType } from 'types'
import { toReadablePrice } from 'utils'
import { ColumnsType } from 'antd/lib/table'
import _ from 'lodash'
import { MODAL_TYPE } from 'const'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import FilterDataWrapper from 'components/filter-data-wrapper'
import QuizModal from './quiz-modal'
import AddQuestionModal from './add-question-modal'
import { number } from 'prop-types'

const { Search } = Input

const Quiz = ({ ...props }) => {
    const [quizzes, setQuizzes] = useState<IQuiz[]>([])
    const [loading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IQuiz>(null)
    const [visibleExamModal, setVisibleExamModal] = useState(false)
    const [visibleAddQuestion, setVisibleAddQuestions] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [searchType, setSearchType] = useState(0)
    const [searchLevel, setSearchLevel] = useState(-1)
    const queryUrl = new URLSearchParams(window.location.search)

    const getQuizzes = (query: {
        page_size: number
        page_number: number
        search?: string
        search_type?: number
        search_level?: number
        quiz_id?: number
    }) => {
        setLoading(true)
        QuizAPI.getQuizzesNEW(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setQuizzes(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        const quizId = Number(queryUrl.get('quiz_id'))
        getQuizzes({
            page_number: pageNumber,
            page_size: pageSize,
            search: null,
            search_type: null,
            search_level: null,
            quiz_id: quizId
        })
        setVisibleExamModal(false)
        setSelectedItem(null)
    }, [])

    const refetchData = useCallback(() => {
        getQuizzes({
            page_number: pageNumber,
            page_size: pageSize,
            search: searchString,
            search_type: searchType
        })
    }, [pageNumber, pageSize, searchString, searchType])

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (pageSize !== _pageSize) {
                setPageSize(_pageSize)
                getQuizzes({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search: searchString,
                    search_type: searchType
                })
            } else if (pageNumber !== _pageNumber) {
                setPageNumber(_pageNumber)
                getQuizzes({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search: searchString,
                    search_type: searchType
                })
            }
        },
        [searchString, searchType, searchLevel, pageNumber, pageSize]
    )

    const updateQuiz = async (quiz) => {
        await QuizAPI.updateQuizNEW(quiz.id, quiz)
    }

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleModal]
    )

    const toggleQuestionModal = useCallback(
        (value: boolean) => {
            setVisibleAddQuestions(value)
        },
        [visibleAddQuestion]
    )

    const onClickNewExamButton = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisibleExamModal(true)
        },
        [visibleExamModal, selectedItem]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const onClickAddQuestions = useCallback((item) => {
        setSelectedItem(item)
        setVisibleAddQuestions(true)
    }, [])

    const removeQuiz = useCallback((id: number) => {
        setLoading(true)
        QuizAPI.removeQuiz(id)
            .then((res) => {
                notify('success', 'Remove successfully')
                refetchData()
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }, [])

    const onRemove = useCallback((item) => {
        // Modal.confirm({
        //     icon: <ExclamationCircleOutlined />,
        //     content: `Are you sure to remove item?`,
        //     onOk() {
        //         removeQuiz(item.id)
        //     }
        // })
    }, [])

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: true
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            align: 'center',
            render: (text) =>
                _.startCase(_.findKey(EnumQuizType, (o) => o === text))
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 100,
            render: (text) =>
                _.startCase(_.findKey(EnumQuizLevel, (o) => o === text))
        },
        {
            title: 'Questions',
            dataIndex: 'questions',
            key: 'questions',
            width: 100,
            align: 'center',
            render: (text) => text?.length
        },
        {
            title: 'Times(s)',
            dataIndex: 'time_limit',
            key: 'time_limit',
            width: 100,
            align: 'center',
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            align: 'center',
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center',
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Passed minimum',
            dataIndex: 'passed_minimum',
            key: 'passed_minimum',
            width: 100,
            align: 'center',
            render: (text) => toReadablePrice(text)
        },
        {
            title: 'Instruction',
            dataIndex: 'instruction',
            key: 'instruction',
            width: 100
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.qmqm_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit quiz'
                        />
                    )}
                    {checkPermission(PERMISSIONS.qmqm_add_question) && (
                        <BookOutlined
                            style={{ color: 'green' }}
                            type='button'
                            title='Add questions to quiz'
                            onClick={() => onClickAddQuestions(record)}
                        />
                    )}
                </Space>
            )
        }
    ]

    const onSearchString = useCallback(
        (str) => {
            setSearchString(str)
            getQuizzes({
                page_size: pageSize,
                page_number: pageNumber,
                search: str,
                search_type: searchType
            })
        },
        [pageSize, pageNumber, searchType, searchLevel]
    )

    const onSearchType = useCallback(
        (type) => {
            setSearchType(type)
            getQuizzes({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                search_type: type
            })
        },
        [pageSize, pageNumber, searchString, searchLevel]
    )

    const onSearchLevel = useCallback(
        (lv) => {
            setSearchLevel(lv)
            getQuizzes({
                page_size: pageSize,
                page_number: pageNumber,
                search: searchString,
                search_type: searchType,
                search_level: lv
            })
        },
        [pageSize, pageNumber, searchString, searchType]
    )

    const filterEngines = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='Search by name'
                    style={{ width: '100%' }}
                    onSearch={_.debounce(onSearchString, 250)}
                    enterButton='Search'
                    allowClear
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
                    <Select.Option value={3}>MIDTERM</Select.Option>
                    <Select.Option value={4}>FINAL</Select.Option>
                </Select>
            )
        },
        {
            label: 'Level',
            engine: (
                <Select
                    style={{ width: '100%' }}
                    onChange={onSearchLevel}
                    value={searchLevel}
                    allowClear
                >
                    <Select.Option value={-1} default>
                        ALL LEVEL
                    </Select.Option>
                    <Select.Option value={1}>BEGINNER</Select.Option>
                    <Select.Option value={2}>ELEMENTARY</Select.Option>
                    <Select.Option value={3}>INTERMEDIATE</Select.Option>
                    <Select.Option value={4}>UPPER_INTER</Select.Option>
                    <Select.Option value={5}>ADVANCED</Select.Option>
                    <Select.Option value={6}>EXPERT</Select.Option>
                </Select>
            )
        }
    ]

    return (
        <Card title='Quiz Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.qmqm_create) ? (
                        <Button
                            type='primary'
                            onClick={() =>
                                toggleModal(true, MODAL_TYPE.ADD_NEW)
                            }
                        >
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={quizzes}
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
            <QuizModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
            <AddQuestionModal
                visible={visibleAddQuestion}
                data={selectedItem}
                toggleModal={toggleQuestionModal}
                refetchData={refetchData}
                updateQuiz={updateQuiz}
            />
        </Card>
    )
}

export default Quiz
