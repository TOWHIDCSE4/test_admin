import React from 'react'
import { Collapse, Row, Col } from 'antd'

const { Panel } = Collapse

export interface IFilterEngine {
    label: string
    engine: JSX.Element
}

interface IFilterDataWrapperProps {
    otherPanels?: JSX.Element
    engines?: IFilterEngine[]
    extensionIn?: JSX.Element
    extensionOut?: JSX.Element[]
}

export default function FilterDataWrapper({
    otherPanels,
    engines,
    extensionIn,
    extensionOut
}: IFilterDataWrapperProps) {
    return (
        <>
            {extensionOut && extensionOut.length > 0 && (
                <Row className='mb-2' justify='end' gutter={[16, 16]}>
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
                            <Row justify='start' gutter={[10, 10]}>
                                {engines.map((item, index) => (
                                    <Col
                                        key={index}
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={8}
                                        xxl={6}
                                    >
                                        <Row className='w-100 d-flex align-items-center'>
                                            <Col span={9} xl={8} xxl={9}>
                                                <p
                                                    style={{
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {item.label}
                                                </p>
                                            </Col>
                                            <Col span={23} xl={16} xxl={22}>
                                                {React.cloneElement(
                                                    item.engine,
                                                    {
                                                        style: { width: '100%' }
                                                    }
                                                )}
                                            </Col>
                                        </Row>
                                    </Col>
                                ))}
                            </Row>
                            {extensionIn && extensionIn}
                        </Panel>
                    )}

                    {otherPanels && otherPanels}
                </Collapse>
            )}
        </>
    )
}
