/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/heading-has-content */
import React, { useEffect, useReducer, useRef } from 'react'

const Teacher = ({ ...props }) => (
    <>
        <div className='card'>
            <div className='card-header'>
                <h5 className='card-title'>Trial Test Configurations</h5>
                <h6 className='card-subtitle text-muted' />
            </div>
            <div className='card-body'>
                <form>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Children Trial Test
                        </label>
                        <div className='col-sm-10'>
                            <select className='custom-select mb-3'>
                                <option>
                                    Placement Test (Children 6-10 year old)
                                </option>
                                <option>Use of English - Part 2</option>
                                <option>Use of English - Part 1</option>
                                <option>Level test</option>
                                <option>Use of English - Part 3</option>
                                <option>READING COMPREHENSION TEST 1</option>
                                <option>READING COMPREHENSION TEST 2</option>
                                <option>READING COMPREHENSION TEST 3</option>
                                <option>READING COMPREHENSION TEST 4</option>
                                <option>READING COMPREHENSION TEST 5</option>
                                <option>READING COMPREHENSION TEST 6</option>
                                <option>READING COMPREHENSION TEST 7</option>
                                <option>READING COMPREHENSION TEST 8</option>
                                <option>READING COMPREHENSION TEST 9</option>
                                <option>READING COMPREHENSION TEST 10</option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 1
                                </option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 1
                                </option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 3
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Adult Trial Test
                        </label>
                        <div className='col-sm-10'>
                            <select className='custom-select mb-3'>
                                <option>Placement Test (Adult)</option>
                                <option>Use of English - Part 2</option>
                                <option>Use of English - Part 1</option>
                                <option>Level test</option>
                                <option>Use of English - Part 3</option>
                                <option>READING COMPREHENSION TEST 1</option>
                                <option>READING COMPREHENSION TEST 2</option>
                                <option>READING COMPREHENSION TEST 3</option>
                                <option>READING COMPREHENSION TEST 4</option>
                                <option>READING COMPREHENSION TEST 5</option>
                                <option>READING COMPREHENSION TEST 6</option>
                                <option>READING COMPREHENSION TEST 7</option>
                                <option>READING COMPREHENSION TEST 8</option>
                                <option>READING COMPREHENSION TEST 9</option>
                                <option>READING COMPREHENSION TEST 10</option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 1
                                </option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 1
                                </option>
                                <option>
                                    TOEIC READING - NEW FORMAT - TEST 3
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Receiver's Skype Id
                        </label>
                        <div className='col-sm-10'>
                            <textarea
                                className='form-control'
                                placeholder='live:ispeak.demo01_1'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-sm-10 ml-sm-auto'>
                            <button type='submit' className='btn btn-primary'>
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>
)

export default Teacher
