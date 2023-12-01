import { useEffect, useReducer, useRef } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    Alert,
    Spin
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import SearchUser from 'components/search-user-with-lazy-load'
import StudentAPI from 'api/StudentAPI'
import MergePackageAPI from 'api/MergePackageAPI'

const { TextArea } = Input
const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    data: any
    refetchData: any
}
const AddNew = ({ visible, toggleModal, data, refetchData }: Props) => {
    const childRef = useRef(null)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isLoadingPackage: false,
            student_id: '',
            package_one_id: '',
            package_two_id: '',
            packages: []
        }
    )
    const [form] = useForm()
    const getPackageUnmatch = ({ student_id }) => {
        setValues({ isLoading: true })
        const searchData = {
            student_id
        }
        MergePackageAPI.getPackageUnmatch(searchData)
            .then((res) => {
                if (res?.data?.length === 0) {
                    notification.error({
                        message: 'Error',
                        description: 'Học viên này không có gói học nào'
                    })
                }
                if (res?.data?.length) {
                    setValues({ packages: res.data })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {}, [visible])

    const searchDataUserStudent = (dataSelected) => {
        if (dataSelected.selected) {
            const searchText = dataSelected.selected.id
            setValues({ student_id: searchText })
            form.setFieldValue('student_id', searchText)
            getPackageUnmatch({ student_id: searchText })
        }
        if (dataSelected.clear) {
            console.log('clear')
        }
    }
    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingPackage: false,
            student_id: '',
            package_one_id: '',
            package_two_id: '',
            packages: []
        })
        childRef.current.setValuesChild({
            page_number: 1,
            total: 1,
            search: ''
        })
    }
    const renderSelectPackage = () => {
        return values.packages.map((item, index) => {
            return (
                <Option key={index} value={item.id}>
                    {`${item.id} - ${item.package_name}`}
                </Option>
            )
        })
    }
    const onSave = async () => {
        await form?.validateFields()

        if (values.package_one_id === values.package_two_id) {
            return notification.error({
                message: 'Error',
                description: '2 gói học không được trùng nhau'
            })
        }

        const dataPost = {
            package_one_id: values.package_one_id,
            package_two_id: values.package_two_id,
            student_id: values.student_id
        }
        setValues({ isLoading: true })
        MergePackageAPI.mergePackage(dataPost)
            .then((res) => {
                console.log(res)
                reset()
                refetchData()
                toggleModal(false)
                notification.success({
                    message: 'Success',
                    description: 'Thêm thành công'
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            open={visible}
            onCancel={() => {
                reset()
                toggleModal(false)
            }}
            title='Merge Package'
            footer={null}
            width={500}
        >
            <Row>
                <Col span={24}>
                    <Form
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                    >
                        <Form.Item
                            label='Học viên'
                            name='student_id'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <SearchUser
                                ref={childRef}
                                api={StudentAPI.getAllStudents}
                                placeholder='Search by student'
                                searchDataUser={searchDataUserStudent}
                                filter={{
                                    status: 'active',
                                    search: ''
                                }}
                            ></SearchUser>
                        </Form.Item>

                        <Form.Item
                            name='package_one_id'
                            label='Package A'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select
                                className='w-100'
                                showSearch
                                filterOption={true}
                                loading={values.isLoadingPackage}
                                allowClear
                                value={values.package_one_id}
                                onChange={(val) => {
                                    setValues({ package_one_id: val })
                                }}
                            >
                                {renderSelectPackage()}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name='package_two_id'
                            label='Package B'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select
                                className='w-100'
                                showSearch
                                filterOption={true}
                                loading={values.isLoadingPackage}
                                allowClear
                                value={values.package_two_id}
                                onChange={(val) => {
                                    setValues({ package_two_id: val })
                                }}
                            >
                                {renderSelectPackage()}
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={values.isLoading}
                                onClick={onSave}
                            >
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default AddNew
