import { FC, memo, useCallback, useEffect, useState } from 'react'
import { ColumnsType } from 'antd/lib/table'
import { Modal, Button, Form, Row, Col, Card, Table, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { EnumQuizLevel, IQuiz, EnumQuestionType } from 'types'
import QuizAPI from 'api/QuizAPI'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import sanitizeHtml from 'sanitize-html'
import QuestionAPI from 'api/QuestionAPI'
import CurriculumAPI from 'api/CurriculumAPI'
import UnitAPI from 'api/UnitAPI'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

type Props = {
    data?: any
    visible: boolean
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const AddQuestionModal: FC<Props> = ({
    visible,
    data,
    toggleModal,
    refetchData
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [modalData, setModalData] = useState([])
    const [dataAdd, setDataAdd] = useState(null)
    let units = []

    const getInfo = async (id: number) => {
        UnitAPI.getUnits({ page_number: 1, page_size: 999, course_ids: [id] })
            .then((res) => {
                setModalData(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        form.resetFields()
        setModalData([])
        setDataAdd(null)
        if (data) {
            getInfo(data?.id)
        }
    }, [visible])

    const onClose = () => {
        toggleModal(false)
    }

    const moveItemUp = async (item) => {
        const temp = [...modalData]
        const index = temp.findIndex((e) => e._id === item._id)
        if (index !== -1) {
            let indexB = index - 1
            if (indexB < 0) {
                indexB = temp.length - 1
            }
            const b = temp[index]
            temp[index] = temp[indexB]
            temp[indexB] = b
        }
        setModalData(temp)
    }

    const moveItemDown = async (item) => {
        const temp = [...modalData]
        const index = temp.findIndex((e) => e._id === item._id)
        if (index !== -1) {
            let indexB = index + 1
            if (indexB >= temp.length) {
                indexB = 0
            }
            const b = temp[index]
            temp[index] = temp[indexB]
            temp[indexB] = b
        }
        setModalData(temp)
    }

    const remove = (item) => {
        const temp = [...modalData]
        const index = temp.findIndex((e) => e._id === item._id)
        if (index !== -1) {
            temp.splice(index, 1)
        }
        setModalData(temp)
    }

    const columns: ColumnsType = [
        {
            title: 'Order',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 50,
            align: 'center',
            fixed: true,
            render: (text, record, index) => index + 1
        },
        {
            title: 'Change Order',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 80,
            align: 'center',
            fixed: true,
            render: (text, record, index) => (
                <>
                    <Button onClick={() => moveItemUp(record)} title='Move up'>
                        <ArrowUpOutlined />
                    </Button>{' '}
                    <Button
                        onClick={() => moveItemDown(record)}
                        title='Move Down'
                    >
                        <ArrowDownOutlined />
                    </Button>
                    {/* {index + 1} */}
                </>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            width: 200,
            key: 'name',
            align: 'left',
            fixed: true,
            render: (text, record) => text
        },
        {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            render: (text, record: any) => (
                <>
                    <Button
                        size='small'
                        type='primary'
                        onClick={() => remove(record)}
                    >
                        Remove
                    </Button>
                </>
            )
        }
    ]

    const fetchUnits = async (search) => {
        try {
            const res = await UnitAPI.getUnits({
                page_number: 1,
                page_size: 200,
                search,
                course_ids: [-1]
            })
            if (res) {
                units = res.data
                return res.data.map((i) => ({
                    label: `${i.name}`,
                    value: i._id
                }))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const addUnit = () => {
        const item = modalData.find((e) => {
            return e._id === dataAdd._id
        })
        if (!item) {
            setModalData([...modalData, dataAdd])
        }
    }

    const setDataToAdd = (id) => {
        const item = units.find((e) => e._id === id)
        setDataAdd(item)
    }

    const renderBody = () => (
        <Card>
            <Form form={form} className='w-100'>
                <Row justify='center' className='mb-3'>
                    <Col span={24}>
                        Danh sách Unit không có trong khóa học nào
                    </Col>
                    <Col span={20}>
                        <Form.Item name='test'>
                            <DebounceSelect
                                placeholder='Search unit to add'
                                fetchOptions={fetchUnits}
                                allowClear
                                onChange={(v) => {
                                    setDataToAdd(v)
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button
                            type='primary'
                            className='w-100'
                            disabled={!dataAdd}
                            onClick={addUnit}
                        >
                            Thêm
                        </Button>
                    </Col>
                </Row>
            </Form>

            <Table
                bordered
                dataSource={modalData}
                columns={columns}
                loading={loading}
                pagination={false}
                rowKey={(record: any) => record?._id}
                scroll={{
                    y: 400
                }}
                sticky
            />
        </Card>
    )

    const onSave = async () => {
        setLoading(true)
        try {
            let index = 0
            for (const iterator of modalData) {
                iterator.display_order = index
                index++
            }
            const dataPost = modalData.map((e) => {
                return {
                    id: e.id,
                    _id: e._id,
                    course_id: data.id,
                    display_order: e.display_order
                }
            })
            await UnitAPI.updateUnitCourse({
                data: dataPost,
                courseId: data.id,
                course_id: data._id
            })

            toggleModal(false)
        } catch (error) {
            notify('error', error.message)
        }
        setLoading(false)
    }

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Update Units'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={onSave}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
            width='80%'
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AddQuestionModal)
