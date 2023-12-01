import { useState, useEffect } from 'react'

const useInfiniteScroll = (ref: any, callback: any) => {
    const [isFetching, setIsFetching] = useState(false)

    const handleScroll = (event) => {
        if (
            event?.target.scrollTop + event?.target.clientHeight + 50 >=
            event?.target.scrollHeight
        ) {
            setIsFetching(true)
        }
    }

    useEffect(() => {
        ref?.current?.addEventListener('scroll', handleScroll)
        return () => ref?.current?.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (!isFetching) return
        callback()
    }, [isFetching])
    return [isFetching, setIsFetching] as const
}

export default useInfiniteScroll
