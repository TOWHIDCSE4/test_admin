import { FC, memo, useCallback, useState } from 'react'
import { Modal, Tabs } from 'antd'
import _ from 'lodash'
import { ITeacher } from 'types'
import { MODAL_TYPE } from 'const'
import GeneralInformation from './general-infomation'
import Payment from './payment'
import Profile from './profile'

const { TabPane } = Tabs

type Props = {
    data: ITeacher
    visible: boolean
    type: MODAL_TYPE
    toggleModal: (val: boolean) => void
    refetchData: () => void
}

const EditTeacherModal: FC<Props> = ({
    visible,
    data,
    type,
    toggleModal,
    refetchData
}) => {
    const [loading, setLoading] = useState(false)

    const handleClose = useCallback(() => {
        toggleModal(false)
    }, [toggleModal])

    const renderBody = () => (
        <>
            <Tabs defaultActiveKey='1' type='card'>
                <TabPane tab='General Information' key='1'>
                    <GeneralInformation
                        data={data}
                        modalType={type}
                        refetchData={refetchData}
                    />
                </TabPane>
                {type === MODAL_TYPE.EDIT && (
                    <>
                        <TabPane tab='Profile' key='2'>
                            <Profile data={data} refetchData={refetchData} />
                        </TabPane>
                        <TabPane tab='Payment' key='3'>
                            <Payment
                                data={data}
                                modalType={type}
                                refetchData={refetchData}
                            />
                        </TabPane>
                    </>
                )}
            </Tabs>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={() => handleClose()}
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Create new teacher'
                    : 'Edit teacher information'
            }
            footer={null}
            width={842}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(EditTeacherModal)
