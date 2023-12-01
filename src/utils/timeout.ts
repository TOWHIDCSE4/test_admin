export const delay = (after) =>
    new Promise((resolve) => {
        setTimeout(resolve, after)
    })

export const interval = async (func, delayTime) => {
    await func()
    await delay(delayTime)
    await interval(func, delayTime)
}
