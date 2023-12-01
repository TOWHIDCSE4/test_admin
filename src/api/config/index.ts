import axios, { AxiosResponse, AxiosError } from 'axios'
import * as store from 'utils/storage'
import { ROUTE_ALIAS } from 'const'
import _ from 'lodash'
import { ERROR_REPORT_TYPES } from 'const/status'
import handleNotifyError from 'core/Atoms/notificationError'
import { notify } from 'utils/notify'

const queryString = require('query-string')

axios.defaults.headers.common.Accept = 'application/json'

const getApiRoot = (route) => {
    let API_ROOT = ''
    _.forIn(ROUTE_ALIAS, function (value, key) {
        if (route.indexOf(key) !== -1) API_ROOT = value
    })
    return API_ROOT
}

export default class ApiSender {
    protected static handleResponse(res: AxiosResponse): any {
        if (res.status === 200 && res.data.code === '10000')
            return res.data.data
        throw new Error(res.data.message)
    }

    protected static handleError(error: AxiosError): any {
        const server_current: any = process.env.REACT_APP_SERVER_NAME
        if (error?.response?.status === 401) {
            localStorage.clear()
            location.assign('/login')
            return
        }
        if (error?.response?.status === 403) {
            notify(
                'error',
                'Bạn không có quyền truy cập tính năng này, vui lòng đăng nhập lại hoặc liên hệ quản trị viên'
            )
            return
        }
        if (error.response) {
            // if (server_current === 'production') {
            //     handleNotifyError.getInfoErrorPushNotifyChatwork(
            //         error,
            //         ERROR_REPORT_TYPES.SERVER
            //     )
            // }
            throw new Error(error.response.data.message)
        } else {
            // if (server_current === 'production') {
            //     handleNotifyError.getInfoErrorPushNotifyChatwork(
            //         error,
            //         ERROR_REPORT_TYPES.NETWORK
            //     )
            // }
            throw new Error(error.message)
        }
    }

    public static async get(url, params = {}): Promise<any> {
        const API_ROOT = getApiRoot(url)
        axios.defaults.baseURL = API_ROOT
        const AUTH_TOKEN = store.get('access_token')
        axios.defaults.headers.common.authorization = AUTH_TOKEN
        return axios
            .get(url, {
                params,
                paramsSerializer(_params) {
                    return queryString.stringify(_params, {
                        skipNull: true,
                        skipEmptyString: true
                    })
                }
            })
            .then(this.handleResponse)
            .catch(this.handleError)
    }

    public static post(url, data = {}) {
        const API_ROOT = getApiRoot(url)
        axios.defaults.baseURL = API_ROOT
        const AUTH_TOKEN = store.get('access_token')
        axios.defaults.headers.common.authorization = AUTH_TOKEN
        return axios
            .post(url, data)
            .then(this.handleResponse)
            .catch(this.handleError)
    }

    public static put(url, data = {}) {
        const API_ROOT = getApiRoot(url)
        axios.defaults.baseURL = API_ROOT
        const AUTH_TOKEN = store.get('access_token')
        axios.defaults.headers.common.authorization = AUTH_TOKEN
        return axios
            .put(url, data)
            .then(this.handleResponse)
            .catch(this.handleError)
    }

    public static patch(url, data = {}) {
        const API_ROOT = getApiRoot(url)
        axios.defaults.baseURL = API_ROOT
        const AUTH_TOKEN = store.get('access_token')
        axios.defaults.headers.common.authorization = AUTH_TOKEN
        return axios
            .patch(url, data)
            .then(this.handleResponse)
            .catch(this.handleError)
    }

    public static delete(url, config?) {
        const API_ROOT = getApiRoot(url)
        axios.defaults.baseURL = API_ROOT
        const AUTH_TOKEN = store.get('access_token')
        axios.defaults.headers.common.authorization = AUTH_TOKEN
        return axios
            .delete(url, config)
            .then(this.handleResponse)
            .catch(this.handleError)
    }
}
