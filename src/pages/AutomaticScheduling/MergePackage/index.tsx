import {
    useEffect,
    useReducer,
    useCallback,
    FunctionComponent,
    useState
} from 'react'
import {
    Table,
    Card,
    notification,
    Space,
    Modal,
    Input,
    Select,
    Form,
    Tag,
    Button,
    Popconfirm
} from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import _ from 'lodash'
import moment from 'moment'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import NameTeacherStudent from 'components/name-teacher-student'
import StudentAPI from 'api/StudentAPI'
import SearchUser from 'components/search-user-with-lazy-load'
import MergePackageAPI from 'api/MergePackageAPI'
import AddNewModal from './add-new'

const { Search } = Input
const { Option } = Select

const AllScheduling: FunctionComponent = () => {
    const [isShownModal, setIsShownModal] = useState(false)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            student_id: '',
            students: []
        }
    )
    const [form] = Form.useForm()
    const [filterStudent, setFilterStudent] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            status: 'active',
            search: ''
        }
    )

    const getAllMergedPackage = ({ page_size, page_number, student_id }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            student_id
        }
        MergePackageAPI.getMergedPackages(searchData)
            .then((res) => {
                let total = 0
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ data: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getAllMergedPackage({
            ...values,
            page_number,
            page_size
        })
    }

    const deleteMergedPackage = (item) => {
        setValues({ isLoading: true })
        MergePackageAPI.deleteMergedPackage({ _id: item._id })
            .then((res) => {
                getAllMergedPackage({
                    ...values
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllMergedPackage({ ...values })
    }, [])

    const columns = [
        {
            title: 'Student',
            dataIndex: 'student',
            key: 'student',
            render: (text, record) => (
                <NameTeacherStudent
                    data={text}
                    type='student'
                ></NameTeacherStudent>
            )
        },
        {
            title: 'Package',
            dataIndex: 'package_one',
            key: 'package_one',
            render: (text, record) => {
                return (
                    <>
                        <p>Package A: {text?.package_name}</p>
                        <p>Package B: {record?.package_two?.package_name}</p>
                    </>
                )
            }
        },

        {
            title: 'Action',
            key: 'action',
            render: (text, record) =>
                checkPermission(PERMISSIONS.asmp_delete) && (
                    <Space size='middle'>
                        <Popconfirm
                            key='reject'
                            title='Bạn có muốn xóa không?'
                            onConfirm={() => deleteMergedPackage(record)}
                            okText='Yes'
                            cancelText='No'
                        >
                            <DeleteOutlined
                                style={{ color: red.primary }}
                                type='button'
                            />
                        </Popconfirm>
                    </Space>
                )
        }
    ]

    const searchDataUserStudent = (data) => {
        if (data.selected) {
            const searchText = data.selected.id
            const dataSet = {
                ...values,
                student_id: searchText,
                total: 0,
                page_number: 1
            }
            setValues(dataSet)
            getAllMergedPackage(dataSet)
        }
        if (data.clear) {
            const dataSet = {
                ...values,
                student_id: '',
                total: 0,
                page_number: 1
            }
            setValues(dataSet)
            getAllMergedPackage(dataSet)
        }
    }

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Student',
            engine: (
                <SearchUser
                    api={StudentAPI.getAllStudents}
                    placeholder='Search by student'
                    searchDataUser={searchDataUserStudent}
                    filter={filterStudent}
                ></SearchUser>
            )
        }
    ]

    const toggleModal = useCallback(
        (value: boolean) => {
            setIsShownModal(value)
        },
        [values]
    )

    return (
        <Card title='Merge Package'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.asmp_create) ? (
                        <Button
                            type='primary'
                            onClick={() => toggleModal(true)}
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
                dataSource={values.data}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record.id}
                loading={values.isLoading}
            />
            <AddNewModal
                visible={isShownModal}
                toggleModal={toggleModal}
                data={values}
                refetchData={() => getAllMergedPackage({ ...values })}
            />
        </Card>
    )
}

export default AllScheduling
