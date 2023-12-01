import axios from 'axios'

export const API_HOST = `${process.env.REACT_APP_CMS_API_URL}/cms`
// export const API_HOST = 'http://localhost:8080'

export const create_page = async (name) => {
    try {
        const response = await axios.post(`${API_HOST}/pages/`, { name })
        return { status: 200, data: response.data }
    } catch (error) {
        console.log('error :>> ', error)
        return { status: 405, data: error }
    }
}
