import { Modal } from 'antd'

type Props = {
    title?: string
    content: string
    onOk: () => void
    rest?: any
}

const ConfirmModal = ({ title, content, onOk, ...rest }: Props) => {
    Modal.confirm({
        title: title || 'Confirm',
        content,
        okText: 'Ok',
        cancelText: 'Cancel',
        onOk,
        ...rest
    })
}

export default ConfirmModal
