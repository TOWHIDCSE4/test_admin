import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Button,
    Space,
    Row,
    Col,
    Input,
    Card,
    Image,
    Modal,
    Select,
    Popover,
    Tag,
    Spin
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BookOutlined
} from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import CourseAPI from 'api/CourseAPI'
import PackageAPI from 'api/PackageAPI'
import SubjectAPI from 'api/SubjectAPI'
import { notify } from 'utils/notify'
import {
    ISubject,
    IPackage,
    ICourse,
    ICurriculum,
    EnumCourseStatus
} from 'types'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'

import CurriculumAPI from 'api/CurriculumAPI'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import CourseModal from './course-modal'
import ConfirmRemoveCourse from './confirm-remove-course-modal'
import UpdateUnitModal from './update-unit'

const { Search } = Input
const { Option } = Select

const Course = () => {
    const [subjects, setSubjects] = useState<ISubject[]>([])
    const [packages, setPackages] = useState<IPackage[]>([])
    const [curriculums, setCurriculums] = useState<ICurriculum[]>([])
    const [courses, setCourses] = useState<ICourse[]>([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [packageIds, setPackageId] = useState([])
    const [subjectIds, setSubjectIds] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<ICourse>(null)
    const [validateRemoveCourse, setValidateRemoveCourse] = useState<any>()
    const [visibleConfirmRemove, setVisibleConfirmRemove] = useState(false)
    const [status, setStatus] = useState(EnumCourseStatus.ALL_STATUS)

    const fetchCurriculums = () => {
        setLoading(true)
        CurriculumAPI.getCurriculums()
            .then((res) => {
                setCurriculums(res.data)
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
        package_ids?: number[]
        subject_ids?: number[]
        status?: any
    }) => {
        setLoading(true)
        CourseAPI.getCourses(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setCourses(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const getPackages = () => {
        PackageAPI.getAllPackages()
            .then((res) => {
                setPackages(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    const getSubjects = () => {
        SubjectAPI.getSubjects()
            .then((res) => {
                setSubjects(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        getCourses({ page_number: pageNumber, page_size: pageSize })
        getSubjects()
        getPackages()
        fetchCurriculums()
    }, [])

    useEffect(() => {
        setPageNumber(1)
        getCourses({
            page_number: 1,
            page_size: pageSize,
            search,
            package_ids: packageIds,
            subject_ids: subjectIds,
            status
        })
    }, [subjectIds, packageIds])

    const refetchData = () => {
        getCourses({ page_number: pageNumber, page_size: pageSize, status })
    }

    const onChangeStatus = useCallback(
        (item) => {
            setStatus(item)
            getCourses({
                page_number: 1,
                page_size: pageSize,
                search,
                package_ids: packageIds,
                subject_ids: subjectIds,
                status: item
            })
            setPageNumber(1)
        },
        [pageNumber, pageSize, search, status, packageIds, subjectIds]
    )

    const onSearch = useCallback(
        (value) => {
            setPageNumber(1)
            setSearch(value)
            getCourses({
                search: value,
                page_number: 1,
                page_size: pageSize,
                package_ids: packageIds,
                subject_ids: subjectIds,
                status
            })
        },
        [search, pageSize, pageNumber, status]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getCourses({
                page_number: pageNumber,
                page_size: _pageSize,
                search,
                package_ids: packageIds,
                subject_ids: subjectIds,
                status
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getCourses({
                page_number: _pageNumber,
                page_size: pageSize,
                search,
                package_ids: packageIds,
                subject_ids: subjectIds,
                status
            })
        }
    }

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

    const removeCourse = useCallback((id: number) => {
        setLoading(true)
        CourseAPI.removeCourse(id)
            .then((res) => {
                if (
                    !_.isEmpty(res) &&
                    !_.isEmpty(res.booked_data) &&
                    (!_.isEmpty(res.booked_data.bookings) ||
                        !_.isEmpty(res.booked_data.regular_calendars))
                ) {
                    setValidateRemoveCourse(res.booked_data)
                    setVisibleConfirmRemove(true)
                } else {
                    notify('success', res.message)
                    refetchData()
                }
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
                removeCourse(item.id)
            }
        })
    }, [])

    const renderPackages = () =>
        packages.map((p, index) => (
            <Option value={p.id} key={p.id}>
                {p.name}
            </Option>
        ))

    const renderSubjects = () =>
        subjects.map((p, index) => (
            <Option value={p.id} key={p.id}>
                {p.name}
            </Option>
        ))

    const [visibleEditUnit, setVisibleEditUnit] = useState(false)
    const toggleCourseModal = useCallback(
        (value: boolean) => {
            setVisibleEditUnit(value)
        },
        [visibleEditUnit]
    )

    const onClickEditUnit = (val) => {
        setSelectedItem(val)
        toggleCourseModal(true)
    }

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
            title: 'Preview',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Image width={50} src={text} onError={() => true} />
            )
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
            key: 'description',
            width: 300
        },
        {
            title: 'Curriculums',
            dataIndex: 'curriculum_id',
            key: 'curriculum_id',
            width: 150,
            render: (text) => {
                const curri = _.find(curriculums, (o) => o.id === text)
                if (curri) return <p>{curri.name.toUpperCase()}</p>
            }
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: 150,
            render: (text, record) => {
                if (text && text.length > 0) {
                    return text.map((item, index) => (
                        <Tag color='processing' key={index} className='mb-2'>
                            {_.startCase(item)}
                        </Tag>
                    ))
                }
            }
        },
        {
            title: 'Package',
            dataIndex: 'packages',
            key: 'packages',
            width: 200,
            render: (text, record) => {
                if (!_.isEmpty(text)) {
                    if (text.length === 1) return text[0].name
                    return (
                        <Popover
                            content={
                                <div
                                    style={{
                                        maxHeight: '200px',
                                        height: '200px',
                                        overflow: 'auto'
                                    }}
                                >
                                    {text.map((item, index) => (
                                        <p key={index} className='p-0'>
                                            {index + 1}. {item.name}
                                        </p>
                                    ))}
                                </div>
                            }
                        >
                            <Tag color='processing'>{text.length} packages</Tag>
                        </Popover>
                    )
                }
                return <Tag color='processing'>All packages</Tag>
            }
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 100,
            render: (text) => text?.name
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            align: 'center',
            render: (text, record, index) => {
                if (text) return <Tag color='success'>Active</Tag>
                return <Tag color='error'>Inactive</Tag>
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.pmc2_update) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => onEdit(record)}
                            title='Edit course'
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmc2_update) && (
                        <BookOutlined
                            style={{ color: 'green' }}
                            type='button'
                            onClick={() => onClickEditUnit(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.pmc2_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => onRemove(record)}
                            title='Remove course'
                        />
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Subject',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by subject'
                    value={subjectIds}
                    onChange={(val) => setSubjectIds(val)}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {renderSubjects()}
                </Select>
            )
        },
        {
            label: 'Packages',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by package'
                    value={packageIds}
                    onChange={(val) => setPackageId(val)}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {renderPackages()}
                </Select>
            )
        },
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showSearch
                    showArrow
                    style={{ minWidth: 200, width: 'auto' }}
                    placeholder='Filter by type'
                    optionFilterProp='children'
                    value={status}
                    onChange={onChangeStatus}
                    filterOption={(input, option) =>
                        _.isString(option.children) &&
                        option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Select.Option value={EnumCourseStatus.ALL_STATUS}>
                        ALL
                    </Select.Option>
                    <Select.Option value={EnumCourseStatus.ACTIVE}>
                        ACTIVE
                    </Select.Option>
                    <Select.Option value={EnumCourseStatus.INACTIVE}>
                        INACTIVE
                    </Select.Option>
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name , slug , alias'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const [selectedPackages, setSelectedPackages] = useState([])
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }
    const setPackagesId = (val) => {
        setSelectedPackages(val)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }
    const hasSelected = selectedRowKeys.length > 0
    const updatePackage = async () => {
        const data = {
            list_course: selectedRowKeys,
            list_package: selectedPackages
        }
        console.log(data)

        setLoadingUpdate(true)
        CourseAPI.assignCourseToPackage(data)
            .then((res) => {
                console.log(res)
                getCourses({
                    page_number: pageNumber,
                    page_size: pageSize,
                    search,
                    package_ids: packageIds,
                    subject_ids: subjectIds,
                    status
                })
                setSelectedRowKeys([])
                setSelectedPackages([])
                notify('success', 'Cập nhật thành công')
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoadingUpdate(false))
    }

    return (
        <Card title='Course Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.pmc2_create) ? (
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

            {checkPermission(PERMISSIONS.pmc2_update) && (
                <div className='d-flex align-items-center'>
                    <div>
                        Apply {selectedRowKeys.length} courses for{' '}
                        <Select
                            allowClear
                            showSearch
                            showArrow
                            mode='multiple'
                            style={{ minWidth: 200, width: 'auto' }}
                            placeholder='Select package'
                            optionFilterProp='children'
                            value={selectedPackages}
                            onChange={(val) => {
                                if (val.includes('all')) {
                                    val = packages
                                        .filter((e) => e.is_active)
                                        .map((item) => item.id)
                                    setPackagesId(val)
                                }
                                setPackagesId(val)
                            }}
                            filterOption={(input, option) =>
                                _.isString(option.children) &&
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Option value='all'>Choose All</Option>
                            {packages
                                .filter((e) => e.is_active)
                                .map((p, index) => (
                                    <Option value={p.id} key={p.id}>
                                        {p.name}
                                    </Option>
                                ))}
                        </Select>
                    </div>

                    <Button
                        className='my-3 ml-2'
                        type='primary'
                        disabled={
                            loadingUpdate ||
                            !hasSelected ||
                            !selectedPackages.length
                        }
                        onClick={() => updatePackage()}
                    >
                        <Spin
                            size='small'
                            className='mr-2'
                            spinning={loadingUpdate}
                        />
                        Update
                    </Button>
                </div>
            )}

            <Table
                rowSelection={rowSelection}
                bordered
                dataSource={courses}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: ICourse) => record?.id}
                scroll={{
                    x: 500
                }}
                sticky
            />
            <CourseModal
                visible={visibleModal}
                type={modalType}
                data={selectedItem}
                packages={packages}
                subjects={subjects}
                curriculums={curriculums}
                toggleModal={toggleModal}
                refetchData={refetchData}
                toggleModalConfirm={(val) => setVisibleConfirmRemove(val)}
                setValidateRemoveCourse={(val) => setValidateRemoveCourse(val)}
            />
            <ConfirmRemoveCourse
                data={validateRemoveCourse}
                visible={visibleConfirmRemove}
                toggleModal={(val) => setVisibleConfirmRemove(val)}
            />
            <UpdateUnitModal
                visible={visibleEditUnit}
                data={selectedItem}
                toggleModal={toggleCourseModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Course
