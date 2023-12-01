import React, { useCallback } from 'react'
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    notification,
    Popover,
    Tag,
    Col,
    Row
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import StudentLevelAPI from 'api/StudentLevelAPI'
import _ from 'lodash'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import AddLevelModal from './modal/AddLevelModal'
import ConfirmModal from '../../../core/Atoms/ConfirmModal'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { Search } = Input

const StudentLevel = () => {
    const [loading, setLoading] = React.useState(false)
    const [pageNumber, setPageNumber] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(6)
    const [total, setTotal] = React.useState(0)
    const [data, setData] = React.useState([])
    const [visibleAddModal, setVisibleAddModal] = React.useState(false)
    const [selectedLevel, setSelectedLevel] = React.useState(null)
    const [search, setSearch] = React.useState(null)

    const fetchData = useCallback(
        async (query?: {
            page_size: number
            page_number: number
            search?: string
        }) => {
            setLoading(true)
            StudentLevelAPI.getStudentLevels(query)
                .then((res) => {
                    setLoading(false)
                    setData(res.data)
                    setTotal(res.pagination.total)
                })
                .catch((err) => {
                    setLoading(false)
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
        },
        []
    )

    React.useEffect(() => {
        fetchData({ page_size: pageSize, page_number: pageNumber, search })
    }, [])

    const handleChangePagination = useCallback(
        (page_number, page_size) => {
            setPageSize(page_size)
            setPageNumber(page_number)
            fetchData({ page_size, page_number, search })
        },
        [search]
    )

    const onSearchString = useCallback(
        (s) => {
            setSearch(s)
            fetchData({
                page_size: pageSize,
                page_number: pageNumber,
                search: s
            })
        },
        [pageNumber, pageSize]
    )

    const columns: ColumnsType = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record, index) => text
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record) => text
        },
        {
            title: 'Grammar',
            dataIndex: 'grammar_description',
            key: 'grammar_description',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record) => (
                <Popover
                    overlayStyle={{
                        width: '30vw'
                    }}
                    content={text}
                >
                    {text.substring(0, 60)}...
                </Popover>
            )
        },
        {
            title: 'Skill',
            dataIndex: 'skill_description',
            key: 'skill_description',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record) => (
                <Popover
                    overlayStyle={{
                        width: '30vw'
                    }}
                    content={text}
                >
                    {text.substring(0, 60)}...
                </Popover>
            )
        },
        {
            title: 'Speaking',
            dataIndex: 'speaking_description',
            key: 'speaking_description',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record) => (
                <Popover
                    overlayStyle={{
                        width: '30vw'
                    }}
                    content={text}
                >
                    {text.substring(0, 60)}...
                </Popover>
            )
        },
        {
            title: 'Vocabulary',
            dataIndex: 'vocabulary_description',
            key: 'vocabulary_description',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record) => (
                <Popover
                    overlayStyle={{
                        width: '30vw'
                    }}
                    content={text}
                >
                    {text.substring(0, 60)}...
                </Popover>
            )
        },
        {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            width: '4%',
            align: 'center',
            render: (text, record: any) => (
                <>
                    {checkPermission(PERMISSIONS.sasl_delete) && (
                        <Button
                            size='small'
                            type='link'
                            onClick={() => {
                                ConfirmModal({
                                    content: `Are you sure to delete student level named ${record.name}?`,
                                    onOk: async () => {
                                        await StudentLevelAPI.deleteStudentLevel(
                                            record.id
                                        )
                                        fetchData({
                                            page_size: pageSize,
                                            page_number: pageNumber
                                        })
                                    }
                                })
                            }}
                        >
                            Delete
                        </Button>
                    )}
                    {checkPermission(PERMISSIONS.sasl_update) && (
                        <Button
                            size='small'
                            type='link'
                            onClick={() => {
                                setSelectedLevel(record)
                                setVisibleAddModal(true)
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearchString, 250)}
                />
            )
        }
    ]

    return (
        <>
            <Card title='Student Levels'>
                <FilterDataWrapper
                    extensionOut={[
                        checkPermission(PERMISSIONS.sasl_create) ? (
                            <Button
                                type='primary'
                                onClick={() => {
                                    setSelectedLevel(null)
                                    setVisibleAddModal(true)
                                }}
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
                    loading={loading}
                    columns={columns}
                    dataSource={data.map((d, i) => ({ key: i, ...d }))}
                    bordered
                    pagination={{
                        defaultCurrent: pageNumber,
                        pageSize,
                        total,
                        onChange: handleChangePagination
                    }}
                />
            </Card>
            <AddLevelModal
                visible={visibleAddModal}
                reload={() =>
                    fetchData({ page_size: pageSize, page_number: pageNumber })
                }
                toggleModal={() => setVisibleAddModal(false)}
                selectedLevel={selectedLevel}
            />
        </>
    )
}

export default StudentLevel
