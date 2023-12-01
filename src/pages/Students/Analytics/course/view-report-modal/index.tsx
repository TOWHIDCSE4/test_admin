import { FC, memo } from 'react'
import { Button, Modal } from 'antd'
import { EnumScheduledMemoType, IScheduledMemo } from 'types'
import moment from 'moment'
// import { getTransTextInSideDOM } from 'utils/translate-utils'
// eslint-disable-next-line import/no-duplicates
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { IModalProps } from 'const/common'
import CourseSummary from '../../monthly/modal/CourseSummary'
// eslint-disable-next-line import/no-duplicates
import MonthlySummary from '../../monthly/modal/MonthlySummary'

interface IProps extends IModalProps {
    type: EnumScheduledMemoType
    data: IScheduledMemo
}
const ViewReportModal: FC<IProps> = ({ visible, toggleModal, type, data }) => {
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
            visible={visible}
            onCancel={() => toggleModal(false)}
            width={1024}
            footer={
                <Button type='primary' onClick={handleSavePdf}>
                    Save PDF
                </Button>
            }
            className='modalProfile'
            title={
                type === EnumScheduledMemoType.COURSE
                    ? `Báo cáo khoá học ${data?.course?.name} của học viên ${data?.student?.full_name} - ${data?.student?.username}`
                    : `Báo cáo tháng ${data?.month}/${data?.year} của học viên ${data?.student?.full_name} - ${data?.student?.username}`
            }
        >
            {data && type === EnumScheduledMemoType.COURSE ? (
                <div id='savePdf'>
                    <CourseSummary data={data} />
                </div>
            ) : (
                data &&
                type === EnumScheduledMemoType.MONTHLY && (
                    <div id='savePdf'>
                        <MonthlySummary
                            month={moment()
                                .set('year', data?.year)
                                .set('month', data?.month - 1)}
                            data={data}
                        />
                    </div>
                )
            )}
        </Modal>
    )
}

export default memo(ViewReportModal)
