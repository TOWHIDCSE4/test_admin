import React, { useCallback, useEffect, useState } from 'react'
import cn from 'classnames'
import UploadButton from 'core/Atoms/UploadButton'
import { ITeacher, IUser } from 'types'
import { urlToFileName } from 'utils/string'
import UserAPI from 'api/UserAPI'
import { Col, Row, Upload, Tag } from 'antd'
import { notify } from 'utils/notify'
import TeacherAPI from 'api/TeacherAPI'
import styles from './index.module.scss'

interface ProfileProps {
    data: ITeacher
    refetchData: () => void
}

const Profile = ({ data, refetchData }: ProfileProps) => {
    const [files, setFiles] = useState({
        degree: null,
        tesol: null,
        tefl: null,
        ielts: null,
        toeic: null,
        intro_video: null,
        cv: null
    })

    useEffect(() => {
        if (!data) return
        setFiles({
            degree: data.degree && [
                {
                    name: urlToFileName(data.degree),
                    url: data.degree
                }
            ],
            tesol: data.teaching_certificate?.tesol && [
                {
                    name: urlToFileName(data.teaching_certificate.tesol),
                    url: data.teaching_certificate.tesol
                }
            ],
            tefl: data.teaching_certificate?.tefl && [
                {
                    name: urlToFileName(data.teaching_certificate.tefl),
                    url: data.teaching_certificate.tefl
                }
            ],
            ielts: data.english_certificate?.ielts && [
                {
                    name: urlToFileName(data.english_certificate.ielts),
                    url: data.english_certificate.ielts
                }
            ],
            toeic: data.english_certificate?.toeic && [
                {
                    name: urlToFileName(data.english_certificate.toeic),
                    url: data.english_certificate.toeic
                }
            ],
            intro_video: data.intro_video && [
                {
                    name: urlToFileName(data.intro_video),
                    url: data.intro_video
                }
            ],
            cv: data.cv && [
                {
                    name: urlToFileName(data.cv),
                    url: data.cv
                }
            ]
        })
    }, [data])

    const editTeacher = useCallback(async (payload) => {
        try {
            await TeacherAPI.editTeacher(data.user_id, payload)
            notify('success', 'Update successfully')
        } catch (error) {
            notify('error', error.message)
        }
        refetchData()
    }, [])

    const onRemove = useCallback(
        (key) => async (file) => {
            if (file.error) return
            editTeacher({ [key]: null })
        },
        []
    )

    const beforeUploadPdf = useCallback((file: any) => {
        if (file.type !== 'application/pdf') {
            notify('error', 'You can only upload pdf file!')
            return Upload.LIST_IGNORE
        }
    }, [])

    const beforeUploadVideo = useCallback((file: any) => {
        if (!file.type.startsWith('video/')) {
            notify('error', 'You can only upload video file!')
            return Upload.LIST_IGNORE
        }
    }, [])

    return (
        <div className={cn(styles.wrapProfile)}>
            <div className='ml-3 ml-sm-4 mr-sm-4  mr-3'>
                {/* <div className={cn(styles.introduction)}>
                    <h4>
                        {getTransTextInSideDOM('teacher.info.profile.intro')}
                    </h4>
                    <p>
                        Lorem ipsum dolor sit, amet consectetur adipisicing
                        elit. Maiores quidem perspiciatis dignissimos. Animi
                        accusamus quo labore architecto quaerat ab sit cum ipsa
                        dolorum laudantium, velit assumenda unde ratione, harum
                        quos!
                    </p>
                </div>
                <div className={cn(styles.experience)}>
                    <h4>{getTransTextInSideDOM('teacher.info.profile.exp')}</h4>
                    <p>
                        Lorem ipsum dolor sit, amet consectetur adipisicing
                        elit. Maiores quidem perspiciatis dignissimos. Animi
                        accusamus quo labore architecto quaerat ab sit cum ipsa
                        dolorum laudantium, velit assumenda unde ratione, harum
                        quos!
                    </p>
                </div> */}
                <Row justify='center' gutter={1}>
                    <Col span={24} lg={12}>
                        <div
                            className={`${cn(
                                styles.certificate
                            )} text-sm-center`}
                        >
                            <h4 className='text-sm-center'>
                                Teaching certificate
                            </h4>
                            <div className='d-flex flex-column flex-sm-row justify-content-around'>
                                <div className={cn(styles.certificateItem)}>
                                    <Tag color='#f50'>TESOL</Tag>
                                    <UploadButton
                                        className='d-block mt-2'
                                        accept='.pdf'
                                        beforeUpload={beforeUploadPdf}
                                        afterUpload={(url) =>
                                            editTeacher({
                                                'teaching_certificate.tesol':
                                                    url
                                            })
                                        }
                                        onRemove={onRemove(
                                            'teaching_certificate.tesol'
                                        )}
                                        defaultFileList={files.tesol}
                                    />
                                </div>
                                <div className={cn(styles.certificateItem)}>
                                    <Tag color='#f50'>TEFL</Tag>
                                    <UploadButton
                                        className='d-block mt-2'
                                        accept='.pdf'
                                        beforeUpload={beforeUploadPdf}
                                        afterUpload={(url) =>
                                            editTeacher({
                                                'teaching_certificate.tefl': url
                                            })
                                        }
                                        onRemove={onRemove(
                                            'teaching_certificate.tefl'
                                        )}
                                        defaultFileList={files.tefl}
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col span={24} lg={12}>
                        <div
                            className={`${cn(
                                styles.certificate
                            )} text-sm-center`}
                        >
                            <h4 className='text-sm-center'>
                                English certificate
                            </h4>
                            <div className='d-flex flex-column flex-sm-row justify-content-around'>
                                <div className={cn(styles.certificateItem)}>
                                    <Tag color='#f50'>IELTS</Tag>
                                    <UploadButton
                                        className='d-block mt-2'
                                        accept='.pdf'
                                        beforeUpload={beforeUploadPdf}
                                        afterUpload={(url) =>
                                            editTeacher({
                                                'english_certificate.ielts': url
                                            })
                                        }
                                        onRemove={onRemove(
                                            'english_certificate.ielts'
                                        )}
                                        defaultFileList={files.ielts}
                                    />
                                </div>
                                <div className={cn(styles.certificateItem)}>
                                    <Tag color='#f50'>TOEIC</Tag>
                                    <UploadButton
                                        className='d-block mt-2'
                                        accept='.pdf'
                                        beforeUpload={beforeUploadPdf}
                                        afterUpload={(url) =>
                                            editTeacher({
                                                'english_certificate.toeic': url
                                            })
                                        }
                                        onRemove={onRemove(
                                            'english_certificate.toeic'
                                        )}
                                        defaultFileList={files.toeic}
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className={cn(styles.update_DegreeCertificate)}>
                    <h4>Upload degree</h4>
                    <UploadButton
                        accept='.pdf'
                        beforeUpload={beforeUploadPdf}
                        afterUpload={(url) => editTeacher({ degree: url })}
                        onRemove={onRemove('degree')}
                        defaultFileList={files.degree}
                    />
                </div>
                <div className={cn(styles.video_introduction)}>
                    <h4>Video introduction</h4>
                    <UploadButton
                        accept='video/*'
                        beforeUpload={beforeUploadVideo}
                        afterUpload={(url) => editTeacher({ intro_video: url })}
                        onRemove={onRemove('intro_video')}
                        defaultFileList={files.intro_video}
                    />
                </div>
                <div className={cn(styles.upload_cv)}>
                    <h4>Upload CV</h4>
                    <UploadButton
                        accept='.pdf'
                        beforeUpload={beforeUploadPdf}
                        afterUpload={(url) => editTeacher({ cv: url })}
                        onRemove={onRemove('cv')}
                        defaultFileList={files.cv}
                    />
                </div>
            </div>
        </div>
    )
}

export default Profile
