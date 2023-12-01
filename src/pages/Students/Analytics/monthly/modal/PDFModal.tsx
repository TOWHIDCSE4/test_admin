import React from 'react'
import { Modal, Button, Tag } from 'antd'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PDFModal = (props) => {
    const handleSavePdf = () => {
        const input = document.getElementById('savePdf')
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png')
            // eslint-disable-next-line new-cap
            const pdf = new jsPDF({
                orientation: 'landscape'
            })
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save('download.pdf')
        })
    }
    return (
        <Modal
            centered
            closable
            visible={props.visible}
            onCancel={props.toggleModal}
            title={props.title}
            width={800}
            footer={
                <Button type='primary' onClick={handleSavePdf}>
                    Save PDF
                </Button>
            }
        >
            <div id='savePdf'>
                <b>Học viên: </b>
                <span>
                    <p className='mb-2'>
                        {`${props.content?.student?.full_name} - ${props.content?.student?.username}`}
                    </p>
                </span>
                <br />
                {props.content?.course ? (
                    <>
                        <b>Khoá học: </b>
                        <span>{props.content?.course.name}</span>
                        <br />
                    </>
                ) : (
                    <>
                        <b>Tháng: </b>
                        <span>
                            {props.content?.month} / {props.content?.year}
                        </span>
                        <br />
                    </>
                )}
                <b>Điểm chuyên cần:</b>
                <span className='ml-1'>{props.content?.attendance?.point}</span>
                <br />
                <b>Điểm thái độ học tập:</b>
                <span className='ml-1'>
                    {props.content?.student &&
                        `${props.content?.attitude?.point}`}
                </span>
                <br />
                <b>Điểm BTVN:</b>
                <span className='ml-1'>
                    {props.content?.student &&
                        `${props.content?.homework?.point}`}
                </span>
                <br />
                {props.content?.student?.exam_result ? (
                    <>
                        <b>Điểm kiểm tra (TB):</b>
                        <span className='ml-1'>
                            {props.content?.student &&
                                `${props.content?.exam_result}`}
                        </span>
                        <br />
                    </>
                ) : (
                    ''
                )}

                <b style={{ color: 'blueviolet' }}>Điểm trung bình:</b>
                <span className='ml-1'>{props.content?.average}</span>
                <br />
                <b style={{ color: 'red' }}>Xếp loại:</b>
                <span className='ml-1'>
                    {props.content?.average <= 3.5
                        ? 'Yếu'
                        : props.content?.average <= 5.5
                        ? 'Trung bình'
                        : props.content?.average <= 8
                        ? 'Khá'
                        : props.content?.average < 10
                        ? 'Giỏi'
                        : 'Xuất sắc'}
                </span>
            </div>
        </Modal>
    )
}

export default PDFModal
