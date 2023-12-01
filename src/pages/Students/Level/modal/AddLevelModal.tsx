import React from 'react'
import WalletAPI from 'api/WalletAPI'
import moment from 'moment'
import {
    Card,
    Row,
    Form,
    Modal,
    Button,
    notification,
    Col,
    Alert,
    Input,
    Divider,
    InputNumber
} from 'antd'

import StudentLevelAPI from 'api/StudentLevelAPI'
import ConfirmModal from '../../../../core/Atoms/ConfirmModal'

const { TextArea } = Input
interface Props {
    visible: boolean
    toggleModal: (request: any) => void
    reload: () => void
    selectedLevel: any
}

const AddLevelModal: React.FunctionComponent<Props> = (props) => {
    const { visible, toggleModal, reload, selectedLevel } = props
    const [form] = Form.useForm()
    React.useEffect(() => {
        form.resetFields()
        if (selectedLevel) {
            form.setFieldsValue({
                ...selectedLevel
            })
        } else {
            form.resetFields()
        }
    }, [selectedLevel])
    const addLevel = async () => {
        try {
            const data = await form.getFieldsValue()
            await StudentLevelAPI.createStudentLevel(data)
            reload()
            toggleModal(null)
            notification.success({
                message: 'Success',
                description: 'Student Level has been created'
            })
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }
    const updateLevel = async () => {
        try {
            const data = await form.getFieldsValue()
            await StudentLevelAPI.editStudentLevel(selectedLevel.id, data)
            reload()
            toggleModal(null)
            notification.success({
                message: 'Success',
                description: 'Student Level updated successfully'
            })
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            })
        }
    }
    return (
        <Modal
            centered
            closable
            width='80%'
            visible={visible}
            onCancel={() => {
                toggleModal(null)
                reload()
            }}
            footer={false}
        >
            <Card title='Add Student Level' bordered={false}>
                <Form form={form} onFinish={() => {}}>
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <Form.Item>ID : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='id'>
                                <Input
                                    placeholder='Enter the id'
                                    // onChange={(v) => {}}
                                    style={{ width: '100%' }}
                                    required
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item>Name : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='name'>
                                <Input
                                    placeholder='Enter the name'
                                    // onChange={(v) => {}}
                                    style={{ width: '100%' }}
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <Form.Item>Grammar Description : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='grammar_description'>
                                <TextArea
                                    placeholder='Grammar Description'
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <Form.Item>Skill Description : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='skill_description'>
                                <TextArea
                                    placeholder='Skill Description'
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <Form.Item>Speaking Description : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='speaking_description'>
                                <TextArea
                                    placeholder='Speaking Description'
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]}>
                        <Col span={8}>
                            <Form.Item>Vocabulary Description : </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name='vocabulary_description'>
                                <TextArea
                                    placeholder='Vocabulary Description'
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[24, 24]}>
                        {!selectedLevel ? (
                            <Col span={8} offset={20}>
                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        onClick={addLevel}
                                    >
                                        Add
                                    </Button>
                                </Form.Item>
                            </Col>
                        ) : (
                            <Col span={8} offset={20}>
                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        onClick={updateLevel}
                                    >
                                        Save
                                    </Button>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Card>
        </Modal>
    )
}

export default AddLevelModal
