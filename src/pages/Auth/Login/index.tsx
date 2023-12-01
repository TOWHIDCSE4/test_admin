import React, { useState, FunctionComponent } from 'react'
import { notify } from 'utils/notify'
import { useAuth } from 'contexts/Authenticate'
import { Alert, Image, Button } from 'antd'

const Login: FunctionComponent = () => {
    const { login, isLoading, error } = useAuth()

    const [values, setValues] = useState({ username: '', password: '' })

    const onChangeForm = (key) => (e) => {
        const { value } = e.target
        setValues({ ...values, [key]: value })
    }
    const handleLogin = async (e) => {
        e.preventDefault()
        if (values.username && values.password) {
            await login(values.username, values.password)
        } else {
            notify('error', 'Please fill information')
        }
    }
    return (
        <div className='container d-flex flex-column'>
            <div className='row h-100'>
                <div className='col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100'>
                    <div className='d-table-cell align-middle'>
                        <div className='text-center mt-5 mb-5'>
                            <Image src='englishplus.png' preview={false} />
                            <h1 className='h2'>Login as Administrator</h1>
                        </div>
                        <div className='card'>
                            <div className='card-body'>
                                <div className='m-sm-4'>
                                    {error && (
                                        <Alert
                                            message='Error'
                                            description={error}
                                            type='error'
                                            showIcon
                                            style={{ marginBottom: '1rem' }}
                                        />
                                    )}
                                    <form>
                                        <div className='form-group'>
                                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                            <label htmlFor='username1'>
                                                Username
                                            </label>
                                            <input
                                                className='form-control form-control-lg'
                                                type='text'
                                                name='username'
                                                onChange={onChangeForm(
                                                    'username'
                                                )}
                                                value={values.username}
                                                placeholder='Username'
                                            />
                                        </div>
                                        <div className='form-group'>
                                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                            <label htmlFor='password1'>
                                                Password
                                            </label>
                                            <input
                                                className='form-control form-control-lg'
                                                type='password'
                                                onChange={onChangeForm(
                                                    'password'
                                                )}
                                                value={values.password}
                                                name='password'
                                                placeholder='Password'
                                            />
                                        </div>
                                        <div className='pull-right mt-3'>
                                            <Button
                                                className='btn btn-primary pl-3 pr-3'
                                                type='primary'
                                                onClick={handleLogin}
                                                htmlType='submit'
                                                loading={isLoading}
                                            >
                                                Login
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
