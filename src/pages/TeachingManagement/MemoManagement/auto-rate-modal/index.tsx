import {
    FunctionComponent,
    useCallback,
    useEffect,
    useReducer,
    FC,
    useState
} from 'react'
import { Modal, Row, Form, notification, Button, Select } from 'antd'
import _ from 'lodash'
import TextArea from 'antd/lib/input/TextArea'
import { EnumLAReportType } from 'types/ILearningAssessmentReports'
import LearningAssessmentReportsAPI from 'api/LearningAssessmentReportsAPI'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import TextEditor from 'core/Atoms/TextEditor'

type Props = {
    visible: boolean
    data: any
    on_edit: boolean
    close: (dataRate: any) => void
}

const AutoRateModel: FC<Props> = (props) => {
    const { visible, data, on_edit, close } = props
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (visible && !_.isEmpty(data?.dataRate)) {
            form.setFieldsValue({
                content: data?.dataRate.trim(),
                type: EnumLAReportType.DILIGENCE
            })
        }
    }, [visible, data])

    const handleClose = useCallback((should: boolean) => {
        if (should) close(form.getFieldValue('content'))
    }, [])

    const onCreate = useCallback(
        (values) => {
            setLoading(true)
            LearningAssessmentReportsAPI.createLAReportsByAdmin({
                content_prompt: values.content,
                type: values.type,
                ranger_search: data?.ranger_search,
                promptObjId: data?.promptObjId,
                student_id: data?.student_id
            })
                .then((res) => {
                    notification.success({
                        message: 'Success',
                        description: 'Successfully'
                    })
                    handleClose(true)
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setLoading(false))
        },
        [data]
    )

    const renderBody = () => (
        <Form
            form={form}
            name='Kết Quả Đánh Giá Tổng Hợp Memo Bằng AI'
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 19 }}
            onFinish={onCreate}
        >
            <Form.Item label='Content' name='content'>
                <TextEditor
                    heightCustom={500}
                    disable={
                        !on_edit || !checkPermission(PERMISSIONS.arla_create)
                    }
                />
            </Form.Item>
            <Form.Item
                label='Type'
                name='type'
                rules={[
                    {
                        required: true,
                        message: `Type is required`
                    }
                ]}
            >
                <Select placeholder='select type' style={{ width: '50%' }}>
                    <Select.Option value={EnumLAReportType.DILIGENCE}>
                        Báo cáo chuyên cần
                    </Select.Option>
                    <Select.Option value={EnumLAReportType.OTHER}>
                        Other
                    </Select.Option>
                </Select>
            </Form.Item>
            {on_edit && checkPermission(PERMISSIONS.arla_create) && (
                <Form.Item wrapperCol={{ offset: 6 }}>
                    <Row justify='end'>
                        <Button
                            htmlType='submit'
                            type='primary'
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Save
                        </Button>
                    </Row>
                </Form.Item>
            )}
        </Form>
    )

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => close(null)}
            title='Đánh giá tổng hợp memo bằng AI'
            footer={null}
            width={768}
        >
            {renderBody()}
        </Modal>
    )
}

export default AutoRateModel
