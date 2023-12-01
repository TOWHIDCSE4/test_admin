import React from 'react'
import classNames from 'classnames'

const Table = ({ ...props }) => {
    const { items, className } = props
    const tableClassName = classNames(
        'table',
        'table-striped',
        'table-hover',
        'table-border',
        className
    )
    return (
        <div className='table-responsive'>
            <table className={tableClassName}>
                <thead>{props.renderHeaderItems()}</thead>
                {items.length > 0 ? (
                    <tbody>{props.renderBodyItems(items)}</tbody>
                ) : (
                    <tbody>
                        <tr className='text-center'>
                            <td colSpan={12}>Không có dữ liệu</td>
                        </tr>
                    </tbody>
                )}
            </table>
        </div>
    )
}

export default Table
