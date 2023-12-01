import Modal from 'antd/lib/modal/Modal'
import React, {
    memo,
    useCallback,
    useState,
    FC,
    useEffect,
    useReducer
} from 'react'
import { Col, Row, Button, Spin, Input, Select } from 'antd'

import _ from 'lodash'
import { IScheduledMemo, EnumScheduledMemoType } from 'types'
import { notify } from 'utils/notify'
import ScheduledMemoAPI from 'api/ScheduledMemo'
import TeacherAPI from 'api/TeacherAPI'
import { IModalProps } from 'const/common'
import EditableTableMemo from './editable-table-memo'

const { TextArea } = Input
const { Option } = Select

interface IProps extends IModalProps {
    disabled?: boolean
    data: IScheduledMemo
    memoType: EnumScheduledMemoType
    refetchData: () => void
}

const ScheduledMemoModal: FC<IProps> = ({
    visible,
    disabled = false,
    data,
    toggleModal,
    memoType,
    refetchData
}) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [assessment, setAssessment] = useState({})
    const [teacherNote, setTeacherNote] = useState('')
    const [adminNote, setAdminNote] = useState('')
    const [teacherId, setTeacherId] = useState()
    const [teachers, setTeachers] = useReducer(
        (prev, newState) => ({ ...prev, ...newState }),
        {
            page_size: 20,
            page_number: 1,
            total: 0,
            data: [],
            search: '',
            isFetching: false
        }
    )

    const onClose = useCallback(() => {
        toggleModal(false)
        setTeacherNote('')
        setAdminNote('')
        setAssessment({})
    }, [])

    const onSubmit = useCallback(() => {
        if (data?.id) {
            const memoPayload = {
                teacher_note: teacherNote,
                attendance_comment: _.get(
                    _.find(assessment, (o: any) => o?.key === 'attendance'),
                    'comment'
                ),
                attitude_comment: _.get(
                    _.find(assessment, (o: any) => o?.key === 'attitude'),
                    'comment'
                ),
                homework_comment: _.get(
                    _.find(assessment, (o: any) => o?.key === 'homework'),
                    'comment'
                ),
                admin_note: adminNote,
                teacher_id: teacherId
            }
            setLoading(true)
            ScheduledMemoAPI.editScheduledMemo(data.id, memoPayload)
                .then((res) => {
                    notify('success', ' Update successfully')
                    refetchData()
                    onClose()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        }
    }, [data, assessment, teacherNote, adminNote, teacherId])

    const getTeachers = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        TeacherAPI.getAllTeachers({
            page_size: query?.page_size,
            page_number: query?.page_number,
            search: query?.search
        })
            .then((res) => {
                let newTeachers = [...res.data]
                if (query.page_number > 1) {
                    newTeachers = [...teachers.data, ...res.data]
                }
                setTeachers({ data: newTeachers, total: res.pagination.total })
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        if (visible) {
            setTeacherNote(data?.teacher_note)
            setAdminNote(data?.admin_note)
        }
        getTeachers({
            page_number: teachers.page_number,
            page_size: teachers.page_size
        })
    }, [visible])

    const loadMore = () => {
        if (teachers.page_number * teachers.page_size < teachers.total) {
            getTeachers({
                page_size: teachers.page_size,
                page_number: teachers.page_number + 1,
                search: teachers.search
            })
            setTeachers({ page_number: teachers.page_number + 1 })
        }
    }

    const onSearchCourse = (val) => {
        getTeachers({
            page_size: teachers.page_size,
            page_number: 1,
            search: val
        })
        setTeachers({ page_number: 1, search: val })
    }
    const renderTeachers = () =>
        teachers.data.map((item, index) => (
            <Option value={item.user_id} key={item.user_id}>
                {item?.user?.full_name}
            </Option>
        ))

    const onChangeTeacher = (val) => {
        setTeacherId(val)
    }
    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            maskClosable={true}
            width={1024}
            title={
                data &&
                `${data?.teacher?.full_name} - ${data?.student?.full_name} `
            }
            centered
            closable
            footer={
                !disabled && [
                    <Button
                        key='submit'
                        type='primary'
                        shape='round'
                        disabled={loading || disabled}
                        onClick={onSubmit}
                    >
                        Submit
                    </Button>
                ]
            }
        >
            <Spin spinning={loading}>
                <p>
                    <strong>Course:</strong> {data?.course?.name}
                </p>
                <p>
                    <strong>Registered class:</strong> {data?.registered_class}
                </p>
                <p>
                    <strong>Completed class:</strong> {data?.completed_class}
                </p>
                <EditableTableMemo
                    data={data}
                    onChangeAssessment={setAssessment}
                    memoType={memoType}
                />
                <Row className='mt-4'>
                    <Col span={5}>
                        <strong>Change teacher:</strong>
                    </Col>
                    <Col span={19}>
                        <Select
                            style={{
                                width: '250px',
                                borderRadius: '10px'
                            }}
                            placeholder='Choose teacher to change'
                            showSearch
                            autoClearSearchValue
                            allowClear
                            filterOption={false}
                            loading={teachers.isFetching}
                            onPopupScroll={loadMore}
                            onSearch={_.debounce(onSearchCourse, 300)}
                            value={teacherId}
                            onChange={onChangeTeacher}
                        >
                            {renderTeachers()}
                            {teachers.isFetching && (
                                <Select.Option key='loading' value=''>
                                    <Spin size='small' />
                                </Select.Option>
                            )}
                        </Select>
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col span={5}>
                        <strong>Teacher note:</strong>
                    </Col>
                    <Col span={19}>
                        <TextArea
                            placeholder='Another comment'
                            onChange={(e: any) =>
                                setTeacherNote(e.currentTarget.value)
                            }
                            value={teacherNote}
                        />
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col span={5}>
                        <strong>Admin note:</strong>
                    </Col>
                    <Col span={19}>
                        <TextArea
                            placeholder='Admin comment'
                            onChange={(e: any) =>
                                setAdminNote(e.currentTarget.value)
                            }
                            value={adminNote}
                        />
                    </Col>
                </Row>
            </Spin>
        </Modal>
    )
}

export default memo(ScheduledMemoModal)
