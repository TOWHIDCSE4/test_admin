import React from 'react'
import { Collapse, Row, Col, Form } from 'antd'

const { Panel } = Collapse

export interface IFilterFormEngine {
    label: string
    engine: JSX.Element
    name: string
    isDisplayed?: boolean
}
export interface IConditionExtensionOut {
    isDisplayed: boolean
    engine: JSX.Element
}

interface IFilterFormDataWrapperProps {
    otherPanels?: JSX.Element
    engines?: IFilterFormEngine[]
    extensionIn?: JSX.Element
    extensionOut?: JSX.Element[]
    extensionOutWithCondition?: IConditionExtensionOut[]
    configs?: any
}

export default function FilterFormDataWrapper({
    otherPanels,
    engines,
    extensionIn,
    configs,
    extensionOut = [],
    extensionOutWithCondition = []
}: IFilterFormDataWrapperProps) {
    const showEngines = () => {
        return engines.map((item, index) => {
            if (item?.isDisplayed === false) {
                return <React.Fragment key={index}></React.Fragment>
            }

            return (
                <Col key={index} xs={12} sm={12} md={12} lg={12} xl={8} xxl={6}>
                    <Row className='w-100 d-flex align-items-center'>
                        <Col span={9} xl={8} xxl={9}>
                            <p
                                style={{
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {item.label}
                            </p>{' '}
                        </Col>
                        <Col span={23} xl={16} xxl={22}>
                            <Form.Item
                                style={{
                                    width: '100%'
                                }}
                                name={item.name}
                            >
                                {React.cloneElement(item.engine, {
                                    style: {
                                        width: '100%'
                                    }
                                })}
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
            )
        })
    }
    return (
        <>
            {(extensionOut?.length > 0 ||
                extensionOutWithCondition?.length > 0) && (
                <Row className='mb-2' justify='end' gutter={[16, 16]}>
                    {extensionOutWithCondition
                        .filter((i) => i.isDisplayed)
                        .map((item, index) => (
                            <Col
                                key={index}
                                xs={12}
                                sm={8}
                                md={8}
                                lg={4}
                                xl={4}
                                xxl={3}
                            >
                                {React.cloneElement(item.engine, {
                                    style: { width: '100%' }
                                })}
                            </Col>
                        ))}
                    {extensionOut.map((item, index) => (
                        <Col
                            key={index}
                            xs={12}
                            sm={8}
                            md={8}
                            lg={4}
                            xl={4}
                            xxl={3}
                        >
                            {React.cloneElement(item, {
                                style: { width: '100%' }
                            })}
                        </Col>
                    ))}
                </Row>
            )}
            {(engines || otherPanels) && (
                <Collapse className='mb-4' defaultActiveKey={['1']}>
                    {engines && engines.length > 0 && (
                        <Panel header='Filter' key='1'>
                            <Form
                                {...configs}
                                style={{
                                    width: '100%'
                                }}
                            >
                                <Row
                                    style={{ width: '100%' }}
                                    justify='start'
                                    gutter={[10, 10]}
                                >
                                    {showEngines()}
                                </Row>
                                {extensionIn && extensionIn}
                            </Form>
                        </Panel>
                    )}

                    {otherPanels && otherPanels}
                </Collapse>
            )}
        </>
    )
}
