import store from 'store'

const NAME_SPACE = 'ispeak.'

export const get = (key) => {
    const realKey = NAME_SPACE + key

    return store.get(realKey)
}

export const set = (key, data) => {
    const realKey = NAME_SPACE + key
    return store.set(realKey, data)
}

export const clear = (key) => {
    const realKey = NAME_SPACE + key

    return store.remove(realKey)
}

export const clearAll = () => {
    store.clearAll()
}
