import React, { useEffect, useReducer, useRef } from 'react'

const Categories = ({ ...props }) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false
        }
    )

    return (
        <div className='row'>
            <div className='col-12 col-xl-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h5 className='card-title'>Coming Soon</h5>
                    </div>
                    <div className='card-body' />
                </div>
            </div>
        </div>
    )
}

export default Categories
