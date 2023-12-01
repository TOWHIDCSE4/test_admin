import { FC, memo, useCallback, useEffect, useState } from 'react'
import { Form, Input, Col, Row, Select, Button } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { ILocation, ITeacher } from 'types'
import { MODAL_TYPE } from 'const'
import { notify } from 'utils/notify'
import BankAPI from 'api/BankAPI'
import UserAPI from 'api/UserAPI'

const { Option } = Select
const { TextArea } = Input

type Props = {
    data: ITeacher
    modalType: MODAL_TYPE
    refetchData: () => void
}
const Payment: FC<Props> = ({ data, modalType, refetchData }) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState<boolean>(false)
    const [bankList, setBankList] = useState<ILocation[]>([])

    const fetchBankList = () => {
        BankAPI.getBankList()
            .then((res) => {
                setBankList(res)
            })
            .catch((err) => {
                notify('error', err.message)
            })
    }

    useEffect(() => {
        if (!_.isEmpty(data) && modalType === MODAL_TYPE.EDIT) {
            form.setFieldsValue({
                bank_name: data?.user_info?.bank_account?.bank_name || '',
                account_number:
                    data?.user_info?.bank_account?.account_number || '',
                account_name: data?.user_info?.bank_account?.account_name || '',
                paypal_email: data?.user_info?.bank_account?.paypal_email || '',
                note: data?.user_info?.bank_account?.note || ''
            })
            fetchBankList()
        }
    }, [data, modalType])

    const renderBanks = () =>
        bankList.map((item, index) => (
            <Option key={item.id} value={item.id}>
                {item.name}
            </Option>
        ))

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const bank_account = { ...values }
            if (modalType === MODAL_TYPE.EDIT) {
                UserAPI.editUser(data.user_id, { bank_account })
                    .then((res) => {
                        notify('success', 'Update user successfully')
                        refetchData()
                    })
                    .catch((err) => {
                        notify('error', err.message)
                    })
                    .finally(() => setLoading(false))
            }
        },
        [form, modalType, data]
    )

    return (
        <>
            <Form
                name='basic'
                layout='vertical'
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
            >
                <Row gutter={[20, 10]}>
                    <Col span={12}>
                        <Form.Item
                            labelAlign='left'
                            name='bank_name'
                            label='Bank name'
                            rules={[
                                {
                                    required: true,
                                    message: 'Bank name is required'
                                }
                            ]}
                        >
                            {/* <Select
                                showSearch
                                placeholder='Choose bank'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    _.isString(option.children) &&
                                    option.children
                                        ?.toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {renderBanks()}
                            </Select> */}
                            <Input placeholder='Enter bank name' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Account number'
                            name='account_number'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Account number is required'
                                }
                            ]}
                        >
                            <Input placeholder='Enter account number' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[20, 10]}>
                    <Col span={12}>
                        <Form.Item
                            label='Account name'
                            name='account_name'
                            labelAlign='left'
                            rules={[
                                {
                                    required: true,
                                    message: 'Account name is required'
                                }
                            ]}
                        >
                            <Input placeholder='Enter account name' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Paypal Email'
                            name='paypal_email'
                            labelAlign='left'
                        >
                            <Input placeholder='Enter email' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item name='note' label='Payment note'>
                            <TextArea placeholder='Enter payment note' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} className='d-flex justify-content-end'>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={loading}
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default memo(Payment)
