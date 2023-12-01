import Modal from 'antd/lib/modal/Modal'
import React, { memo, useCallback, useState, FC, useEffect } from 'react'
import moment from 'moment'
import {
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Button,
    Select,
    Spin,
    AutoComplete,
    Radio,
    RadioChangeEvent
} from 'antd'
import _ from 'lodash'
import { useForm } from 'antd/lib/form/Form'
import BookingAPI from 'api/BookingAPI'
import { IBooking, ITrialBooking, EnumCommentType } from 'types'
import cn from 'classnames'
import {
    STUDENT_LEVELS,
    MEMO_NOTE_FIELD,
    MEMO_OTHER_NOTE_FIELD,
    ENUM_MEMO_NOTE_FIELD
} from 'const'
import TextArea from 'antd/lib/input/TextArea'
import styles from './index.module.scss'
import { notify } from 'utils/notify'
import { EnumUnitType } from 'pages/Courses/PrivateCourses/Unit/unit-modal'

const { Option } = Select
type Props = {
    visible: boolean
    close: () => void
    data: IBooking
    refetchData: any
    callback?: any
    type: string
}

const MAX_ASSESSMENT_POINT = 10

const MemoModal: FC<Props> = ({
    visible,
    data,
    refetchData,
    close,
    callback,
    type
}) => {
    const [form] = useForm()
    const [loading, setLoading] = useState<boolean>(false)
    const [readOnlyModal, setReadOnlyModal] = useState<boolean>(false)
    const [isOldMemo, setOldMemo] = useState<boolean>(false)
    const [typeUnit, setTypeUnit] = useState<String>(null)
    useEffect(() => {
        if (visible && data) {
            if (type !== 'trial') {
                if (
                    data?.unit?.unit_type === EnumUnitType.IELTS_GRAMMAR ||
                    data?.unit?.unit_type === EnumUnitType.IELTS_4_SKILLS
                ) {
                    setTypeUnit('ielts')
                }
            }
            const resMemo = data.memo
            setOldMemo(false)
            if (resMemo.note?.length > 0) {
                const checkOldMemo = resMemo.note.find(
                    (i: any) => i.keyword === ENUM_MEMO_NOTE_FIELD.vocabulary
                )
                if (checkOldMemo) {
                    setOldMemo(true)
                }
                // setReadOnlyModal(true)
                _.forEach(resMemo.note, (o) => {
                    form.setFieldsValue({
                        [o.keyword]: {
                            ...o
                        }
                    })
                })
            }
            if (resMemo.other?.length > 0) {
                _.forEach(resMemo.other, (o) => {
                    form.setFieldsValue({
                        [o.keyword]: {
                            ...o
                        }
                    })
                })
            }
            if (type === 'trial') {
                form.setFieldsValue({
                    student_starting_level:
                        resMemo?.student_starting_level?.id || 0
                })
            }
        } else {
            form.resetFields()
        }
    }, [visible, data])

    useEffect(() => {}, [form])

    const onSubmit = useCallback(async () => {
        await form?.validateFields()
        const formValues = form.getFieldsValue()

        const memoPayload: any = {
            note: [] as any[],
            other: [] as any[],
            created_time: new Date()
        }

        if (type === 'trial') {
            memoPayload.student_starting_level = _.find(
                STUDENT_LEVELS,
                (o) => o.id === form.getFieldValue('student_starting_level')
            )
        }

        _.forEach(_.keys(formValues), (k: any) => {
            if (MEMO_NOTE_FIELD.includes(k)) {
                const temp = _.get(formValues, k)
                memoPayload.note.push({
                    ...temp,
                    keyword: k
                })
            } else if (MEMO_OTHER_NOTE_FIELD.includes(k)) {
                const temp = _.get(formValues, k)
                memoPayload.other.push({
                    ...temp,
                    keyword: k
                })
            }
        })

        if (data?.id && type === 'trial') {
            setLoading(true)
            BookingAPI.editTrialBooking(data.id, memoPayload)
                .then((res) => {
                    notify('success', 'Update memo successfully')
                    if (callback) {
                        callback()
                    }
                    close()
                    refetchData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(true)
            BookingAPI.teacherMemo(data.id, { memo: memoPayload })
                .then((res) => {
                    notify('success', 'Update memo successfully')
                    if (callback) {
                        callback()
                    }
                    close()
                    refetchData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        }
    }, [form, data])

    const plainOptions = ['Excellent', 'Very good', 'Good', 'Fair', 'Poor']
    return (
        <Modal
            visible={visible}
            onCancel={() => close()}
            maskClosable
            width={1024}
            title={
                data &&
                `${data?.student?.full_name} - ${moment(
                    data?.calendar?.start_time
                ).format('DD/MM/YYYY - HH:mm')}`
            }
            centered
            wrapClassName={cn(styles.trialMemoModal)}
            footer={
                !readOnlyModal && [
                    <Button
                        key='submit'
                        type='primary'
                        shape='round'
                        disabled={loading || readOnlyModal}
                        onClick={onSubmit}
                    >
                        submit
                    </Button>
                ]
            }
        >
            <Spin spinning={loading}>
                <Form
                    name='trialMemo'
                    form={form}
                    initialValues={{
                        vocabulary: MAX_ASSESSMENT_POINT,
                        grammar: MAX_ASSESSMENT_POINT,
                        reading: MAX_ASSESSMENT_POINT,
                        listening: MAX_ASSESSMENT_POINT
                    }}
                    className={cn(styles.disabledMemo)}
                >
                    <Row justify='center' gutter={[5, 5]}>
                        <Col span={24} className='mb-3'>
                            <p
                                className={cn(
                                    styles.titleBookingInfo,
                                    styles.assessment
                                )}
                            >
                                {'assessment'.toUpperCase()}
                            </p>
                            {((type === 'trial' && !isOldMemo) ||
                                isOldMemo) && (
                                <p
                                    className={cn(styles.assessmentDesc)}
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: 20
                                    }}
                                >
                                    (*1 very poor; 10 excellent)
                                </p>
                            )}
                        </Col>
                    </Row>

                    <Row>
                        <Col span={12}>
                            <p>
                                Course:{' '}
                                <span className={cn(styles.titleBookingInfo)}>
                                    {data?.course?.name}
                                </span>
                            </p>
                        </Col>
                        <Col span={12}>
                            <p>
                                Unit:{' '}
                                <span className={cn(styles.titleBookingInfo)}>
                                    {data?.unit?.name}
                                </span>
                            </p>
                        </Col>
                    </Row>
                    {((type === 'trial' && !isOldMemo) ||
                        isOldMemo ||
                        typeUnit === 'ielts') && (
                        <Row gutter={[10, 5]} justify='start' className='mt-4'>
                            {typeUnit !== 'ielts' && (
                                <Col span={12}>
                                    <Row justify='center' gutter={[5, 5]}>
                                        <Col span={10}>
                                            <p>
                                                Listening{' '}
                                                <span className='text-danger'>
                                                    *
                                                </span>
                                            </p>
                                        </Col>
                                        <Col span={14}>
                                            <Form.Item
                                                name={['listening', 'point']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'This field is required'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    className='w-100'
                                                    min={1}
                                                    max={MAX_ASSESSMENT_POINT}
                                                    readOnly={readOnlyModal}
                                                    placeholder='Number only 1~10'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                            <Col span={12}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={10}>
                                        <p>
                                            Speaking{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={14}>
                                        <Form.Item
                                            name={['speaking', 'point']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <InputNumber
                                                className='w-100'
                                                min={1}
                                                max={MAX_ASSESSMENT_POINT}
                                                readOnly={readOnlyModal}
                                                placeholder='Number only 1~10'
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            {isOldMemo && (
                                <Col span={12}>
                                    <Row justify='center' gutter={[5, 5]}>
                                        <Col span={10}>
                                            <p>
                                                Vocabulary{' '}
                                                <span className='text-danger'>
                                                    *
                                                </span>
                                            </p>
                                        </Col>
                                        <Col span={14}>
                                            <Form.Item
                                                name={['vocabulary', 'point']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'This field is required'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    className='w-100'
                                                    min={1}
                                                    max={MAX_ASSESSMENT_POINT}
                                                    readOnly={readOnlyModal}
                                                    placeholder='Number only 1~10'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                            {isOldMemo && (
                                <Col span={12}>
                                    <Row justify='center' gutter={[5, 5]}>
                                        <Col span={10}>
                                            <p>
                                                Grammar{' '}
                                                <span className='text-danger'>
                                                    *
                                                </span>
                                            </p>
                                        </Col>
                                        <Col span={14}>
                                            <Form.Item
                                                name={['grammar', 'point']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'This field is required'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    className='w-100'
                                                    min={1}
                                                    max={MAX_ASSESSMENT_POINT}
                                                    readOnly={readOnlyModal}
                                                    placeholder='Number only 1~10'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                        </Row>
                    )}
                    {!isOldMemo && (
                        <Row gutter={[10, 5]} justify='start' className='mt-4'>
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            Level of Attention{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name={['attention', 'comment']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <Radio.Group
                                                options={plainOptions}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            Level of Comprehension{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name={['comprehension', 'comment']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <Radio.Group
                                                options={plainOptions}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            In-class Performance{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name={['performance', 'comment']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <Radio.Group
                                                options={plainOptions}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )}
                    <Row gutter={[10, 5]} justify='start'>
                        {((type !== 'trial' && !isOldMemo) || isOldMemo) && (
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            Strength{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name={['strength', 'comment']}
                                            rules={[
                                                {
                                                    type: 'string',
                                                    whitespace: true,
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <TextArea
                                                style={{
                                                    height: 80,
                                                    width: '100%'
                                                }}
                                                readOnly={readOnlyModal}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        )}
                        {((type !== 'trial' && !isOldMemo) || isOldMemo) && (
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            Weakness{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name={['weakness', 'comment']}
                                            rules={[
                                                {
                                                    type: 'string',
                                                    whitespace: true,
                                                    required: true,
                                                    message:
                                                        'This field is required'
                                                }
                                            ]}
                                        >
                                            <TextArea
                                                style={{
                                                    height: 80,
                                                    width: '100%'
                                                }}
                                                readOnly={readOnlyModal}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        )}

                        {type === 'trial' && (
                            <Col span={24}>
                                <Row justify='center' gutter={[5, 5]}>
                                    <Col span={5}>
                                        <p>
                                            Starting level{' '}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </p>
                                    </Col>
                                    <Col span={19}>
                                        <Form.Item
                                            name='student_starting_level'
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Student level required'
                                                }
                                            ]}
                                        >
                                            <Select>
                                                {STUDENT_LEVELS.map(
                                                    (lv, index) => (
                                                        <Option
                                                            key={lv.id}
                                                            value={lv.id}
                                                            disabled={
                                                                readOnlyModal
                                                            }
                                                        >
                                                            {lv.id} - {lv.name}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        )}
                    </Row>

                    <Row>
                        <Col span={5}>
                            <p>Another comment</p>
                        </Col>
                        <Col span={24}>
                            <Form.Item name={['another_comment', 'comment']}>
                                <TextArea
                                    style={{ height: 120 }}
                                    placeholder='Another comment'
                                    readOnly={readOnlyModal}
                                    disabled={readOnlyModal}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    )
}

export default memo(MemoModal)
