import { useCallback, useEffect, useState } from 'react'
import { Upload } from 'antd'
import { UploadProps } from 'antd/lib/upload/interface'
import UploadAPI from 'api/UploadAPI'
import ImgCrop from 'antd-img-crop'
import _ from 'lodash'

interface UploadButtonProps extends UploadProps {
    afterUpload?: (url: string) => void
}

const UploadImage = ({ afterUpload, ...props }: UploadButtonProps) => {
    const [fileList, setFileList] = useState([])

    useEffect(() => {
        if (props?.defaultFileList && props.defaultFileList.length > 0) {
            setFileList(props.defaultFileList)
        }
    }, [props?.defaultFileList])
    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList)
    }
    const customRequest = useCallback(async (upload: any) => {
        try {
            const url = await UploadAPI.uploadImage(upload.file)
            upload.onSuccess(url)
            if (afterUpload) afterUpload(url)
        } catch (error) {
            upload.onError(error)
        }
    }, [])

    const onPreview = async (file) => {
        let src = file.url
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.readAsDataURL(file.originFileObj)
                reader.onload = () => resolve(reader.result)
            })
        }
        const image = new Image()
        image.src = src
        const imgWindow = window.open(src)
        imgWindow.document.write(image.outerHTML)
    }

    return (
        <div className='text-center'>
            <ImgCrop rotationSlider>
                <Upload
                    maxCount={1}
                    listType='picture-card'
                    customRequest={customRequest}
                    {...props}
                    key={props.defaultFileList?.[0]?.url}
                    onPreview={onPreview}
                    onChange={onChange}
                >
                    {fileList.length === 0 && 'Upload'}
                </Upload>
            </ImgCrop>
            <p
                style={{ fontSize: '13px', color: 'red', fontStyle: 'italic' }}
                className='mb-0'
            >
                (Upload avatar image with size 300 x 300px and less than 2MB.)
            </p>
        </div>
    )
}

export default UploadImage
