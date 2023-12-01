import { useEffect, useCallback, FC, useState } from 'react'
import { Table, Card, Tag } from 'antd'
import CronJobsAPI from 'api/CronJobsAPI'
import _ from 'lodash'
import { notify } from 'utils/notify'
import { IScheduledJobs, ScheduledJobsStatus } from 'types/IScheduledJobs'

const TeacherLevel: FC = () => {
    const [loading, setLoading] = useState(false)
    const [scheduledJobs, setScheduledJobs] = useState<IScheduledJobs[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)

    const getAllCronJobs = (query: {
        page_size?: number
        page_number?: number
    }) => {
        setLoading(true)
        CronJobsAPI.getScheduledJobs(query)
            .then((res) => {
                setScheduledJobs(res.data)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getAllCronJobs({
            page_size: pageSize,
            page_number: pageNumber
        })
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getAllCronJobs({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getAllCronJobs({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const columns = [
        {
            title: 'Scheduled Time',
            dataIndex: 'scheduled_time',
            key: 'scheduled_time'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text) => {
                if (text === ScheduledJobsStatus.STARTED)
                    return <Tag color='success'>STARTED</Tag>
                return <Tag color='error'>STOPPED</Tag>
            }
        }
    ]

    return (
        <Card title='Cron Jobs Management'>
            <Table
                bordered
                dataSource={scheduledJobs}
                columns={columns}
                loading={loading}
                pagination={{
                    defaultCurrent: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record) => record?._id}
                scroll={{
                    x: 500
                }}
            />
        </Card>
    )
}

export default TeacherLevel
