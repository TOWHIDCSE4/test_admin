import React, { useContext, useState, useEffect, useRef, FC } from 'react'
import { Table, Input, Form, Row, Col } from 'antd'
import { FormInstance } from 'antd/lib/form'
import cn from 'classnames'
import { EnumCommentType, EnumScheduledMemoType, IScheduledMemo } from 'types'
import _ from 'lodash'
import { calculateClassification } from 'utils/string'
import { TEACHER_SCHEDULED_MEMO_FIELD } from 'const'
import CommentSuggestionAPI from 'api/CommentSuggestionAPI'
import styles from './index.module.scss'

const EditableContext = React.createContext<FormInstance<any> | null>(null)
interface IMemo {
    key: string
    name: string
    point: number
}

interface EditableRowProps {
    index: number
}

const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm()
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    inputType,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false)
    const inputRef = useRef(null)
    const form = useContext(EditableContext)
    useEffect(() => {
        if (editing) {
            inputRef.current!.focus()
        }
    }, [editing])

    const toggleEdit = () => {
        setEditing(!editing)
        form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }

    useEffect(() => {
        if (record && !_.isEmpty(record)) {
            form.setFieldsValue({ [dataIndex]: record[dataIndex] })
        }
    }, [inputRef])

    const save = async () => {
        try {
            const values = await form.validateFields()
            toggleEdit()
            handleSave({ ...record, ...values })
        } catch (errInfo) {
            console.log('Save failed:', errInfo)
        }
    }
    let childNode = children
    if (editable) {
        childNode = TEACHER_SCHEDULED_MEMO_FIELD.includes(record.key) ? (
            editing ? (
                <Form.Item
                    style={{ margin: 0 }}
                    name={dataIndex}
                    rules={[
                        {
                            required: true,
                            message: `${title} is required.`
                        }
                    ]}
                >
                    {dataIndex === 'comment' ? (
                        <Input ref={inputRef} onBlur={save} />
                    ) : (
                        <Input ref={inputRef} onBlur={save} />
                    )}
                </Form.Item>
            ) : (
                <Input value={record[dataIndex]} onClick={toggleEdit} />
            )
        ) : (
            <span className={cn(styles.classification)}>{children}</span>
        )
    }

    return (
        <td {...restProps} className='p-2' style={{ verticalAlign: 'middle' }}>
            <span>{childNode}</span>
        </td>
    )
}

type ColumnTypes = Exclude<Parameters<typeof Table>[0]['columns'], undefined>

type Props = {
    data: IScheduledMemo
    onChangeAssessment: (val) => void
    memoType: EnumScheduledMemoType
}

const EditableTableMemo: FC<Props> = ({
    data,
    onChangeAssessment,
    memoType
}) => {
    const [dataSource, setDataSource] = useState([
        {
            key: 'attendance',
            name: 'Attendance',
            none: 'Attendance',
            point: 0,
            comment: ''
        },
        {
            key: 'attitude',
            name: 'Attitude',
            none: 'Attitude',
            point: 0,
            comment: ''
        },
        {
            key: 'homework',
            name: 'Homework',
            none: 'Homework',
            point: 0,
            comment: ''
        },
        {
            key: 'listening',
            name: 'Listening',
            none: 'Listening',
            point: 0,
            comment: ''
        },
        {
            key: 'speaking',
            name: 'Speaking',
            none: 'Speaking',
            point: 0,
            comment: ''
        },
        {
            key: 'reading',
            name: 'Reading',
            none: 'Reading',
            point: 0,
            comment: ''
        },
        {
            key: 'writing',
            name: 'Writing',
            none: 'Writing',
            point: 0,
            comment: ''
        },
        {
            key: 'exam_result',
            name: 'Avg score',
            none: 'Avg score',
            point: 0,
            comment: ''
        },
        {
            key: 'avg_monthly',
            name: 'Avg monthly',
            none: 'Avg monthly',
            point: 0,
            comment: ''
        }
    ])

    const fetchCommentSuggestion = (keyword: string, point: number) =>
        CommentSuggestionAPI.getRandomCommentSuggestion({
            keyword,
            point,
            type:
                memoType === EnumScheduledMemoType.COURSE
                    ? EnumCommentType.COURSE_MEMO
                    : EnumCommentType.MONTHLY_MEMO
        }).then((res) => res.data)

    useEffect(() => {
        if (!_.isEmpty(data)) {
            let newDataSource = [...dataSource]
            let avg_monthly = 0
            newDataSource = newDataSource.map((item) => {
                const val: any = _.get(data, item.key)
                const tmp = {
                    ...item,
                    point: val ? val.point : 0,
                    comment: val ? val.comment : ''
                }
                if (item.key === 'exam_result') {
                    tmp.point = _.get(data, item.key)
                    avg_monthly += tmp.point
                } else if (item.key !== 'avg_monthly') {
                    avg_monthly += tmp.point
                } else {
                    tmp.point = _.round(avg_monthly / 4, 2).toFixed(2)
                    tmp.comment = `Classification: ${calculateClassification(
                        tmp.point
                    )}
                    `
                }
                return tmp
            })
            setDataSource(newDataSource)
            onChangeAssessment(newDataSource)
        }
    }, [data])
    const handleSave = async (row: any) => {
        const newData = [...dataSource]
        const index = newData.findIndex((item) => row.key === item.key)
        const item = newData[index]
        newData.splice(index, 1, {
            ...item,
            ...row
        })
        if (row.point !== item.point) {
            const memoSuggest = await fetchCommentSuggestion(row.key, row.point)
            if (memoSuggest) {
                row.comment = memoSuggest?.en_comment
            } else {
                row.comment = ''
            }
        }
        setDataSource(newData)
        onChangeAssessment(newData)
    }
    const sharedOnCell = (none, index) => {
        if (index < 3 || index === 8) {
            return { colSpan: 0 }
        }
    }
    const columns: any = [
        {
            title: 'Criterions',
            dataIndex: 'none',
            editable: false,
            disabled: true,
            width: '20%',
            colSpan: 2,
            onCell: (none, index) => {
                if (index < 3 || index === 8) {
                    return { colSpan: 2 }
                }
                // // These two are merged into above cell
                if (index === 3) {
                    return { rowSpan: 5 }
                }
                if ([4, 5, 6, 7].includes(index)) {
                    return { rowSpan: 0 }
                }
            }
        },
        {
            title: 'Criterions',
            dataIndex: 'name',
            colSpan: 0,
            editable: false,
            disabled: true,
            width: '10%',
            onCell: sharedOnCell
        },
        {
            title: 'Score',
            dataIndex: 'point',
            editable: false,
            inputType: 'number',
            width: '20%'
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            editable: !data?.teacher_commented,
            inputType: 'text',
            width: '50%'
        }
    ]
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell
        }
    }
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col
        }
        return {
            ...col,
            onCell: (record: IMemo) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: true,
                handleSave
            })
        }
    })

    return (
        <div>
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                columns={mergedColumns}
                pagination={false}
            />
        </div>
    )
}

export default EditableTableMemo
