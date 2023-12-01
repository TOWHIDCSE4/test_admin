import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Input,
    Col,
    Row,
    Select,
    Tabs,
    Table,
    Tooltip,
    Popover,
    notification
} from 'antd'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { notify } from 'utils/notify'
import moment from 'moment'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import Link from 'antd/lib/typography/Link'
import {
    CriteriaList,
    REGULAR_CARE_STATUS,
    STATUS_REGULAR_CARE
} from 'const/regular-care'
import {
    EnumPeriodicType,
    EnumPriority,
    EnumVNPeriodicType,
    IModalProps
} from 'const'
import RegularCareAPI from 'api/RegularCareAPI'
import { resolve } from 'path'
import { EnumLAReportType } from 'types/ILearningAssessmentReports'
import { EnumParentTypeActionHistory, EnumTypeActionHistory } from 'const/enum'

const { TabPane } = Tabs
const { Option } = Select
const { TextArea } = Input
const { Column, ColumnGroup } = Table

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    dataObjId?: any
    reporters?: any
    studentLevel?: any
}

const ActionHistoryModal: FC<IProps> = ({
    visible,
    dataObjId,
    reporters,
    studentLevel,
    toggleModal
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const { user } = useAuth()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            total: 0,
            page_number: 1,
            page_size: 10,
            parent_type: EnumParentTypeActionHistory.PERIODIC_REPORT
        }
    )

    const getAllActionHistory = ({
        page_size,
        page_number,
        parent_type,
        obj_id
    }) => {
        setLoading(true)
        const searchData = {
            obj_id,
            parent_type,
            page_number,
            page_size
        }
        RegularCareAPI.getListActionHistory(searchData)
            .then((res) => {
                if (res) {
                    let { total } = values
                    if (res.pagination && res.pagination.total >= 0) {
                        total = res.pagination.total
                    }
                    setValues({ data: res.data, total })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (visible && dataObjId) {
            getAllActionHistory({ ...values, obj_id: dataObjId })
        }
        console.log(reporters)
    }, [visible])

    const handleClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [toggleModal])

    const handleChangePagination = (page_number, page_size) => {
        setValues({ page_number, page_size })
        getAllActionHistory({
            page_number,
            page_size,
            parent_type: values.parent_type,
            obj_id: dataObjId
        })
    }

    const renderDetailAction = (record: any) => {
        let dataRender: any = ''
        let dataOld: any = ''
        let dataNew: any = ''
        switch (record?.type) {
            case EnumTypeActionHistory.PR_ADD_REPORT:
                dataRender = record?.content
                break
            case EnumTypeActionHistory.PR_ASSIGNED_ACADEMIC:
                dataNew = reporters.find(
                    (item: any) => item.value === Number(record?.data_new)
                ).label
                dataRender = `Update reporter to ${dataNew}`
                break
            case EnumTypeActionHistory.PR_CHANGE_REPORTER:
                dataOld = reporters.find(
                    (item: any) => item.value === Number(record?.data_old)
                ).label
                dataNew = reporters.find(
                    (item: any) => item.value === Number(record?.data_new)
                ).label
                dataRender = (
                    <>
                        {dataOld} <i className='fas fa-fw fa-arrow-right' />{' '}
                        {dataNew}
                    </>
                )
                break
            case EnumTypeActionHistory.PR_UPDATE_STATUS:
                dataOld = Object.keys(STATUS_REGULAR_CARE).find(
                    (key: any) =>
                        Number(STATUS_REGULAR_CARE[key]) ===
                        Number(record?.data_old)
                )
                dataNew = Object.keys(STATUS_REGULAR_CARE).find(
                    (key: any) =>
                        Number(STATUS_REGULAR_CARE[key]) ===
                        Number(record?.data_new)
                )
                dataRender = (
                    <>
                        {dataOld} <i className='fas fa-fw fa-arrow-right' />{' '}
                        {dataNew}
                    </>
                )
                break
            case EnumTypeActionHistory.PR_UPDATE_TYPE_REPORT:
                dataOld = Object.keys(EnumVNPeriodicType).find(
                    (key: any) =>
                        Number(EnumVNPeriodicType[key]) ===
                        Number(record?.data_old)
                )
                dataNew = Object.keys(EnumVNPeriodicType).find(
                    (key: any) =>
                        Number(EnumVNPeriodicType[key]) ===
                        Number(record?.data_new)
                )
                dataRender = (
                    <>
                        {dataOld} <i className='fas fa-fw fa-arrow-right' />{' '}
                        {dataNew}
                    </>
                )
                break
            case EnumTypeActionHistory.PR_UPDATE_PRIORITY:
                dataOld = Object.keys(EnumPriority).find(
                    (key: any) =>
                        Number(EnumPriority[key]) === Number(record?.data_old)
                )
                dataNew = Object.keys(EnumPriority).find(
                    (key: any) =>
                        Number(EnumPriority[key]) === Number(record?.data_new)
                )
                dataRender = (
                    <>
                        {dataOld} <i className='fas fa-fw fa-arrow-right' />{' '}
                        {dataNew}
                    </>
                )
                break
            case EnumTypeActionHistory.PR_UPDATE_LEVEL:
                dataOld = studentLevel.find(
                    (item: any) => item.id === Number(record?.data_old)
                )
                dataNew = studentLevel.find(
                    (item: any) => item.id === Number(record?.data_new)
                )
                dataRender = (
                    <>
                        {dataOld?.id} - {dataOld?.name}{' '}
                        <i className='fas fa-fw fa-arrow-right' /> {dataNew?.id}{' '}
                        - {dataNew?.name}
                    </>
                )
                break
            case EnumTypeActionHistory.PR_SYNC_DATA:
                dataRender = record?.content
                break
            default:
                dataRender = ''
                break
        }
        console.log(dataRender)
        return dataRender
    }

    const columns: any = [
        {
            title: 'STT',
            dataIndex: 'stt_contact',
            key: 'stt_contact',
            width: 50,
            align: 'left',
            render: (value: any, record: any, index) => {
                return <div>{index + 1}</div>
            }
        },
        {
            title: 'Time',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 120,
            align: 'left',
            render: (value: any) => {
                return value ? moment(value).format('HH:mm DD-MM-YYYY') : <></>
            }
        },
        {
            title: 'User action',
            dataIndex: 'staff',
            key: 'user_action',
            width: '30%',
            align: 'left',
            render: (value: any, record: any) => {
                return value ? (
                    <div>
                        {value.fullname} - {value.username}
                    </div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Action',
            dataIndex: 'type',
            key: 'action_type',
            width: '30%',
            align: 'left',
            render: (value: any, record: any) => {
                switch (value) {
                    case EnumTypeActionHistory.PR_ADD_REPORT:
                        return 'Add report'
                    case EnumTypeActionHistory.PR_ASSIGNED_ACADEMIC:
                        return 'Assigned to academic'
                    case EnumTypeActionHistory.PR_CHANGE_REPORTER:
                        return 'Change reporter'
                    case EnumTypeActionHistory.PR_UPDATE_STATUS:
                        return 'Update status'
                    case EnumTypeActionHistory.PR_UPDATE_TYPE_REPORT:
                        return 'Update type report'
                    case EnumTypeActionHistory.PR_UPDATE_PRIORITY:
                        return 'Update priority'
                    case EnumTypeActionHistory.PR_UPDATE_LEVEL:
                        return 'Update student level'
                    case EnumTypeActionHistory.PR_SYNC_DATA:
                        return 'Sync data'
                    default:
                        return ''
                }
            }
        },
        {
            title: 'Detail',
            dataIndex: 'type',
            key: 'detail_action',
            width: '45%',
            align: 'left',
            render: (value: any, record: any) => renderDetailAction(record)
        }
    ]

    const renderBody = () => (
        <Row>
            <Col span={24}>
                <Table
                    dataSource={values.data}
                    columns={columns}
                    pagination={{
                        defaultCurrent: values.page_number,
                        pageSize: values.page_size,
                        total: values.total,
                        onChange: handleChangePagination,
                        current: values.page_number
                    }}
                    scroll={{
                        y: 500
                    }}
                    rowKey={(record: any) => record.id}
                />
            </Col>
        </Row>
    )

    return (
        <Modal
            centered
            closable
            // maskClosable={true}
            visible={visible}
            onCancel={() => handleClose()}
            title='Action History'
            footer={[
                <Button
                    key='Close'
                    type='primary'
                    danger
                    onClick={() => handleClose()}
                >
                    Close
                </Button>
            ]}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(ActionHistoryModal)
