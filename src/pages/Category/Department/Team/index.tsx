import React, {
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
import TeamAPI from 'api/TeamAPI'
import { notify } from 'utils/notify'
import { debounce } from 'lodash-es'
import { Button, Modal, Table, Space, Card, Row, Col, Input } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { EnumAction } from 'const/enum'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { ModalFormDepartmentRef } from './interface'
import ModalForm from './ModalForm'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'

const { confirm } = Modal

const Role = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false
        }
    )

    const [search, setSearch] = useState('')

    const refModalForm = useRef<ModalFormDepartmentRef>(null)

    const loadData = (text?: string) => {
        setValues({
            isLoading: true
        })
        TeamAPI.getTeams({ search: text || search })
            .then((res) => {
                setValues({
                    data: res
                })
            })
            .catch((err) => notify('error', err.message))
            .finally(() =>
                setValues({
                    isLoading: false
                })
            )
    }

    useEffect(() => {
        loadData()
    }, [])

    const clickNew = useCallback(() => {
        refModalForm.current?.showModal()
    }, [])

    const clickEdit = useCallback((item) => {
        refModalForm.current?.showModal(item)
    }, [])

    const onFilter = useCallback((text) => {
        setSearch(text)
        loadData(text)
    }, [])

    const deleteRole = async (id) => {
        TeamAPI.removeTeam(id)
            .then((res) => {
                notify('success', 'Xóa thành công')
                loadData()
            })
            .catch((err) => notify('error', err.message))
    }

    const showConfirmDelete = (item) => {
        confirm({
            title: `Bạn có muốn xóa phòng/ban ${item?.name || ''}?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteRole(item?.id)
            }
        })
    }

    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            render: (_text, _record, index) => index + 1
        },
        {
            title: 'Tên nhóm',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Phòng/ban',
            dataIndex: 'department',
            key: 'department',
            render: (text) => text?.name
        },
        {
            title: 'Trưởng nhóm',
            dataIndex: 'leader',
            key: 'leader',
            render: (text) => text?.fullname
        },
        {
            title: 'Số lượng thành viên',
            dataIndex: 'members',
            key: 'members',
            render: (text, record) =>
                (text?.length || 0) + (record?.leader ? 1 : 0)
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: '',
            key: 'action',
            render: (_text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.hrmtm_update) && (
                        <Button
                            type='primary'
                            onClick={() => clickEdit(record)}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                    {checkPermission(PERMISSIONS.hrmtm_delete) && (
                        <Button
                            danger
                            onClick={() => showConfirmDelete(record)}
                        >
                            Xóa
                        </Button>
                    )}
                </Space>
            )
        }
    ]

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: <Input.Search onSearch={debounce(onFilter, 300)} />
        }
    ]

    return (
        <Card
            title='Danh mục nhóm'
            bordered={false}
            className='admin-department-team'
        >
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.hrmtm_create) && (
                        <Button type='primary' onClick={clickNew}>
                            Thêm mới
                        </Button>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                loading={values.isLoading}
                dataSource={values?.data || []}
                columns={columns}
                rowKey={(v) => v?._id}
                scroll={{
                    x: 500
                }}
            />

            <ModalForm ref={refModalForm} callBack={loadData} />
        </Card>
    )
}

export default Role
