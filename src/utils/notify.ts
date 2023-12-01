import { notification } from 'antd'
import _ from 'lodash'

export const notify = (type, message) =>
    notification[type]({
        message: _.capitalize(type),
        description: message
    })
