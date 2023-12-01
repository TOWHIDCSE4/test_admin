import TeacherLevelAPI from 'api/TeacherLevelAPI'
import { useQuery } from 'react-query'
import { ITeacherLevel } from 'types'

export const useTeacherLevels = (query?: {
    page_size: number
    page_number: number
}) => {
    const { isLoading, data, error, isFetching } = useQuery(
        ['useTeacherLevels', query],
        () => TeacherLevelAPI.getTeacherLevels(query),
        {
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    )

    return {
        isLoading,
        data: (data?.data as ITeacherLevel[]) || [],
        error,
        isFetching,
        total: data?.pagination?.total || 0
    }
}
