/* eslint-disable @typescript-eslint/no-use-before-define */
import { Row, Checkbox, Form, Col } from 'antd'
import React, { useState, useEffect, memo } from 'react'

import { EnumAction } from 'const/enum'

const Actions = ({ record, form, actions }: any) => {
    return (
        <Row gutter={[0, 0]}>
            <Col span={18}>
                <Row gutter={[5, 0]}>
                    {record.permissions.map((permission) => (
                        <Col>
                            <Form.Item
                                name={`${permission.key}`}
                                style={{ margin: 0 }}
                                valuePropName='checked'
                            >
                                <Checkbox
                                    value={permission.key}
                                    style={{ lineHeight: '32px' }}
                                >
                                    {permission.name}
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>
    )
}

export default memo(Actions)
