import _ from 'lodash'
import { Link } from 'react-router-dom'

interface filterOption {
    data: any
    type: string
}

export default function NameTeacherStudent({ data, type }: filterOption) {
    return type === 'teacher' ? (
        <Link to={`/teachers/all?search=${data?.username}`}>
            {data && `${data.full_name} - ${data.username}`}
        </Link>
    ) : (
        <Link to={`/students/all?search=${data?.username}`}>
            {data && `${data.full_name} - ${data.username}`}
        </Link>
    )
}
