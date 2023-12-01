import {
    FC,
    memo,
    useCallback,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'
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
    Col,
    Row
} from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import PromptTemplateMemoAPI from 'api/PromptTemplateAiAPI'
import PromptCategoryAiAPI from 'api/PromptCategoryAiAPI'

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    type: MODAL_TYPE
    data?: any
    refetchData: () => void
}

export const listParamPrompt: any = [
    {
        NAME: 'user_name',
        DES: 'tên học viên'
    },
    {
        NAME: 'age',
        DES: 'tuổi học viên'
    },
    {
        NAME: 'number_class',
        DES: 'số lớp có memo'
    },
    {
        NAME: 'list_memo',
        DES: 'memo của các lớp'
    },
    {
        NAME: 'start_time_list',
        DES: 'thời gian start các lớp học'
    },
    {
        NAME: 'homework_score_list',
        DES: 'DS điểm BTVN'
    },
    {
        NAME: 'course_list',
        DES: 'DS giáo trình học'
    },
    {
        NAME: 'unit_list',
        DES: 'DS các bài học'
    }
]

const PromptTemplateModal: FC<IProps> = ({
    visible,
    toggleModal,
    type,
    data,
    refetchData
}) => {
    const { Option } = Select
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)
    const [isShowDesParam, setShowDesParam] = useState(false)
    const dragItem = useRef()
    const [valueCategory, setValueCategory] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            categories: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: '',
            category_obj_id_selected: []
        }
    )

    const getCategory = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            setValueCategory({ isLoading: true })
            const { categories } = valueCategory
            PromptCategoryAiAPI.getAllPromptCategory({
                status: EnumTemplateAIStatus.ACTIVE,
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    let newCategory = [...res.data]
                    if (query.page_number > 1) {
                        newCategory = [...categories, ...res.data]
                    }
                    setValueCategory({
                        categories: newCategory,
                        total: res.pagination.total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueCategory({ isLoading: false }))
        },
        [valueCategory]
    )

    const dragStart = (e, position) => {
        dragItem.current = position
    }

    useEffect(() => {
        if (visible) {
            getCategory({
                page_number: valueCategory.page_number,
                page_size: valueCategory.page_size,
                search: valueCategory.search
            })
            form.resetFields()
            if (type === MODAL_TYPE.EDIT && !_.isEmpty(data)) {
                form.setFieldsValue({
                    ...data,
                    category: data?.category?._id
                })
            }
        }
    }, [visible])

    const renderCategories = () => {
        if (valueCategory?.categories) {
            return valueCategory?.categories.map((item: any, index) => (
                <Option key={`s${item._id}`} value={item._id}>
                    {`${item.title} `}
                </Option>
            ))
        }
        return <></>
    }

    const onSearchCategory = (value: any) => {
        setValueCategory({
            page_number: 1,
            search: value
        })
        getCategory({
            page_number: 1,
            page_size: valueCategory.page_size,
            search: value
        })
    }

    const loadMoreCategory = (event) => {
        const { target } = event
        if (
            !valueCategory.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { total, page_size, page_number } = valueCategory
            if (total > page_size * page_number) {
                const newPageNumber = valueCategory.page_number + 1
                setValueCategory({ page_number: newPageNumber })
                getCategory({
                    page_number: newPageNumber,
                    page_size: valueCategory.page_size,
                    search: valueCategory.search
                })
            }
        }
    }

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const onFinish = useCallback(
        async (values) => {
            setLoading(true)
            try {
                if (type === MODAL_TYPE.ADD_NEW) {
                    await PromptTemplateMemoAPI.createPromptTemplate(values)
                    notify('success', 'Create successfully')
                    onClose()
                    refetchData()
                } else if (type === MODAL_TYPE.EDIT) {
                    await PromptTemplateMemoAPI.editPromptTemplate(
                        data._id,
                        values
                    )
                    notify('success', 'Update successfully')
                    onClose()
                    refetchData()
                }
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [type, form]
    )

    const handleDragStart = (event) => {
        event.dataTransfer.setData('text', event.target.id)
        event.dataTransfer.effectAllowed = 'copy'
    }
    const enableDropping = (event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    }
    const handleDrop = (event) => {
        event.preventDefault()
        const dt = event.dataTransfer.getData('text')
        const content = `$[${document.getElementById(dt).textContent}]`
        const textarea = document.getElementById(
            'prompt_area'
        ) as HTMLInputElement
        textarea.value =
            textarea.value.substring(0, textarea.selectionStart) +
            content +
            textarea.value.substring(
                textarea.selectionEnd,
                textarea.value.length
            )
        form.setFieldValue('prompt', textarea.value)
    }

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                }
            >
                <Form.Item
                    label='Title'
                    name='title'
                    rules={[
                        {
                            required: true,
                            message: 'title is required'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label='Category' name='category'>
                    <Select
                        placeholder='Choose category'
                        showSearch
                        autoClearSearchValue
                        filterOption={false}
                        loading={valueCategory.isLoading}
                        onPopupScroll={loadMoreCategory}
                        onSearch={_.debounce(onSearchCategory, 300)}
                    >
                        {renderCategories()}
                        {valueCategory.isLoading && (
                            <Option key='loading_course' value=''>
                                <Spin size='small' />
                            </Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label='Description' name='description'>
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Row className='w-100 d-flex mb-3'>
                    <Col className='mr-2 mt-1'>
                        <div>Các biến sử dụng trong Prompt Template:</div>
                    </Col>
                    <Col className=''>
                        <Button
                            type='primary'
                            style={{ padding: '0 10px', borderRadius: 10 }}
                            onClick={() => setShowDesParam(true)}
                            hidden={isShowDesParam}
                        >
                            Show Description
                        </Button>
                        <Button
                            type='primary'
                            style={{ padding: '0 10px', borderRadius: 10 }}
                            onClick={() => setShowDesParam(false)}
                            hidden={!isShowDesParam}
                        >
                            Hide Description
                        </Button>
                    </Col>
                </Row>
                {isShowDesParam && (
                    <div
                        style={{
                            background: '#E5E5E5',
                            padding: 5,
                            marginBottom: 10,
                            borderRadius: 4
                        }}
                    >
                        <Row className='w-100 d-flex'>
                            {listParamPrompt.map((item: any, index: any) => (
                                <Col span={12} key={index}>
                                    <div>
                                        $[{item.NAME}]: {item.DES}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
                <Row className='w-100 d-flex'>
                    {listParamPrompt.map((item: any, index: any) => (
                        <Col className='mb-2 mr-2'>
                            <div
                                style={{
                                    border: '1px solid black',
                                    borderRadius: 20,
                                    textAlign: 'center',
                                    padding: '2px 10px'
                                }}
                                id={item.NAME}
                                draggable={true}
                                onDragStart={handleDragStart}
                                key={index}
                            >
                                {item.NAME}
                            </div>
                        </Col>
                    ))}
                </Row>
                <div style={{ fontSize: 13, color: '#F91313' }}>
                    * Đặt con trỏ chuột vào vị trí muốn điền và kéo các biến thả
                    vào vùng bên dưới{' '}
                </div>
                <Form.Item
                    className='mt-2'
                    label='Prompt Template'
                    name='prompt'
                    rules={[
                        {
                            required: true,
                            message: 'Prompt template is required'
                        }
                    ]}
                >
                    <Input.TextArea
                        id='prompt_area'
                        onDragOver={enableDropping}
                        onDrop={handleDrop}
                        rows={5}
                    />
                </Form.Item>
            </Form.Item>
            <Form.Item
                labelAlign='left'
                name='is_active'
                label='Active'
                valuePropName='checked'
            >
                <Switch />
            </Form.Item>
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
                    ? 'Create New Prompt Template'
                    : 'Edit Prompt Template'
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
            width={768}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(PromptTemplateModal)
