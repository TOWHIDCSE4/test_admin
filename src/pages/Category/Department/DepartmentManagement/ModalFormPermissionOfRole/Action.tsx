/* eslint-disable @typescript-eslint/no-use-before-define */
import { Row, Checkbox, Form, Col } from 'antd'
import React, { useState, useEffect, memo } from 'react'

import { EnumAction } from 'const/enum'

const Actions = ({ _text, record, form, actions }: any) => {
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)

    useEffect(() => {
        onChangeCheckBox(actions)
    }, [actions])

    const onChangeCheckAll = (e) => {
        if (e.target.checked) {
            form?.setFieldsValue({
                [record?.id]: [
                    EnumAction.Create,
                    EnumAction.Edit,
                    EnumAction.View,
                    EnumAction.Delete
                ]
            })
        } else {
            form?.setFieldsValue({
                [record?.id]: []
            })
        }
        setIndeterminate(false)
        setCheckAll(e.target.checked)
    }

    const onChangeCheckBox = (e) => {
        if (e.length === 4) {
            setCheckAll(true)
            setIndeterminate(false)
            return
        }
        if (e.length === 0) {
            setCheckAll(false)
            setIndeterminate(false)
            return
        }
        setCheckAll(false)
        setIndeterminate(true)
    }
    return (
        <Row gutter={[0, 0]}>
            <Col span={6}>
                <Checkbox
                    name='checkAll'
                    indeterminate={indeterminate}
                    onChange={onChangeCheckAll}
                    checked={checkAll}
                    style={{ lineHeight: '32px' }}
                >
                    Tất cả
                </Checkbox>
            </Col>
            <Col span={18}>
                <Form.Item name={`${record?.id}`} style={{ margin: 0 }}>
                    <Checkbox.Group>
                        <Row gutter={[5, 0]}>
                            <Col span={6}>
                                <Checkbox
                                    value='view'
                                    style={{ lineHeight: '32px' }}
                                    onChange={onChangeCheckBox}
                                >
                                    Xem
                                </Checkbox>
                            </Col>
                            <Col span={6}>
                                <Checkbox
                                    value='create'
                                    style={{ lineHeight: '32px' }}
                                >
                                    Thêm
                                </Checkbox>
                            </Col>
                            <Col span={6}>
                                <Checkbox
                                    value='edit'
                                    style={{ lineHeight: '32px' }}
                                >
                                    Sửa
                                </Checkbox>
                            </Col>
                            <Col span={6}>
                                <Checkbox
                                    value='delete'
                                    style={{ lineHeight: '32px' }}
                                >
                                    Xóa
                                </Checkbox>
                            </Col>
                        </Row>
                    </Checkbox.Group>
                </Form.Item>
            </Col>
        </Row>
    )
}

export default memo(Actions)
