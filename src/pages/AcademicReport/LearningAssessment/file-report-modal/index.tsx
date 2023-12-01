/* eslint-disable jsx-a11y/iframe-has-title */
import { FC } from 'react'
import { Modal, Form } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import _ from 'lodash'

type Props = {
    visible: boolean
    data: any
    close: () => void
}

const FileReportViewModel: FC<Props> = (props) => {
    const { visible, data, close } = props
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => close()}
            title='File report'
            footer={null}
            width={'70vw'}
        >
            <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                {data?.file_upload && (
                    <iframe
                        src={data?.file_upload}
                        allow='camera; microphone'
                        key='file_report'
                        width='100%'
                        style={{ height: '80vh' }}
                    />
                )}
            </Form>
        </Modal>
    )
}

export default FileReportViewModel
