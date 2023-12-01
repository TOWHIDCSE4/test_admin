import React, { lazy } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from 'contexts/Authenticate'
import { Result, Spin } from 'antd'
import _ from 'lodash'

const renderMergedProps = (component, ...rest) =>
    React.createElement(component, Object.assign({}, ...rest))

export const RRoute = ({ component, title, ...rest }) => {
    if (title) document.title = title
    return (
        <Route
            {...rest}
            render={(routeProps) =>
                renderMergedProps(component, routeProps, rest)
            }
        />
    )
}

export function AsyncRoute({ importPath, ...props }) {
    return <Route {...props} component={lazy(importPath)} />
}

export function AuthenticatedRoute(props) {
    const { user, isLoading } = useAuth()
    if (!user) return <Redirect to='/login' />
    if (isLoading) return <Spin spinning={isLoading} />
    if (!props.required || user?.permissions.includes(props?.required))
        return <AsyncRoute {...props} />

    return (
        <Result
            status='403'
            title='403'
            subTitle='Sorry, you are not authorized to access this page.'
        />
    )
}
