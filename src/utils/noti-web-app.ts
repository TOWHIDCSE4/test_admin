const sign = require('jwt-encode')

const keyJWT = process.env.REACT_APP_HAMIA_NOTI_KEY || 'key_jwt'
const hamiaNotiDomain =
    process.env.REACT_APP_HAMIA_NOTI_URL || 'https://noti.hamia.online/'
const source = process.env.REACT_APP_HAMIA_SOURCE || 'english_plus'

const getToken = (data) => {
    const jwt = sign(data, keyJWT)
    return jwt
}

export const buildUrl = (data) => {
    data.source = source
    const token = getToken(data)
    return `${hamiaNotiDomain}?token=${token}`
}
