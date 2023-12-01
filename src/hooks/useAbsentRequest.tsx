import AbsentRequestAPI from 'api/AbsentRequestAPI'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { EnumTeacherAbsentRequestStatus, IAbsentRequest } from 'types'

export const useAbsentRequest = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [pageSize, setPageSize] = useState<number>(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [status, setStatus] = useState(EnumTeacherAbsentRequestStatus.PENDING)
    const [search, setSearch] = useState(queryUrl.get('teacher_name') || null)
    const [staff_id, setStaffId] = useState(null)
    const [date, setDate] = useState(null)
    console.log(queryUrl.get('teacher_name'))
    const query = {
        page_size: pageSize,
        page_number: pageNumber,
        status,
        search,
        staff_id,
        date
    }

    const { isLoading, data, error, isFetching, refetch } = useQuery(
        ['useAbsentRequest', query],
        () => AbsentRequestAPI.getAbsentRequests(query),
        {
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    )

    return {
        isLoading,
        data: (data?.data as IAbsentRequest[]) || [],
        error: error as any,
        isFetching,
        total: data?.pagination?.total || 0,
        refetch,
        pageSize,
        setPageSize,
        pageNumber,
        setPageNumber,
        status,
        setStatus,
        search,
        setSearch,
        staff_id,
        setStaffId,
        setDate
    }
}
