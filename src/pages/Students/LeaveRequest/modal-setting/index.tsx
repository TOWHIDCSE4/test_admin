import React, {
    FC,
    memo,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
import {
    Modal,
    DatePicker,
    Form,
    Input,
    Button,
    Select,
    Switch,
    notification
} from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { notify } from 'utils/notify'
import ScreenSettingAPI from 'api/ScreenSettingAPI'
import { FULL_DATE_FORMAT } from 'const'
import UserAPI from 'api/UserAPI'
import { EnumScreenType, serverScreenConfig } from 'types/IScreenSetting'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Option } = Select

type ScreenSettingModalProps = {
    visible: boolean
    // data?: IScreenSetting
    toggleModal: (visible: boolean) => void
}

const ScreenSettingModal: FC<ScreenSettingModalProps> = ({
    visible,
    // data,
    toggleModal
}) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            dataSetting: null
        }
    )

    const getScreenConfigLeaveRequest = useCallback(() => {
        setLoading(true)
        ScreenSettingAPI.getOneScreenConfig({
            server: serverScreenConfig.WEBAPP,
            screen: EnumScreenType.student_leave_request
        })
            .then((dataRes) => {
                setValues({ dataSetting: dataRes })
                values.dataSetting = dataRes
                if (dataRes) {
                    form.setFieldsValue({
                        is_show: dataRes?.is_show,
                        time: [
                            moment(dataRes?.config?.start_time),
                            moment(dataRes?.config?.end_time)
                        ]
                    })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
    }, [values])

    const onClose = () => {
        toggleModal(false)
        form.resetFields()
    }
    const onSubmit = useCallback(() => {
        const payload: any = {
            is_show: form.getFieldValue('is_show'),
            config: {
                start_time: new Date(form.getFieldValue('time')[0]).getTime(),
                end_time: new Date(form.getFieldValue('time')[1]).getTime()
            }
        }
        if (values.dataSetting) {
            setLoading(true)
            ScreenSettingAPI.editScreenConfig(values.dataSetting._id, payload)
                .then((res) => {
                    setLoading(false)
                    notify('success', 'Update successfully')
                    onClose()
                })
                .catch((err) => {
                    notify('error', err.message)
                    setLoading(false)
                })
                .finally(() => setLoading(false))
        } else {
            notify('error', 'data is not found')
        }
    }, [form])

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                is_show: true,
                time: [
                    moment().add('month', 1).startOf('month'),
                    moment()
                        .add('month', 1)
                        .startOf('month')
                        .add('day', 3)
                        .endOf('day')
                ]
            })
            getScreenConfigLeaveRequest()
        }
    }, [visible])

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 }
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 14 }
        }
    }

    const disabledDate = (current) =>
        // Can not select days before today and today
        current && current < moment().startOf('day')

    const renderBody = () => (
        <Form {...formItemLayout} form={form}>
            <Form.Item
                label='Time allowed'
                required
                name='time'
                labelAlign='left'
                initialValue={[
                    moment().add('month', 1).startOf('month'),
                    moment()
                        .add('month', 1)
                        .startOf('month')
                        .add('day', 4)
                        .endOf('day')
                ]}
            >
                <RangePicker
                    allowClear={false}
                    format='YYYY-MM-DD'
                    disabledDate={disabledDate}
                />
            </Form.Item>
            <Form.Item
                label='Open permission to create'
                name='is_show'
                labelAlign='left'
                valuePropName='checked'
            >
                <Switch />
            </Form.Item>
        </Form>
    )

    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={onClose}
            title='Setting leave request screen of student page'
            width={700}
            footer={[
                <Button
                    key='approve'
                    type='primary'
                    shape='round'
                    onClick={onSubmit}
                    loading={loading}
                >
                    Save
                </Button>
            ]}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(ScreenSettingModal)
