import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Checkbox,
    Switch,
    notification,
    Spin,
    Row,
    Col,
    DatePicker,
    Popover,
    InputNumber,
    Tooltip
} from 'antd'
import {
    QuestionCircleOutlined,
    ArrowRightOutlined,
    CopyOutlined
} from '@ant-design/icons'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import PromptTemplateMemoAPI from 'api/PromptTemplateAiAPI'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'
import TextArea from 'antd/lib/input/TextArea'
import moment from 'moment'
import { languageParam, qualityParam, toneParam } from 'const/ai-report'
import AIReportGenerateAPI from 'api/AIReportGenerateAPI'
import AIReportResultAPI from 'api/AIReportResultAPI'
import sanitizeHtml from 'sanitize-html'
import { DATE_FORMAT } from 'const'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}
interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    type: MODAL_TYPE
    data?: any
    userData?: any
    refetchData: () => void
}

const ReportGenerateModal: FC<IProps> = ({
    visible,
    toggleModal,
    type,
    data,
    userData,
    refetchData
}) => {
    const { RangePicker } = DatePicker
    const { Option } = Select
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            is_show_lesson: false,
            from_date: moment().subtract(30, 'day').startOf('day'),
            to_date: moment().endOf('day'),
            isLoading: false,
            number_lesson: 5,
            prompt: null,
            params: {
                language: languageParam.English,
                quality: qualityParam.Good,
                tone: toneParam.Professional,
                number_result: 1,
                max_result_length: 700
            },
            search: '',
            result_title: '',
            result_content: ''
        }
    )

    useEffect(() => {
        if (visible) {
            form.resetFields()
            setValues({ result_content: null })
            values.result_content = null
            if (data) {
                setValues({ prompt: data })
                const promtData = data?.prompt
                if (
                    promtData.indexOf('$[list_memo]') !== -1 ||
                    promtData.indexOf('$[number_class]') !== -1 ||
                    promtData.indexOf('$[start_time_list]') !== -1 ||
                    promtData.indexOf('$[course_list]') !== -1 ||
                    promtData.indexOf('$[unit_list]') !== -1
                ) {
                    setValues({ is_show_lesson: true })
                }
            }
            form.setFieldsValue({
                ...values,
                time: [
                    moment().subtract(30, 'day').startOf('day'),
                    moment().endOf('day')
                ],
                language: values.params.language,
                quality: values.params.quality,
                tone: values.params.tone,
                number_result: values.params.number_result,
                max_result_length: values.params.max_result_length
            })
        }
    }, [visible])

    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                from_date: value[0],
                to_date: value[1]
            })
        }
    }

    const handleGenerate = async () => {
        const dataPost: any = {
            params: values.params,
            prompt_id: data?.id,
            user_name: userData
        }
        if (values.is_show_lesson) {
            dataPost.from_date = moment(values.from_date)
                .startOf('day')
                .valueOf()
            dataPost.to_date = moment(values.to_date).endOf('day').valueOf()
            dataPost.number_lesson = values.number_lesson
        }
        setValues({ isLoadingGenerate: true })
        console.log(dataPost)
        AIReportGenerateAPI.reportGenerate(dataPost)
            .then((res) => {
                setValues({ result_content: res.data })
                values.result_content = res.data
                form.setFieldValue('result_content', res.data)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingGenerate: false }))
    }

    const onChangeParams = (value: any, key: any) => {
        switch (key) {
            case 'number_lesson':
                setValues({
                    number_lesson: value
                })
                break
            case 'language':
                setValues({
                    params: {
                        ...values.params,
                        language: value
                    }
                })
                break
            case 'quality':
                setValues({
                    params: {
                        ...values.params,
                        quality: value
                    }
                })
                break
            case 'tone':
                setValues({
                    params: {
                        ...values.params,
                        tone: value
                    }
                })
                break
            case 'number_result':
                setValues({
                    params: {
                        ...values.params,
                        number_result: value
                    }
                })
                break
            case 'max_result_length':
                setValues({
                    params: {
                        ...values.params,
                        max_result_length: value
                    }
                })
                break
            default:
        }
    }

    const renderSelect = (key: any) => {
        if (key === 'number_lesson') {
            return (
                <>
                    <Option key={5} value={5}>
                        5
                    </Option>
                    <Option key={10} value={10}>
                        10
                    </Option>
                    <Option key={15} value={15}>
                        15
                    </Option>
                    <Option key={20} value={20}>
                        20
                    </Option>
                </>
            )
        }
        if (key === 'language') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(languageParam).map((key: any) => (
                <Option value={languageParam[key]} key={key}>
                    {key}
                </Option>
            ))
        }
        if (key === 'quality') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(qualityParam).map((key: any) => (
                <Option value={qualityParam[key]} key={key}>
                    {key}
                </Option>
            ))
        }
        if (key === 'tone') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(toneParam).map((key: any) => (
                <Option value={toneParam[key]} key={key}>
                    {_.startCase(key)}
                </Option>
            ))
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        return (
            <>
                <Option key={1} value={1}>
                    1
                </Option>
                <Option key={2} value={2}>
                    2
                </Option>
                <Option key={3} value={3}>
                    3
                </Option>
                <Option key={4} value={4}>
                    4
                </Option>
                <Option key={5} value={5}>
                    5
                </Option>
            </>
        )
    }

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const onFinish = useCallback(
        async (value) => {
            setLoading(true)
            const dataPayload: any = {
                result_title: value.result_title,
                result_content: value.result_content,
                user_name: userData,
                prompt_id: Number(data?.id),
                params: values.params
            }
            if (values.is_show_lesson) {
                dataPayload.from_date = moment(values.from_date)
                    .startOf('day')
                    .valueOf()
                dataPayload.to_date = moment(values.to_date)
                    .endOf('day')
                    .valueOf()
                dataPayload.number_lesson = Number(values.number_lesson)
            }
            try {
                await AIReportResultAPI.createAIReportResult(dataPayload)
                notify('success', 'Create successfully')
                onClose()
                refetchData()
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [data, form]
    )

    const renderBody = () => (
        <>
            {userData && (
                <>
                    <h4 className='mb-3'>Apply for user: {userData}</h4>
                    <hr />
                </>
            )}
            <Form
                name='basic'
                labelCol={{ span: 12 }}
                labelAlign='left'
                wrapperCol={{ span: 12 }}
                form={form}
                autoComplete='off'
                onFinish={onFinish}
            >
                <Row>
                    <Col
                        span={8}
                        className='pr-4'
                        style={{ borderRight: '1px solid #d9d9d9' }}
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.type !== currentValues.type
                            }
                        >
                            <h4>{data?.title}</h4>
                            <div
                                className='mb-4'
                                style={{
                                    backgroundColor: '#e9f7fe',
                                    color: '#3184ae',
                                    padding: '5px',
                                    borderRadius: '3px'
                                }}
                            >
                                {data?.description}
                            </div>
                            {values.is_show_lesson && (
                                <>
                                    <Form.Item
                                        className='mt-4'
                                        label='Time'
                                        name='time'
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        <RangePicker
                                            allowClear={false}
                                            format={DATE_FORMAT}
                                            defaultValue={[
                                                values.from_date,
                                                values.to_date
                                            ]}
                                            style={{ width: '100%' }}
                                            disabledDate={(current) =>
                                                current > moment()
                                            }
                                            clearIcon={false}
                                            onChange={handleChangeDate}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label='Number of lesson'
                                        name='number_lesson'
                                    >
                                        <Select
                                            placeholder='Choose number of lesson'
                                            onChange={(val) => {
                                                onChangeParams(
                                                    val,
                                                    'number_lesson'
                                                )
                                            }}
                                        >
                                            {renderSelect('number_lesson')}
                                        </Select>
                                    </Form.Item>
                                </>
                            )}
                            <Form.Item label='Language' name='language'>
                                <Select
                                    placeholder='Choose language'
                                    onChange={(val) => {
                                        onChangeParams(val, 'language')
                                    }}
                                >
                                    {renderSelect('language')}
                                </Select>
                            </Form.Item>
                            <Form.Item label='Quality type' name='quality'>
                                <Select
                                    placeholder='Choose quality'
                                    onChange={(val) => {
                                        onChangeParams(val, 'quality')
                                    }}
                                >
                                    {renderSelect('quality')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Tone of Voice'
                                name='tone'
                                tooltip='Set the tone of the result.'
                            >
                                <Select
                                    placeholder='Choose tone'
                                    onChange={(val) => {
                                        onChangeParams(val, 'tone')
                                    }}
                                >
                                    {renderSelect('tone')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Number of Result'
                                name='number_result'
                            >
                                <Select
                                    placeholder='Choose quality'
                                    onChange={(val) => {
                                        onChangeParams(val, 'number_result')
                                    }}
                                >
                                    {renderSelect('number_result')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Max Results Length'
                                name='max_result_length'
                                tooltip='Maximum words for each result.'
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={200}
                                    max={1500}
                                    onChange={(val) => {
                                        onChangeParams(val, 'max_result_length')
                                    }}
                                />
                            </Form.Item>
                            <Button
                                type='primary'
                                style={{ width: '100%' }}
                                onClick={handleGenerate}
                                loading={values.isLoadingGenerate}
                            >
                                <span>Generate</span>{' '}
                                <ArrowRightOutlined
                                    style={{ fontSize: '16px' }}
                                />
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col span={16} className='pl-4'>
                        <Row className='mb-2' justify='end'>
                            <Tooltip title={'Copy content'}>
                                <CopyOutlined
                                    style={{ fontSize: 20 }}
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            document.getElementById(
                                                'text_content'
                                            ).textContent
                                        ) &&
                                        notify('success', 'Copy successfully')
                                    }
                                ></CopyOutlined>
                            </Tooltip>
                        </Row>
                        <div
                            hidden
                            id={'text_content'}
                            dangerouslySetInnerHTML={{
                                __html: sanitize(values.result_content)
                            }}
                        />
                        <Form.Item
                            label='Result Title'
                            name='result_title'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'title is required'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label='Result Content'
                            name='result_content'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'content is required'
                                }
                            ]}
                        >
                            <TextEditor
                                heightCustom={values.is_show_lesson ? 300 : 400}
                                onChange={(val) =>
                                    setValues({ result_content: val })
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title={type === MODAL_TYPE.ADD_NEW ? 'Generate New' : 'Edit'}
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
            width={1080}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(ReportGenerateModal)
