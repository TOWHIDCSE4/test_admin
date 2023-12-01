import React, { useCallback } from 'react'
import cn from 'classnames'
import { Upload, message, Button } from 'antd'
import { UploadProps } from 'antd/lib/upload/interface'
import UploadAPI from 'api/UploadAPI'
import styles from './UploadButton.module.scss'

interface UploadButtonProps extends UploadProps {
    afterUpload?: (url: string) => void
}

const UploadButton = ({ afterUpload, ...props }: UploadButtonProps) => {
    const customRequest = useCallback(async (upload: any) => {
        try {
            const url = await UploadAPI.uploadImage(upload.file)
            upload.onSuccess(url)
            if (afterUpload) afterUpload(url)
        } catch (error) {
            upload.onError(error)
        }
    }, [])
    return (
        <Upload
            maxCount={1}
            customRequest={customRequest}
            {...props}
            key={props.defaultFileList?.[0]?.url}
        >
            <Button shape='round' className={cn(styles.uploadButton)}>
                Choose File
            </Button>
        </Upload>
    )
}

export default UploadButton
