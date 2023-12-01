import { useEffect, useState, useCallback, useReducer } from 'react'
import {
    Table,
    Row,
    Col,
    Card,
    Button,
    Space,
    Tag,
    Input,
    Spin,
    Modal,
    Select
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import UnitAPI from 'api/UnitAPI'
import CourseAPI from 'api/CourseAPI'
import { notify } from 'utils/notify'
import { ICourse, IUnit } from 'types'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import UnitModal from './unit-modal'
import { encodeFilenameFromLink } from 'const/common'

const { Search } = Input
const { Option } = Select

enum EnumExamType {
    MIDTERM_EXAM = 1,
    FINAL_EXAM = 2,
    TEST = 3
}

const Unit = () => {
    const [units, setUnits] = useState<IUnit[]>([])
    const [courses, setCourses] = useState<ICourse[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [courseIds, setCourseIds] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IUnit>(null)
    const [isLoadingCourse, setLoadingCourse] = useState(false)
    const [filterCourse, setFilterCourse] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            total: 0,
            page_number: 1,
            search: '',
            page_size: 10
        }
    )
    const getUnits = (query: {
        page_size: number
        page_number: number
        search?: string
        course_ids?: number[]
    }) => {
        setLoading(true)
        UnitAPI.getUnits(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setUnits(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const getCourses = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoadingCourse(true)
        CourseAPI.getCourses(query)
            .then((res) => {
                let newCourses = [...res.data]
                if (query.page_number > 1) {
                    newCourses = [...courses, ...res.data]
                }
                setCourses(newCourses)
                if (res.pagination && res.pagination.total > 0) {
                    setFilterCourse({
                        total: res.pagination.total
                    })
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoadingCourse(false))
    }

    useEffect(() => {
        getCourses({
            page_number: filterCourse.page_number,
            page_size: filterCourse.page_size
        })
    }, [])

    useEffect(() => {
        setPageNumber(1)
        getUnits({
            page_number: 1,
            page_size: pageSize,
            search,
            course_ids: courseIds
        })
    }, [courseIds])

    const refetchData = () => {
        getUnits({
            page_number: pageNumber,
            page_size: pageSize,
            search,
            course_ids: courseIds
        })
    }

    const onSearch = useCallback(
        (value) => {
            setPageNumber(1)
            setSearch(value)
            getUnits({
                search: value,
                page_number: 1,
                page_size: pageSize,
                course_ids: courseIds
            })
        },
        [search, pageSize, pageNumber]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getUnits({
                page_number: pageNumber,
                page_size: _pageSize,
                search,
                course_ids: courseIds
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getUnits({
                page_number: _pageNumber,
                page_size: pageSize,
                search,
                course_ids: courseIds
            })
        }
    }

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
            if (!value) setSelectedItem(null)
        },
        [modalType, visibleModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const removeUnit = useCallback((id: number) => {
        setLoading(true)
        UnitAPI.removeUnit(id)
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
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove item?`,
            onOk() {
                removeUnit(item.id)
            }
        })
    }, [])

    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }

    const toggleViewDocument = (src) => {
        window.open(
            hasHttpUrl(src)
                ? encodeFilenameFromLink(src)
                : `https://ispeak.vn/${encodeFilenameFromLink(src)}`,
            '_blank'
        )
    }

    const toggleViewAudio = (src) => {
        window.open(
            hasHttpUrl(src)
                ? encodeFilenameFromLink(src)
                : `https://ispeak.vn/${encodeFilenameFromLink(src)}`,
            '_blank'
        )
    }

    const loadMoreCourse = (event) => {
        const { target } = event
        if (
            !isLoadingCourse &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            if (
                filterCourse.total >
                filterCourse.page_number * filterCourse.page_size
            ) {
                const newPageNumber = filterCourse.page_number + 1
                setFilterCourse({ page_number: newPageNumber })
                getCourses({
                    page_number: newPageNumber,
                    page_size: filterCourse.page_size,
                    search: filterCourse.search
                })
            }
        }
    }

    const onSearchCourse = (value: string) => {
        setFilterCourse({ search: value, page_number: 1 })
        getCourses({
            page_number: 1,
            page_size: filterCourse.page_size,
            search: value
        })
    }

    const renderCourses = () =>
        courses.map((p, index) => (
            <Option value={p.id} key={p.id}>
                {p.name}
            </Option>
        ))

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
            width: 150
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 150,
            render: (text) => text?.name
        },
        {
            title: 'Student document',
            dataIndex: 'student_document',
            key: 'student_document',
            width: 150,
            render: (text) =>
                text && (
                    <div
                        className='clickable'
                        onClick={() => toggleViewDocument(text)}
                        title={encodeFilenameFromLink(text) || 'View document'}
                    >
                        <Tag color='processing'>Preview document</Tag>
                    </div>
                )
        },

        {
            title: 'Audio',
            dataIndex: 'audio',
            align: 'center',
            key: 'audio',
            width: 150,
            render: (text, record: any) => {
                if (record?.audio) {
                    if (
                        !Array.isArray(record?.audio) ||
                        (Array.isArray(record?.audio) &&
                            record?.audio.length === 1)
                    ) {
                        return (
                            <div
                                className='clickable mb-1 display-flex'
                                onClick={() =>
                                    toggleViewAudio(
                                        Array.isArray(record?.audio)
                                            ? record?.audio[0]
                                            : record?.audio
                                    )
                                }
                                title={
                                    encodeFilenameFromLink(
                                        Array.isArray(record?.audio)
                                            ? record?.audio[0]
                                            : record?.audio
                                    ) || 'View audio'
                                }
                            >
                                <Tag color='processing'>View audio</Tag>
                            </div>
                        )
                    }
                    if (
                        Array.isArray(record?.audio) &&
                        record?.audio.length > 1
                    ) {
                        return record?.audio.map((item, index) => (
                            <div
                                className='mb-1 display-flex'
                                onClick={() => toggleViewAudio(item)}
                                title={
                                    encodeFilenameFromLink(item) || 'View audio'
                                }
                            >
                                <Tag className='clickable' color='processing'>
                                    View audio {index + 1}
                                </Tag>
                            </div>
                        ))
                    }
                }
            }
        },
        {
            title: 'Workbook',
            dataIndex: 'workbook',
            key: 'workbook',
            width: 150,
            render: (text) =>
                text && (
                    <div
                        className='clickable'
                        onClick={() => toggleViewDocument(text)}
                        title={encodeFilenameFromLink(text) || 'View workbook'}
                    >
                        <Tag color='processing'>View workbook</Tag>
                    </div>
                )
        },
        {
            title: 'Teacher document',
            dataIndex: 'teacher_document',
            key: 'teacher_document',
            width: 150,
            render: (text) =>
                text && (
                    <div
                        className='clickable'
                        onClick={() => toggleViewDocument(text)}
                        title={encodeFilenameFromLink(text) || 'View document'}
                    >
                        <Tag color='processing' className='text-truncate w-100'>
                            Preview document
                        </Tag>
                    </div>
                )
        },
        {
            title: 'Self-Study V1',
            dataIndex: 'homework',
            width: 150,
            key: 'homework',
            render: (text, record: any) =>
                text &&
                record.homework_id && (
                    <Tag color='processing' className='text-truncate  w-100'>
                        <a
                            style={{ color: 'rgb(24, 144, 255)' }}
                            href={`/quiz?quiz_id=${text.id}`}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {text?.name}
                        </a>
                    </Tag>
                )
        },
        {
            title: 'Self-Study V2',
            dataIndex: 'homework2',
            width: 150,
            key: 'homework2',
            render: (text, record: any) =>
                record?.homework2 &&
                record?.homework2_id && (
                    <Tag color='processing' className='text-truncate  w-100'>
                        {record?.homework2.topic}
                    </Tag>
                )
        },
        {
            title: 'Exam',
            dataIndex: 'exam',
            width: 180,
            key: 'exam',
            render: (text, record: any) => {
                return (
                    <div>
                        {record?.exam_type && (
                            <Tag color='red' className='text-truncate  w-100'>
                                {EnumExamType[record?.exam_type]}
                            </Tag>
                        )}
                        {record?.test_topic && (
                            <Tag color='green' className='text-truncate  w-100'>
                                {record?.test_topic.topic}
                            </Tag>
                        )}
                        {record?.ielts_reading_topic && (
                            <Tag color='green' className='text-truncate  w-100'>
                                Reading: {record?.ielts_reading_topic.topic}
                            </Tag>
                        )}
                        {record?.ielts_writing_topic && (
                            <Tag color='green' className='text-truncate  w-100'>
                                Writing: {record?.ielts_writing_topic.topic}
                            </Tag>
                        )}
                        {record?.ielts_listening_topic && (
                            <Tag color='green' className='text-truncate  w-100'>
                                Listening: {record?.ielts_listening_topic.topic}
                            </Tag>
                        )}
                    </div>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 150,
            fixed: 'right',
            render: (text, record) => (
                <Space size='large'>
                    {checkPermission(PERMISSIONS.pmu_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit unit'
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmu_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove unit'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Course',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, maxWidth: 500 }}
                    placeholder='Filter by course'
                    mode='multiple'
                    value={courseIds}
                    onChange={(val) => setCourseIds(val)}
                    filterOption={false}
                    loading={isLoadingCourse}
                    onPopupScroll={loadMoreCourse}
                    onSearch={_.debounce(onSearchCourse, 300)}
                >
                    {renderCourses()}
                    {isLoadingCourse && (
                        <Option key='loading' value=''>
                            <Spin size='small' />
                        </Option>
                    )}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Unit Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.pmu_create) ? (
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
                    ),
                    <Button type='primary'>
                        <a href={process.env.REACT_APP_TEMPLATE_HOMEWORK}>
                            <DownloadOutlined /> Template
                        </a>
                    </Button>
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={units}
                columns={columns}
                loading={isLoading}
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
            <UnitModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                courses={courses}
                toggleModal={toggleModal}
                refetchData={refetchData}
                loadMoreCourse={loadMoreCourse}
                onSearchCourse={onSearchCourse}
                isLoadingCourse={isLoadingCourse}
            />
        </Card>
    )
}

export default Unit
