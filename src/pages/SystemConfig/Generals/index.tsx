import React, { useEffect, useReducer, useRef } from 'react'
import General from './components/General'
import TrialTest from './components/TrialTest'

const Generals = ({ ...props }) => (
    <div className='card'>
        <div className='card-header'>
            <h5 className='card-title'>Settings</h5>
        </div>
        <div className='card-body'>
            <div className='col-12'>
                <div className='tab'>
                    <ul className='nav nav-tabs' role='tablist'>
                        <li className='nav-item'>
                            <a
                                className='nav-link active'
                                href='#tab-1'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='true'
                            >
                                General
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-2'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Trial Test
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-3'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Teacher
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-4'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Student
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-5'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Ads
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-6'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Other
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a
                                className='nav-link'
                                href='#tab-7'
                                data-toggle='tab'
                                role='tab'
                                aria-selected='false'
                            >
                                Target
                            </a>
                        </li>
                    </ul>
                    <div className='tab-content'>
                        <div
                            className='tab-pane active'
                            id='tab-1'
                            role='tabpanel'
                        >
                            <General />
                        </div>
                        <div className='tab-pane' id='tab-2' role='tabpanel'>
                            <TrialTest />
                        </div>
                        <div className='tab-pane' id='tab-3' role='tabpanel'>
                            <h4 className='tab-title'>One more</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetuer
                                adipiscing elit. Aenean commodo ligula eget
                                dolor tellus eget condimentum rhoncus. Aenean
                                massa. Cum sociis natoque penatibus et magnis
                                neque dis parturient montes, nascetur ridiculus
                                mus.
                            </p>
                            <p>
                                Donec quam felis, ultricies nec, pellentesque
                                eu, pretium quis, sem. Nulla consequat massa
                                quis enim. Donec pede justo, fringilla vel,
                                aliquet nec, vulputate eget, arcu. In enim
                                justo, rhoncus ut, imperdiet a, venenatis vitae,
                                justo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default Generals
