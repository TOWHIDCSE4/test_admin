/* eslint-disable react/button-has-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useReducer, useRef } from 'react'
import Table from 'core/Atoms/Table'
import StudentAPI from 'api/StudentAPI'
import { notify } from 'utils/notify'
import StudyingStudentItem from './StudyingStudentItem'

const StudyingStudents = ({ ...props }) => {
    const _childCreateModal = useRef()
    const _childEditModal = useRef()
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            students: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: 'active'
        }
    )

    useEffect(() => {
        _getAllStudents({ ...values })
    }, [])

    const onReload = (should) => {
        if (should) {
            _getAllStudents({ ...values })
        }
    }

    const _getAllStudents = ({ page_size, page_number, status }) => {
        setValues({ isLoading: true })
        StudentAPI.getRegularStudents({ page_size, page_number, status })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ isLoading: false, students: res.data, total })
            })
            .catch((err) => {
                setValues({ isLoading: false })
                notify('error', err.message)
            })
    }

    const _handleGotoPage = (pageDestination) => {
        setValues({ page_number: pageDestination })
        _getAllStudents({ ...values, page_number: pageDestination })
    }

    const onChangeForm = (key) => (e) => {
        const value =
            e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setValues({ [key]: value })
    }

    const _handleFilter = (e) => {
        e.preventDefault()
        _getAllStudents({ ...values })
    }

    const openModal = () => {}

    const editModal = (item) => {}

    const onRemoveItem = (item) => {}

    return (
        <div className='card'>
            <div className='card-header'>
                <h5 className='card-title'>Studying Students Management</h5>
            </div>
            <div className='card-body'>
                <div
                    id='datatables-basic_wrapper'
                    className='dataTables_wrapper dt-bootstrap4 no-footer'
                >
                    <div className='row mb-4'>
                        <form
                            className='col-sm-12 col-md-3'
                            onSubmit={_handleFilter}
                        >
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Search...'
                                value={values.search}
                                onChange={onChangeForm('search')}
                                aria-controls='datatables-basic'
                            />
                        </form>
                        <div className='col-sm-12 col-md-1'>
                            <button
                                className='btn btn-primary'
                                onClick={_handleFilter}
                            >
                                <i className='fas fa-fw fa-filter mr-1' />
                                Filter
                            </button>
                        </div>
                        <div className='col-sm-12 col-md-2'>
                            <button
                                className='btn btn-primary'
                                onClick={openModal}
                            >
                                <i className='fas fa-fw fa-plus-circle mr-1' />
                                Export to CSV
                            </button>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-sm-12'>
                            <Table
                                items={values.students}
                                renderHeaderItems={() => (
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Study Time</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Skype</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                                renderBodyItems={(items) =>
                                    items.map((item, index) => (
                                        <StudyingStudentItem
                                            key={index}
                                            item={item}
                                            index={index}
                                            onEdit={editModal}
                                            onRemove={onRemoveItem}
                                        />
                                    ))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudyingStudents
