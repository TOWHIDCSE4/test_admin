import React, { FC, useState } from 'react'
import cn from 'classnames'
import { toReadablePrice } from 'utils'
import styles from './TabParameter.module.scss'
import ContentSalary from './ContentSalary/index'
import ContentBonus from './ContentBonus'
import ContentPunish from './ContentPunish'
import { Tabs } from 'antd'
import moment from 'moment'

type Props = {
    data: any
}

const TabParameter = ({ data }: Props) => {
    return (
        <div className={cn(styles.wrapTab)}>
            <h4 className='text-danger'>
                Last Update:{' '}
                {data?.updated_time &&
                    moment(new Date(data?.updated_time).getTime()).format(
                        'HH:mm:ss DD/MM/YYYY'
                    )}
            </h4>
            <Tabs>
                <Tabs.TabPane
                    tab={`Calculated Wage ${toReadablePrice(
                        data?.total_salary
                    )} ${data?.currency}`}
                    key='item-1'
                >
                    <ContentSalary data={data} />
                </Tabs.TabPane>

                <Tabs.TabPane
                    tab={`Bonus ${toReadablePrice(data?.bonus?.total_bonus)} ${
                        data?.currency
                    }`}
                    key='item-2'
                >
                    <ContentBonus data={data} />
                </Tabs.TabPane>

                <Tabs.TabPane
                    tab={`Fine ${toReadablePrice(data?.punish?.total_punish)} ${
                        data?.currency
                    }`}
                    key='item-3'
                >
                    <ContentPunish data={data} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
}

export default TabParameter
