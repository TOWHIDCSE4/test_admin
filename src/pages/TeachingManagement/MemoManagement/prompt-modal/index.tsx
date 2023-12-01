import {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    FC
} from 'react'
import {
    Modal,
    Tag,
    Card,
    Row,
    Col,
    Divider,
    Descriptions,
    Table,
    Tooltip,
    Form
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import _ from 'lodash'

type Props = {
    visible: boolean
    dataPrompt: any
    close: () => void
}

const PromptViewModel: FC<Props> = (props) => {
    const { visible, dataPrompt, close } = props
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => close()}
            title={dataPrompt?.title}
            footer={null}
            width={768}
        >
            <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                <Form.Item label='Description'>
                    <TextArea
                        value={dataPrompt?.description}
                        readOnly
                        rows={3}
                    />
                </Form.Item>
                <Form.Item label='Content'>
                    <TextArea value={dataPrompt?.prompt} readOnly rows={6} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default PromptViewModel
