import axios, { AxiosResponse, AxiosError } from 'axios'
import { ERROR_REPORT_TYPES } from 'const'
import * as store from 'utils/storage'

export default class handleNotifyError {
    public static getInfoErrorPushNotifyChatwork(
        error: AxiosError,
        type: number
    ): any {
        try {
            let messageNotify = null
            const auth_token = store.get('access_token')
            let messageError = null
            if (type === ERROR_REPORT_TYPES.SERVER) {
                messageError = `[Admin]\n Message error:  ${JSON.stringify(
                    error?.response?.data?.message
                )}\n`
            } else if (type === ERROR_REPORT_TYPES.NETWORK) {
                messageError = `[Admin]\n Message error:  ${error.message}\n`
            }
            if (auth_token !== undefined) {
                const token = error?.config?.headers?.authorization || null
                if (token) {
                    const base64Payload = token.split('.')[1]
                    const payloadBuffer = Buffer.from(base64Payload, 'base64')
                    const dataDecode = JSON.parse(payloadBuffer.toString())
                    if (type === ERROR_REPORT_TYPES.SERVER) {
                        const params =
                            JSON.stringify(error?.response?.config?.params) ||
                            ''
                        messageNotify = `${`${messageError} status: ${error?.response?.status}\n statusText: ${error?.response?.statusText}\n url: ${error?.response?.config?.url}\n base_url: ${error?.response?.config?.baseURL}\n params:${params}\n username: ${dataDecode.username}`}`
                    } else if (type === ERROR_REPORT_TYPES.NETWORK) {
                        const params =
                            JSON.stringify(error?.config?.params) || ''
                        messageNotify = `${`${messageError} url: ${error.config.url}\n base_url: ${error.config.baseURL}\n params:${params}\n username: ${dataDecode.username}`}`
                    }
                }
            } else if (!auth_token || auth_token === undefined) {
                if (type === ERROR_REPORT_TYPES.SERVER) {
                    const params =
                        JSON.stringify(error?.response?.config?.params) || ''
                    messageNotify = `${`${messageError} status: ${error?.response?.status}\nstatusText: ${error?.response?.statusText} \n url: ${error?.response?.config?.url}\n base_url: ${error?.response?.config?.baseURL}\n params:${params}`}`
                } else if (type === ERROR_REPORT_TYPES.NETWORK) {
                    const params = JSON.stringify(error?.config?.params) || ''
                    messageNotify = `${`${messageError} url: ${error?.config?.url}\n base_url: ${error?.config?.baseURL}\n params:${params}`}`
                }
            }
            if (messageNotify) {
                // this.errorPushNotifyChatwork(messageNotify)
            }
            // eslint-disable-next-line @typescript-eslint/no-shadow
        } catch (error: any) {
            console.log(error)
        }
    }

    // protected static async errorPushNotifyChatwork(
    //     messError: string
    // ): Promise<any> {
    //     const room_id = null
    //     const xhr = new XMLHttpRequest()
    //     const url = ''
    //     xhr.open('POST', url, true)
    //     xhr.setRequestHeader('Content-Type', 'application/json')
    //     xhr.onreadystatechange = function () {
    //         if (xhr.readyState === 4 && xhr.status === 200) {
    //             const res = this.responseText
    //         }
    //     }
    //     const data = JSON.stringify({ roomId: room_id, message: messError })
    //     xhr.send(data)
    // }
}
