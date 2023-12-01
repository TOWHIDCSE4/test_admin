import { useEffect, useCallback, FC, useState } from 'react'
import {
    Table,
    Card,
    Space,
    Modal,
    Button,
    Row,
    Col,
    Tag,
    Select,
    Input
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BookOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import { ICurriculum, EnumCurriculumAgeList } from 'types'
import CurriculumAPI from 'api/CurriculumAPI'
import { ColumnsType } from 'antd/lib/table'
import moment from 'moment'
import { DATE_FORMAT } from 'const'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import CurriculumModal from './curriculum-modal'
import AddCourseModal from './add-course'

const { Option } = Select
const { Search } = Input

const Curriculum: FC = () => {
    const [isLoading, setLoading] = useState(false)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ICurriculum>(null)
    const [curriculums, setCurriculums] = useState<ICurriculum[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [ageList, setAgeList] = useState<EnumCurriculumAgeList>(null)
    const [search, setSearch] = useState('')
    const [visibleAddCourse, setVisibleAddCourse] = useState(false)

    const toggleCourseModal = useCallback(
        (value: boolean) => {
            setVisibleAddCourse(value)
        },
        [visibleAddCourse]
    )
    const fetchCurriculums = (query: {
        page_size?: number
        page_number?: number
        age_list?: EnumCurriculumAgeList
        search?: string
    }) => {
        setLoading(true)
        CurriculumAPI.getCurriculums(query)
            .then((res) => {
                setCurriculums(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchCurriculums({
            page_size: pageSize,
            page_number: pageNumber,
            age_list: ageList,
            search
        })
    }, [])

    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setVisible(value)
            setModalType(_modalType)
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

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            fetchCurriculums({
                page_number: pageNumber,
                page_size: _pageSize,
                age_list: ageList,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            fetchCurriculums({
                page_number: _pageNumber,
                page_size: pageSize,
                age_list: ageList,
                search
            })
        }
    }

    const refetchData = useCallback(() => {
        fetchCurriculums({
            page_size: pageSize,
            page_number: pageNumber,
            age_list: ageList,
            search
        })
    }, [pageSize, pageNumber, search, ageList])

    const removeCurriculum = useCallback((id: number) => {
        setLoading(true)
        CurriculumAPI.removeCurriculums(id)
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
                removeCurriculum(item.id)
            }
        })
    }, [])

    const onChangeAgeList = (val) => {
        setAgeList(val)
        setPageNumber(1)
        fetchCurriculums({
            page_number: 1,
            page_size: pageSize,
            age_list: val,
            search
        })
    }

    const onSearch = (value) => {
        setSearch(value)
        setPageNumber(1)
        fetchCurriculums({
            page_number: 1,
            page_size: pageSize,
            age_list: ageList,
            search: value
        })
    }

    const onClickAddCourse = (val) => {
        setSelectedItem(val)
        toggleCourseModal(true)
    }

    const columns: ColumnsType<ICurriculum> = [
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
            width: 200
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Age list',
            dataIndex: 'age_list',
            key: 'age_list',
            width: 150,
            render: (text) => {
                if (text && text.length > 0) {
                    return text.map((item, index) => (
                        <p key={index} className='mb-1'>
                            <Tag color='processing'>
                                {_.get(
                                    EnumCurriculumAgeList,
                                    _.toInteger(item)
                                )}
                            </Tag>
                        </p>
                    ))
                }
            }
        },
        {
            title: 'Created time',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 120,
            render: (text) => text && moment(text).format(DATE_FORMAT)
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.pmc_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit teacher level'
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmc_update) && (
                        <BookOutlined
                            style={{ color: 'green' }}
                            type='button'
                            title='Add questions to quiz'
                            onClick={() => onClickAddCourse(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmc_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove teacher level'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by age list'
                    value={ageList}
                    onChange={onChangeAgeList}
                >
                    <Option value={null} key={-1}>
                        ALL STATUS
                    </Option>
                    {Object.keys(EnumCurriculumAgeList)
                        .filter(
                            (key: any) =>
                                !isNaN(Number(EnumCurriculumAgeList[key]))
                        )
                        .map((key: any) => (
                            <Option
                                value={EnumCurriculumAgeList[key]}
                                key={EnumCurriculumAgeList[key]}
                            >
                                {_.upperCase(_.startCase(key))}
                            </Option>
                        ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , alias'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Curriculums Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.pmc_create) ? (
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
                dataSource={curriculums}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
            <CurriculumModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
            <AddCourseModal
                visible={visibleAddCourse}
                data={selectedItem}
                toggleModal={toggleCourseModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Curriculum
