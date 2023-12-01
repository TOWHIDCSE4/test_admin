/* eslint-disable import/no-mutable-exports */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { io } from 'socket.io-client'
import * as store from 'utils/storage'

const SOCKET_API = process.env.REACT_APP_SOCKET_API_URL

enum SOCKET_EVENT {
    NEW_NOTIFICATION_EVENT = 'NEW_NOTIFICATION_EVENT',
    SUBSCRIBE_NOTIFICATION_EVENT = 'SUBSCRIBE_NOTIFICATION_EVENT',
    UN_SUBSCRIBE_NOTIFICATION_EVENT = 'UN_SUBSCRIBE_NOTIFICATION_EVENT'
}

let socket = null

export const subscribeNotificationChanges = ({ user_id, onUpdateChanges }) => {
    const userId = user_id || store.get('user')?._id
    if (socket) {
        console.log('subscribeNotificationChanges: ', socket.id)
        // unSubscribeNotificationChanges({ user_id: userId })
        socket.on(SOCKET_EVENT.NEW_NOTIFICATION_EVENT, onUpdateChanges)
        socket.emit(SOCKET_EVENT.SUBSCRIBE_NOTIFICATION_EVENT, userId)
    }
    // else {
    // retry(subscribeNotificationChanges, {
    //     user_id: userId,
    //     onUpdateChanges
    // })
    // }
}

export const unSubscribeNotificationChanges = ({
    user_id,
    onUpdateChanges
}) => {
    const userId = user_id || store.get('user')?._id
    if (socket) {
        console.log('unSubscribeNotificationChanges: ', socket.id)
        if (onUpdateChanges) {
            socket.off(SOCKET_EVENT.NEW_NOTIFICATION_EVENT, onUpdateChanges)
        } else {
            socket.off(SOCKET_EVENT.NEW_NOTIFICATION_EVENT)
        }
        // comment out dòng dưới vì nó thực hiện xóa socket hiện tại khỏi nhóm user_id trên server, dẫn đến serer k gửi noti đến client này nữa
        // socket.emit(SOCKET_EVENT.UN_SUBSCRIBE_NOTIFICATION_EVENT, userId)
    }
}

export const connect = (successCallback) => {
    if (socket) {
        if (socket.connected) {
            if (successCallback) successCallback()
        }
        return
    }
    const serverUrl: any = SOCKET_API
    const access_token = store.get('access_token')
    const query: any = { access_token }
    socket = io(serverUrl, {
        query
        // withCredentials: true
    })

    socket.on('connect', () => {
        // socket = _socket
        console.log('connected: ', socket.id)
        if (successCallback) successCallback()
    })
}

export const disconnect = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

const retry = (func, params) => {
    const onConnected = () => {
        func(params)
    }
    connect(onConnected)
    // setTimeout(func, 1000, params);
}

export default socket
