import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useMemo,
    FunctionComponent
} from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import * as store from 'utils/storage'
import AuthAPI from 'api/AuthAPI'
import _ from 'lodash'

const AuthContext = createContext<{
    user: any
    isLoading: boolean
    error: any
    login: (username: string, password: string) => void
    logout: () => void
}>({
    user: {},
    isLoading: false,
    error: '',
    login: null,
    logout: null
})

export const AuthProvider: FunctionComponent = ({ children }) => {
    const history = useHistory()

    const location = useLocation()

    const [user, setUser] = useState({})
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (error) setError(null)
    }, [location.pathname])

    const logout = () => {
        store.clearAll()
        setUser(null)
        history.push('/login')
        window.location.reload()
    }

    const getUser = () => {
        const userStore = store.get('user')
        if (userStore) {
            setUser(userStore)
        } else {
            setUser(null)
        }
    }
    useEffect(() => {
        getUser()
    }, [])

    const login = async (username, password) => {
        try {
            setLoading(true)
            const response = await AuthAPI.login({
                username,
                password
            })
            if (response && response.access_token) {
                const newUser = {
                    ...response.user
                }
                if (_.isEmpty(newUser.permissions))
                    throw new Error("You don't have permission to access")
                store.set('access_token', response.access_token)
                store.set('user', newUser)
                setUser(newUser)
                setLoading(false)
                history.push('/')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            // veryToken()
        }
    }

    const memoedValue = useMemo(
        () => ({
            user,
            isLoading,
            error,
            login,
            logout
        }),
        [user, isLoading, error]
    )

    return (
        <AuthContext.Provider value={memoedValue}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
