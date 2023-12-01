/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/heading-has-content */
import React, { useEffect, useReducer, useRef } from 'react'

const General = ({ ...props }) => (
    <>
        <div className='card'>
            <div className='card-header'>
                <h5 className='card-title'>Website information</h5>
                <h6 className='card-subtitle text-muted' />
            </div>
            <div className='card-body'>
                <form>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Site Name
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='iSpeak.vn'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Meta Title
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='iSpeak.vn - Gia sư tiếng Anh của bạn -- 1 thầy 1 trò, giáo viên bản ngữ'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Meta Description
                        </label>
                        <div className='col-sm-10'>
                            <textarea
                                className='form-control'
                                placeholder='iSpeak.vn - Gia sư tiếng Anh của bạn -- 1 thầy 1 trò, giáo viên bản ngữ'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Meta Keywords
                        </label>
                        <div className='col-sm-10'>
                            <textarea
                                className='form-control'
                                placeholder='Học tiếng Anh qua skype, gia sư tiếng Anh, tiếng Anh trực tuyến, học tiếng Anh một một'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Upload Logo
                        </label>
                        <div className='col-sm-10'>
                            <input type='file' />
                            <small className='form-text text-muted'>
                                Example block-level help text here.
                            </small>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div className='card'>
            <div className='card-header'>
                <h5 className='card-title'>Contacts info</h5>
                <h6 className='card-subtitle text-muted' />
            </div>
            <div className='card-body'>
                <form>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Company Name
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='CTy CP CÔNG NGHỆ VÀ ĐÀO TẠO TRỰC TUYẾN HAMIA'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Hotline
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='19002215'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Company address
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Tầng 4, Số 17 Thọ Tháp, Dịch Vọng, Cầu Giấy, Hà Nội'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Admin email
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='hannahtoni09@gmail.com'
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div className='card'>
            <div className='card-header'>
                <h5 className='card-title'>Social Networks</h5>
                <h6 className='card-subtitle text-muted' />
            </div>
            <div className='card-body'>
                <form>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Facebook Fanpage
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='https://facebook.com/ispeakvietnam'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Facebook
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='https://facebook.com/ispeakvietnam'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Twitter
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='https://twitter.com'
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-form-label col-sm-2 text-sm-right'>
                            Google+
                        </label>
                        <div className='col-sm-10'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='https://google.com'
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

export default General
