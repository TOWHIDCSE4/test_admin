import LocationAPI from 'api/LocationAPI'
import { useQuery } from 'react-query'
import { ILocation } from 'types'

export const useLocations = (query?: {
    page_size: number
    page_number: number
}) => {
    const { isLoading, data, error, isFetching } = useQuery(
        ['useLocations', query],
        () => LocationAPI.getLocations(query),
        {
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    )

    return {
        isLoading,
        data: (data && (data?.data as ILocation[])) || [],
        error,
        isFetching,
        total: (data && data?.pagination?.total) || 0
    }
}
