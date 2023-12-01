import StudentAPI from 'api/StudentAPI'
import { useQuery } from 'react-query'

export const useRegularStudents = (query: {
    page_size?: number
    page_number?: number
    q?: string
}) => {
    const { isLoading, data, error, isFetching } = useQuery(
        ['useCoursesByPackageId', query],
        () => StudentAPI.getRegularStudents(query),
        { refetchOnReconnect: false }
    )

    return {
        isLoading,
        data,
        error,
        isFetching
    }
}
