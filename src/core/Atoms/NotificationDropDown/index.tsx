/* eslint-disable @typescript-eslint/no-use-before-define */
import { FC, memo, useRef } from 'react'
import { INotification } from 'types'
import cn from 'classnames'
import { Spin, Empty } from 'antd'
import useInfiniteScroll from 'hooks/useInfiniteScroll'
import NotificationItem from '../NotificationItem'
import styles from './NotificationDropDown.module.scss'
import { Link } from 'react-router-dom'

type Props = {
    data: INotification[]
    unseen: number
    loadMore: () => void
    loading: boolean
    shownMore?: boolean
    onShownMore?: () => void
}

const NotificationDropDown: FC<Props> = ({
    data,
    unseen,
    loadMore,
    loading,
    shownMore = false,
    onShownMore
}) => {
    const wrapperRef = useRef(null)
    const fetchMoreListItems = () => {
        setTimeout(() => {
            loadMore()
            setIsFetching(false)
        }, 500)
    }
    const [isFetching, setIsFetching] = useInfiniteScroll(
        wrapperRef,
        fetchMoreListItems
    )

    const renderNotiItem = () => {
        if (data.length > 0) {
            return data.map((item, index) => (
                <NotificationItem data={item} key={item._id} />
            ))
        }
        return <Empty />
    }

    const handleShowMore = () => {
        if (onShownMore) onShownMore()
    }
    return (
        <>
            <div
                className='dropdown-menu dropdown-menu-lg dropdown-menu-right py-0 show'
                aria-labelledby='alertsDropdown'
            >
                <div className='dropdown-menu-header d-flex'>
                    {`${unseen} New Notifications`}
                    <Link className='ml-auto' to='/nm/notifications'>
                        View
                    </Link>
                </div>
                <div
                    className={cn('list-group', styles.ListGroup)}
                    ref={wrapperRef}
                >
                    {renderNotiItem()}
                    {loading && <Spin spinning={loading} />}
                </div>
                {shownMore && (
                    <div className='dropdown-menu-footer'>
                        <a
                            className='text-muted'
                            onClick={() => handleShowMore()}
                        >
                            Show more
                        </a>
                    </div>
                )}
            </div>
        </>
    )
}

export default memo(NotificationDropDown)
