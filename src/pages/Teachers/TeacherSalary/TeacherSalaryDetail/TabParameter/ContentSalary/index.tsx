import React, { FC, useState } from 'react'
import cn from 'classnames'
import { toReadablePrice } from 'utils'
import styles from '../TabParameter.module.scss'
import ModalDetail from '../ModalDetail'

type Props = {
    data: any
}

const ContentPaneLeft: FC<Props> = ({ data }) => {
    const [visibleModal, setVisibleModal] = useState(false)
    const [selectedData, setSelectedData] = useState([])

    const toggleModal = (val: boolean) => {
        setVisibleModal(val)
    }
    return (
        <div className={cn(styles.table)}>
            <div className={cn(styles.headTable)}>
                <div className={cn(styles.tableItem)}>
                    <div>No</div>
                    <div>Item</div>
                    <div>Formula</div>
                    <div>Quantity</div>
                    <div>Amount</div>
                </div>
            </div>
            <div className={cn(styles.contentTable)}>
                <div className={cn(styles.tableItem)}>
                    <div>1</div>
                    <div>
                        <p>Slot done and write memo</p>
                    </div>
                    <div>
                        {`
                        [ Quantity ] *
                        [ Salary Per Slot (${toReadablePrice(
                            data?.salary_slot
                        )} ${data?.currency})]
                        `}
                    </div>
                    <div>{data?.base_salary?.list_slot_done?.length}</div>
                    <div>
                        <span>
                            {`${toReadablePrice(
                                data?.base_salary?.total_salary_slot_done
                            )} ${data?.currency}`}
                        </span>
                    </div>
                </div>

                <div className={cn(styles.tableItem)}>
                    <div>1.1</div>
                    <div>
                        <p>Slot done without memo</p>
                    </div>
                    <div></div>
                    <div>
                        <a
                            className='text-primary'
                            onClick={() => {
                                if (
                                    data?.base_salary
                                        ?.list_slot_done_without_memo?.length
                                ) {
                                    setSelectedData(
                                        data?.base_salary
                                            ?.list_slot_done_without_memo
                                    )
                                    toggleModal(true)
                                }
                            }}
                        >
                            {
                                data?.base_salary?.list_slot_done_without_memo
                                    ?.length
                            }
                        </a>
                    </div>
                    <div></div>
                </div>

                <div className={cn(styles.tableItem)}>
                    <div>2</div>
                    <div>
                        <p>Slot student absent</p>
                    </div>
                    <div>
                        {`
                        [ Quantity ] *
                        [ Salary Per Slot (${toReadablePrice(
                            data?.salary_slot
                        )} ${data?.currency})] * ${
                            data?.percent_salary_student_absent
                        }%
                        `}
                    </div>
                    <div>
                        <a
                            className='text-primary'
                            onClick={() => {
                                if (
                                    data?.base_salary?.list_slot_student_absent
                                        ?.length
                                ) {
                                    setSelectedData(
                                        data?.base_salary
                                            ?.list_slot_student_absent
                                    )
                                    toggleModal(true)
                                }
                            }}
                        >
                            {
                                data?.base_salary?.list_slot_student_absent
                                    ?.length
                            }
                        </a>
                    </div>
                    <div>
                        <span>
                            {`${toReadablePrice(
                                data?.base_salary
                                    ?.total_salary_slot_student_absent
                            )} ${data?.currency}`}
                        </span>
                    </div>
                </div>

                <div className={cn(styles.tableItem)}>
                    <div>
                        <span>3</span>
                    </div>
                    <div>
                        <p>Bonus</p>
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                        <span>
                            {`${toReadablePrice(data?.bonus?.total_bonus)} ${
                                data?.currency
                            }`}
                        </span>
                    </div>
                </div>
                <div className={cn(styles.tableItem)}>
                    <div>4</div>
                    <div>
                        <p>Fine</p>
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                        <span>
                            {`${toReadablePrice(data?.punish?.total_punish)} ${
                                data?.currency
                            }`}
                        </span>
                    </div>
                </div>
                <div className={cn(styles.tableItem, styles.totalSalary)}>
                    <div></div>
                    <div>
                        <p>Total salary</p>
                    </div>
                    <div>
                        <span>[1] + [2] + [3] - [4]</span>
                    </div>
                    <div></div>
                    <div>
                        <span>
                            {`${toReadablePrice(data?.total_salary)} ${
                                data?.currency
                            }`}
                        </span>
                    </div>
                </div>
            </div>
            <ModalDetail
                toggleModal={toggleModal}
                visible={visibleModal}
                data={selectedData}
            ></ModalDetail>
        </div>
    )
}

export default ContentPaneLeft
