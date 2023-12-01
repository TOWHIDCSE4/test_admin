import React from 'react'
import defaultUser from 'assets/images/default-user.png'

const StudyingStudentItem = ({ ...props }) => {
    const { item } = props
    return (
        <tr role='row' className='odd' key={props.index}>
            <td>
                <img
                    className='image-cropper'
                    src={item.avatar ? item.avatar : defaultUser}
                    alt='ian100_210419080108'
                />
            </td>
            <td>{`${item.full_name} - ${item.username}`}</td>
            <td>16:30</td>
            <td>{item.email}</td>
            <td>{item.phone_number}</td>

            <td>
                {item.communicate_tools && item.communicate_tools[0]
                    ? item.communicate_tools[0].account
                    : null}
            </td>

            <td className='table-action' />
        </tr>
    )
}

export default StudyingStudentItem
