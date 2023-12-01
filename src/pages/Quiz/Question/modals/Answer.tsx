import { Form, Input, Button, Space, Alert, Checkbox } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { FC, memo, useEffect, useState } from 'react'
import { EnumQuestionType, IAnswers } from 'types'
import { MODAL_TYPE } from 'const/status'

type Props = {
    data: IAnswers[]
    type: EnumQuestionType
    modalType: MODAL_TYPE
    onChange: (val) => void
}

const Answer: FC<Props> = ({ data, type, onChange, modalType }) => {
    const [form] = Form.useForm()
    const [error, setError] = useState('')

    const onChangeValues = (changedValues, allValues) => {
        const { answers } = allValues
        if (answers && answers.length > 0) {
            const count = answers.filter((x) => x?.is_correct)
            if (count.length === 0) {
                setError('The question requires at least 1 correct answer')
            } else if (
                count.length > 1 &&
                type === EnumQuestionType.ONE_CHOICE
            ) {
                setError('The once question requires only 1 correct answer')
            } else {
                setError('')
            }
        }
        onChange(
            answers.map((item) => {
                const tmp = {
                    ...item
                }
                if (item && !item.is_correct) tmp.is_correct = false
                return tmp
            })
        )
    }
    useEffect(() => {
        if (data && data.length > 0 && modalType === MODAL_TYPE.EDIT) {
            form.setFieldsValue({ answers: data })
        }
    }, [data])
    return (
        <Form
            name='dynamic_form_nest_item'
            autoComplete='off'
            onValuesChange={onChangeValues}
            form={form}
        >
            <Form.List name='answers'>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space
                                key={key}
                                style={{ display: 'flex', marginBottom: 8 }}
                                align='baseline'
                            >
                                <Form.Item
                                    {...restField}
                                    name={[name, 'label']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing content label'
                                        }
                                    ]}
                                >
                                    <Input placeholder='Content label' />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'text']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing content answer'
                                        }
                                    ]}
                                >
                                    <Input placeholder='Content answer' />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'is_correct']}
                                    valuePropName='checked'
                                >
                                    <Checkbox>Correct</Checkbox>
                                </Form.Item>
                                <MinusCircleOutlined
                                    onClick={() => remove(name)}
                                />
                            </Space>
                        ))}
                        {error && (
                            <Alert
                                message={error}
                                type='error'
                                showIcon
                                className='mb-3'
                            />
                        )}
                        <Form.Item>
                            <Button
                                type='dashed'
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add answer
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </Form>
    )
}

export default memo(Answer)
