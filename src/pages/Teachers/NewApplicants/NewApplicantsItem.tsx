/* eslint-disable react/button-has-type */
import React from 'react'

const NewApplicantsItem = ({ ...props }) => {
    const { item } = props
    return (
        <tr role='row' className='odd' key={props.index}>
            <td>{props.index}</td>
            <td>GILBERT C. CAPORAL</td>
            <td>teacher@gmail.com</td>
            <td>0989444555</td>
            <td>live:ispeak</td>
            <td>
                <a href='#'>CV</a>
            </td>
            <td />
            <td>02/04/2020</td>
            <td>
                <span className='badge badge-warning'>New Applied</span>
            </td>
            <td className='table-action'>
                <button className='btn btn-primary'>Update Status</button>
            </td>
        </tr>
    )
}

export default NewApplicantsItem
