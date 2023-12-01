import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Input, Select, Upload, Space, Tag } from 'antd'
import {
    UploadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import UnitAPI from 'api/UnitAPI'
import UploadAPI from 'api/UploadAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { ICourse, IUnit, IExam } from 'types'
import DebounceSelect from 'core/Atoms/DebounceSelect'
import ExamAPI from 'api/ExamAPI'
import QuizAPI from 'api/QuizAPI'
import { IModalProps, encodeFilenameFromLink } from 'const/common'
import TrialTestAPI from 'api/TrialTestAPI'
import { red } from '@ant-design/colors'
import { randomInt } from 'crypto'

const { Option } = Select

enum EnumExamType {
    MIDTERM_EXAM = 1,
    FINAL_EXAM = 2,
    TEST = 3
}

export enum EnumUnitType {
    EN_COMMON = 'EN_COMMON',
    IELTS_GRAMMAR = 'IELTS_GRAMMAR',
    IELTS_4_SKILLS = 'IELTS_4_SKILLS'
}

export enum optionUnitType {
    EN_COMMON = 'Regular',
    IELTS_GRAMMAR = 'IELTS GRAMMAR',
    IELTS_4_SKILLS = 'IELTS 4 SKILLS'
}

interface IProps extends IModalProps {
    data?: IUnit
    visible: boolean
    isLoadingCourse: boolean
    type: MODAL_TYPE
    courses: ICourse[]
    toggleModal: (val: boolean) => void
    refetchData: () => void
    loadMoreCourse: (e: any) => void
    onSearchCourse: (val: string) => void
}

const UnitModal: FC<IProps> = ({
    visible,
    isLoadingCourse,
    data,
    type,
    courses,
    toggleModal,
    refetchData,
    loadMoreCourse,
    onSearchCourse
}) => {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)
    const [isDeleteStudentDocument, setDeleteStudentDocument] = useState(false)
    const [isDeleteTeacherDocument, setDeleteTeacherDocument] = useState(false)
    const [isDeleteAudio, setDeleteAudio] = useState(false)
    const [isDeleteWorkBook, setDeleteWorkBook] = useState(false)
    const [typeUnit, setTypeUnit] = useState(null)

    const fetchQuiz = async (search) => {
        try {
            const res = await QuizAPI.getQuizzesLite({
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.name}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    const fetchTestTopic = async (search) => {
        try {
            const res = await TrialTestAPI.getAllTopic({
                publish_status: 'published',
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.id}-${i.topic}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (visible && type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
            if (data.unit_type) {
                setTypeUnit(data.unit_type)
            }
            form.setFieldsValue({
                ...data,
                course_id: {
                    label: data?.course?.name || data?.course_id,
                    value: data?.course_id
                },
                exam: {
                    label: data?.exam?.name || data?.exam_id,
                    value: data?.exam_id
                },
                homework: {
                    label: data?.homework?.name || data?.homework_id,
                    value: data?.homework_id
                },
                homework2_id: {
                    label:
                        data?.homework2?.id &&
                        data?.homework2?.topic &&
                        `${data?.homework2?.id}-${data?.homework2?.topic}`,
                    value: data?.homework2_id
                },
                test_topic_id: {
                    label:
                        data?.test_topic?.id &&
                        data?.test_topic?.topic &&
                        `${data?.test_topic?.id}-${data?.test_topic?.topic}`,
                    value: data?.test_topic_id
                },
                ielts_reading_topic_id: {
                    label:
                        data?.ielts_reading_topic?.id &&
                        data?.ielts_reading_topic?.topic &&
                        `${data?.ielts_reading_topic?.id}-${data?.ielts_reading_topic?.topic}`,
                    value: data?.ielts_reading_topic_id
                },
                ielts_writing_topic_id: {
                    label:
                        data?.ielts_writing_topic?.id &&
                        data?.ielts_writing_topic?.topic &&
                        `${data?.ielts_writing_topic?.id}-${data?.ielts_writing_topic?.topic}`,
                    value: data?.ielts_writing_topic_id
                },
                ielts_listening_topic_id: {
                    label:
                        data?.ielts_listening_topic?.id &&
                        data?.ielts_listening_topic?.topic &&
                        `${data?.ielts_listening_topic?.id}-${data?.ielts_listening_topic?.topic}`,
                    value: data?.ielts_listening_topic_id
                },
                unit_type: data?.unit_type ?? EnumUnitType.EN_COMMON
            })
        }
        if (visible && type === MODAL_TYPE.ADD_NEW) {
            form.setFieldsValue({ is_support: false, is_active: true })
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
        form.resetFields()
    }, [])

    const uploadFile = async (_file: any) => {
        const res = await UploadAPI.handleUploadFile(_file)
        return res
    }

    const uploadHomework = async (_file: any) => {
        const res = await UploadAPI.handleUploadHomeworkFile(_file)
        return res
    }

    // const fetchExams = useCallback(
    //     async (q) => {
    //         const res = await ExamAPI.getExamList({
    //             page_number: 1,
    //             page_size: 100,
    //             q,
    //             course_id: data?.course._id
    //         })
    //         return res.data.map((i) => ({
    //             label: i.name,
    //             value: i._id
    //         }))
    //     },
    //     [data]
    // )

    const onFinish = useCallback(
        async (values) => {
            try {
                setLoading(true)
                const payload = {
                    ...values
                }
                if (typeof payload.course_id === 'object') {
                    payload.course_id = payload.course_id.value
                }

                if (typeof payload.exam === 'object') {
                    payload.exam = payload.exam.value
                }

                if (typeof payload.homework === 'object') {
                    payload.homework = payload.homework.value
                }
                if (typeof payload.homework2_id === 'object') {
                    payload.homework2_id = payload.homework2_id.value
                }

                if (payload.homework2_id) {
                    payload.homework2 = await TrialTestAPI.getTopicById(
                        payload.homework2_id
                    )
                }

                if (typeof payload.test_topic_id === 'object') {
                    payload.test_topic_id = payload.test_topic_id.value
                }

                if (payload.test_topic_id) {
                    payload.test_topic = await TrialTestAPI.getTopicById(
                        payload.test_topic_id
                    )
                }

                if (typeof payload.ielts_reading_topic_id === 'object') {
                    payload.ielts_reading_topic_id =
                        payload.ielts_reading_topic_id.value
                }

                if (payload.ielts_reading_topic_id) {
                    payload.ielts_reading_topic =
                        await TrialTestAPI.getTopicById(
                            payload.ielts_reading_topic_id
                        )
                }

                if (typeof payload.ielts_writing_topic_id === 'object') {
                    payload.ielts_writing_topic_id =
                        payload.ielts_writing_topic_id.value
                }

                if (payload.ielts_writing_topic_id) {
                    payload.ielts_writing_topic =
                        await TrialTestAPI.getTopicById(
                            payload.ielts_writing_topic_id
                        )
                }

                if (typeof payload.ielts_listening_topic_id === 'object') {
                    payload.ielts_listening_topic_id =
                        payload.ielts_listening_topic_id.value
                }

                if (payload.ielts_listening_topic_id) {
                    payload.ielts_listening_topic =
                        await TrialTestAPI.getTopicById(
                            payload.ielts_listening_topic_id
                        )
                }

                if (payload.student_document && payload.student_document.file) {
                    const studentDocs = await uploadFile(
                        payload.student_document.file
                    )
                    payload.student_document = studentDocs
                }
                if (payload.teacher_document && payload.teacher_document.file) {
                    const teacherDocs = await uploadFile(
                        payload.teacher_document.file
                    )
                    payload.teacher_document = teacherDocs
                }
                if (
                    payload.audio &&
                    payload.audio.fileList &&
                    payload.audio.fileList.length > 0
                ) {
                    let arrAudio = []
                    if (data && data?.audio) {
                        arrAudio = data.audio
                    }
                    await Promise.all(
                        payload.audio.fileList.map(async (item, index) => {
                            const newAudio = await uploadFile(
                                item.originFileObj
                            )
                            if (newAudio) {
                                arrAudio.push(newAudio)
                            }
                        })
                    )
                    payload.audio = arrAudio
                }
                if (payload.workbook && payload.workbook.file) {
                    const newWorkbook = await uploadFile(payload.workbook.file)
                    payload.workbook = newWorkbook
                }
                if (payload.homework && payload.homework.file) {
                    const newHomework = await uploadHomework(
                        payload.homework.file
                    )
                    payload.homework = newHomework
                }
                if (payload.exam) {
                    payload.exam_id = payload.exam
                    payload.exam = await QuizAPI.getQuizByIdNEW(payload.exam)
                }

                if (payload.homework) {
                    payload.homework_id = payload.homework
                    const homeworkData = await QuizAPI.getQuizByIdNEW(
                        payload.homework
                    )
                    if (homeworkData) {
                        homeworkData.questions = []
                    }
                    payload.homework = homeworkData
                }
                if (type === MODAL_TYPE.ADD_NEW) {
                    UnitAPI.createUnit(payload)
                        .then((res) => {
                            notify('success', 'Create successfully')
                            onClose()
                            refetchData()
                        })
                        .catch((err) => {
                            notify('error', err.message)
                        })
                        .finally(() => setLoading(false))
                } else if (type === MODAL_TYPE.EDIT) {
                    UnitAPI.editUnit(data.id, payload)
                        .then((res) => {
                            notify('success', 'Update successfully')
                            onClose()
                            refetchData()
                            setDeleteStudentDocument(false)
                            setDeleteTeacherDocument(false)
                            setDeleteAudio(false)
                            setDeleteWorkBook(false)
                        })
                        .catch((err) => {
                            notify('error', err.message)
                        })
                        .finally(() => setLoading(false))
                }
            } catch (err) {
                notify('error', err.message)
            } finally {
                setLoading(false)
            }
        },
        [type, form]
    )

    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }

    const renderCourses = () =>
        courses.map((item, index) => (
            <Option value={item.id} key={item.id}>
                {item.name}
            </Option>
        ))

    const renderUnitType = () =>
        Object.keys(optionUnitType).map((key: any) => (
            <Option value={key} key={key}>
                {optionUnitType[key]}
            </Option>
        ))

    const deleteFile = async (filePath, field, indexFile) => {
        setLoading(true)
        await UploadAPI.handleDeleteFile(filePath)
            .then((resDel) => {
                let payload = {
                    course_id: data.course_id,
                    name: data.name,
                    exam: data.exam,
                    exam_type: data.exam_type,
                    exam_id: data.exam_id,
                    homework_id: data.homework_id,
                    homework: data.homework,
                    homework2_id: data.homework2_id,
                    homework2: data.homework2,
                    test_topic_id: data.test_topic_id,
                    ielts_reading_topic_id: data.ielts_reading_topic_id,
                    ielts_writing_topic_id: data.ielts_writing_topic_id,
                    ielts_listening_topic_id: data.ielts_listening_topic_id,
                    student_document: data.student_document,
                    teacher_document: data.teacher_document,
                    audio: data.audio,
                    workbook: data.workbook
                }

                if (field === 'student_document') {
                    payload = {
                        ...payload,
                        student_document: ''
                    }
                } else if (field === 'teacher_document') {
                    payload = {
                        ...payload,
                        teacher_document: ''
                    }
                } else if (field === 'audio') {
                    if (indexFile) {
                        data.audio.splice(indexFile, 1)
                    } else {
                        data.audio = null
                    }
                    payload = {
                        ...payload,
                        audio: data.audio
                    }
                } else if (field === 'workbook') {
                    payload = {
                        ...payload,
                        workbook: ''
                    }
                }

                UnitAPI.editUnit(data.id, payload)
                    .then((resEdit) => {
                        notify('success', 'Update successfully')
                        // onClose()
                        refetchData()

                        if (field === 'student_document') {
                            setDeleteStudentDocument(true)
                            form.setFieldsValue({
                                ...form.getFieldsValue(),
                                student_document: null
                            })
                        } else if (field === 'teacher_document') {
                            setDeleteTeacherDocument(true)
                            form.setFieldsValue({
                                ...form.getFieldsValue(),
                                teacher_document: null
                            })
                        } else if (field === 'audio') {
                            if (
                                !data.audio ||
                                (data.audio && data.audio.length === 0)
                            ) {
                                setDeleteAudio(true)
                                form.setFieldsValue({
                                    ...form.getFieldsValue(),
                                    audio: null
                                })
                            }
                        } else if (field === 'workbook') {
                            setDeleteWorkBook(true)
                            form.setFieldsValue({
                                ...form.getFieldsValue(),
                                workbook: null
                            })
                        }
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const confirmDeleteFile = (filePath, field, indexFile?) => {
        if (filePath && field) {
            Modal.confirm({
                icon: <ExclamationCircleOutlined />,
                content: `Are you sure to remove item?`,
                onOk() {
                    deleteFile(filePath, field, indexFile)
                }
            })
        }
    }

    const renderAudio = () => {
        if (!isDeleteAudio && data?.audio) {
            if (!Array.isArray(data?.audio)) {
                return (
                    <div
                        className='clickable mb-2 mr-5 d-flex justify-content-center align-items-center'
                        title={
                            encodeFilenameFromLink(data?.audio) || 'Play audio'
                        }
                    >
                        <Tag
                            color='processing'
                            onClick={() =>
                                window.open(
                                    `${encodeFilenameFromLink(data?.audio)}`,
                                    '_blank'
                                )
                            }
                        >
                            Current audio
                        </Tag>
                        <DeleteOutlined
                            style={{
                                color: red.primary,
                                marginLeft: '25px'
                            }}
                            title='Remove file'
                            type='button'
                            onClick={() =>
                                confirmDeleteFile(data?.audio, 'audio')
                            }
                        />
                    </div>
                )
            }
            if (Array.isArray(data?.audio) && data?.audio.length === 1) {
                return (
                    <div
                        className='clickable mb-2 mr-5 d-flex justify-content-center align-items-center'
                        title={
                            encodeFilenameFromLink(data?.audio[0]) ||
                            'Play audio'
                        }
                    >
                        <Tag
                            color='processing'
                            onClick={() =>
                                window.open(
                                    `${encodeFilenameFromLink(data?.audio[0])}`,
                                    '_blank'
                                )
                            }
                        >
                            Current audio
                        </Tag>
                        <DeleteOutlined
                            style={{
                                color: red.primary,
                                marginLeft: '25px'
                            }}
                            title='Remove file'
                            type='button'
                            onClick={() =>
                                confirmDeleteFile(data?.audio[0], 'audio', 0)
                            }
                        />
                    </div>
                )
            }
            console.log(Array.isArray(data?.audio))
            if (Array.isArray(data?.audio) && data?.audio.length > 1) {
                return data?.audio.map((item, index) => (
                    <div
                        className='clickable mb-2 mr-5 d-flex justify-content-center align-items-center'
                        title={encodeFilenameFromLink(item) || 'Play audio'}
                    >
                        <Tag
                            color='processing'
                            onClick={() =>
                                window.open(
                                    `${encodeFilenameFromLink(item)}`,
                                    '_blank'
                                )
                            }
                        >
                            Current audio
                        </Tag>
                        <DeleteOutlined
                            style={{
                                color: red.primary,
                                marginLeft: '25px'
                            }}
                            title='Remove file'
                            type='button'
                            onClick={() =>
                                confirmDeleteFile(item, 'audio', index)
                            }
                        />
                    </div>
                ))
            }
        }
        return null
    }

    const renderBody = () => (
        <Form
            name='basic'
            layout='horizontal'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Form.Item
                label='Name'
                name='name'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Name package is required'
                    }
                ]}
            >
                <Input placeholder='Enter name package' />
            </Form.Item>
            <Form.Item
                label='Course'
                name='course_id'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Course is required'
                    }
                ]}
            >
                <Select
                    allowClear
                    showSearch
                    showArrow
                    placeholder='Choose course'
                    filterOption={false}
                    loading={isLoadingCourse}
                    onPopupScroll={loadMoreCourse}
                    onSearch={_.debounce(onSearchCourse, 300)}
                >
                    {renderCourses()}
                </Select>
            </Form.Item>
            <Form.Item
                label='Unit Type'
                name='unit_type'
                labelAlign='left'
                rules={[
                    {
                        required: true,
                        message: 'Unit Type is required'
                    }
                ]}
            >
                <Select
                    showArrow
                    placeholder='Choose unit type'
                    onChange={(val) => setTypeUnit(val)}
                >
                    {renderUnitType()}
                </Select>
            </Form.Item>
            {/* <Form.Item label='Exam' name='exam' labelAlign='left'>
                <DebounceSelect
                    placeholder='Choose an exam from quizzes'
                    fetchOptions={fetchQuiz}
                    allowClear
                />
            </Form.Item> */}
            <Form.Item label='Exam Type' name='exam_type' labelAlign='left'>
                <Select allowClear>
                    <Option value={EnumExamType.TEST}>TEST</Option>
                    <Option value={EnumExamType.MIDTERM_EXAM}>
                        MIDTERM_EXAM
                    </Option>
                    <Option value={EnumExamType.FINAL_EXAM}>FINAL_EXAM</Option>
                </Select>
            </Form.Item>
            <Form.Item label='Self-Study V1' name='homework' labelAlign='left'>
                <DebounceSelect
                    placeholder='Choose an Self-Study V1'
                    fetchOptions={fetchQuiz}
                    allowClear
                />
            </Form.Item>
            <Form.Item
                label='Self-Study V2'
                name='homework2_id'
                labelAlign='left'
            >
                <DebounceSelect
                    placeholder='Choose an Self-Study V2'
                    fetchOptions={fetchTestTopic}
                    allowClear
                />
            </Form.Item>
            {typeUnit !== EnumUnitType.IELTS_4_SKILLS && (
                <Form.Item
                    label='Test Topic'
                    name='test_topic_id'
                    labelAlign='left'
                >
                    <DebounceSelect
                        placeholder=''
                        fetchOptions={fetchTestTopic}
                        allowClear
                    />
                </Form.Item>
            )}
            {/* IELTS 4 skill */}
            {typeUnit === EnumUnitType.IELTS_4_SKILLS && (
                <>
                    <Form.Item
                        label='IELTS Reading Topic'
                        name='ielts_reading_topic_id'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'IELTS Reading Topic is required'
                            }
                        ]}
                    >
                        <DebounceSelect
                            placeholder=''
                            fetchOptions={fetchTestTopic}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item
                        label='IELTS Writing Topic'
                        name='ielts_writing_topic_id'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'IELTS Writing Topic is required'
                            }
                        ]}
                    >
                        <DebounceSelect
                            placeholder=''
                            fetchOptions={fetchTestTopic}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item
                        label='IELTS Listening Topic'
                        name='ielts_listening_topic_id'
                        labelAlign='left'
                        rules={[
                            {
                                required: true,
                                message: 'IELTS Listening Topic is required'
                            }
                        ]}
                    >
                        <DebounceSelect
                            placeholder=''
                            fetchOptions={fetchTestTopic}
                            allowClear
                        />
                    </Form.Item>
                </>
            )}

            <div className='d-flex align-items-center'>
                <Form.Item
                    label='Student document'
                    name='student_document'
                    labelAlign='left'
                    help={
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'italic',
                                color: 'red'
                            }}
                        >
                            File size limit 10MB. Allowed file types PDF
                        </span>
                    }
                    className='w-100 mb-2'
                >
                    <Upload
                        listType='picture'
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <Space direction='horizontal' size={16}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                            {!isDeleteStudentDocument &&
                                data?.student_document && (
                                    <div
                                        className='clickable'
                                        onClick={() =>
                                            window.open(
                                                hasHttpUrl(
                                                    data?.student_document
                                                )
                                                    ? encodeFilenameFromLink(
                                                          data.student_document
                                                      )
                                                    : `https://ispeak.vn/${encodeFilenameFromLink(
                                                          data?.student_document
                                                      )}`,
                                                '_blank'
                                            )
                                        }
                                        title={
                                            encodeFilenameFromLink(
                                                data?.student_document
                                            ) || 'View document'
                                        }
                                    >
                                        <Tag color='processing'>
                                            Current student document
                                        </Tag>
                                    </div>
                                )}
                        </Space>
                    </Upload>
                </Form.Item>
                {!isDeleteStudentDocument && data?.student_document && (
                    <DeleteOutlined
                        style={{ color: red.primary }}
                        title='Remove file'
                        type='button'
                        onClick={() =>
                            confirmDeleteFile(
                                data?.student_document,
                                'student_document'
                            )
                        }
                    />
                )}
            </div>
            <div className='d-flex align-items-center'>
                <Form.Item
                    label='Teacher document'
                    name='teacher_document'
                    labelAlign='left'
                    help={
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'italic',
                                color: 'red'
                            }}
                        >
                            File size limit 10MB. Allowed file types PDF
                        </span>
                    }
                    className='w-100 mb-2'
                >
                    <Upload
                        listType='picture'
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <Space direction='horizontal' size={16}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                            {!isDeleteTeacherDocument &&
                                data?.teacher_document && (
                                    <div
                                        className='clickable'
                                        onClick={() =>
                                            window.open(
                                                hasHttpUrl(
                                                    data?.teacher_document
                                                )
                                                    ? encodeFilenameFromLink(
                                                          data.teacher_document
                                                      )
                                                    : `https://ispeak.vn/${encodeFilenameFromLink(
                                                          data?.teacher_document
                                                      )}`,
                                                '_blank'
                                            )
                                        }
                                        title={
                                            encodeFilenameFromLink(
                                                data?.teacher_document
                                            ) || 'View document'
                                        }
                                    >
                                        <Tag color='processing'>
                                            Current teacher document
                                        </Tag>
                                    </div>
                                )}
                        </Space>
                    </Upload>
                </Form.Item>
                {!isDeleteTeacherDocument && data?.teacher_document && (
                    <DeleteOutlined
                        style={{ color: red.primary }}
                        title='Remove file'
                        type='button'
                        onClick={() =>
                            confirmDeleteFile(
                                data?.teacher_document,
                                'teacher_document'
                            )
                        }
                    />
                )}
            </div>
            <div className='align-items-center'>
                <Form.Item
                    label='Audio'
                    name='audio'
                    labelAlign='left'
                    help={
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'italic',
                                color: 'red'
                            }}
                        >
                            File size limit 10MB. Allowed file types audio/* (up
                            max 15 file)
                        </span>
                    }
                    className='w-100 mb-2'
                >
                    {!(data?.audio && data?.audio.length === 15) && (
                        <Upload
                            listType='picture'
                            multiple={true}
                            accept='audio/*'
                            disabled={
                                !!(data?.audio && data?.audio.length === 15)
                            }
                            maxCount={
                                data?.audio ? 15 - data?.audio.length : 15
                            }
                            beforeUpload={() => false}
                        >
                            <Space direction='horizontal' size={16}>
                                <Button icon={<UploadOutlined />}>
                                    Upload
                                </Button>
                            </Space>
                        </Upload>
                    )}
                </Form.Item>
                {renderAudio()}
            </div>
            <div className='d-flex align-items-center'>
                <Form.Item
                    label='Workbook'
                    name='workbook'
                    labelAlign='left'
                    help={
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'italic',
                                color: 'red'
                            }}
                        >
                            File size limit 10MB. Allowed file types PDF
                        </span>
                    }
                    className='w-100 mb-2'
                >
                    <Upload
                        listType='picture'
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <Space direction='horizontal' size={16}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                            {!isDeleteWorkBook && data?.workbook && (
                                <div
                                    className='clickable'
                                    onClick={() =>
                                        window.open(
                                            `${encodeFilenameFromLink(
                                                data?.workbook
                                            )}`,
                                            '_blank'
                                        )
                                    }
                                    title={
                                        encodeFilenameFromLink(
                                            data?.workbook
                                        ) || 'View workbook'
                                    }
                                >
                                    <Tag color='processing'>
                                        Current workbook
                                    </Tag>
                                </div>
                            )}
                        </Space>
                    </Upload>
                </Form.Item>
                {!isDeleteWorkBook && data?.workbook && (
                    <DeleteOutlined
                        style={{ color: red.primary }}
                        title='Remove file'
                        type='button'
                        onClick={() =>
                            confirmDeleteFile(data?.workbook, 'workbook')
                        }
                    />
                )}
            </div>
            {/* <Form.Item
                label='Homework'
                name='homework'
                labelAlign='left'
                help={
                    <span
                        style={{
                            fontSize: '12px',
                            fontStyle: 'italic',
                            color: 'red'
                        }}
                    >
                        File size limit 10MB. Allowed file types XLSX
                    </span>
                }
            >
                <Upload
                    listType='picture'
                    maxCount={1}
                    beforeUpload={() => false}
                >
                    <Space direction='horizontal' size={16}>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                        {data?.homework && (
                            <Tag color='processing'>{data?.homework?.name}</Tag>
                        )}
                    </Space>
                </Upload>
            </Form.Item> */}
        </Form>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new unit'
                    : 'Edit unit information'
            }
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={form.submit}
                    loading={isLoading}
                >
                    Save
                </Button>
            ]}
            width={600}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(UnitModal)
