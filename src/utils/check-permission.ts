export const checkPermission = (permisstion: string) => {
    const user = JSON.parse(localStorage.getItem('ispeak.user'))
    if (user) {
        const permisstions = user.permissions
        if (permisstions && permisstions.includes(permisstion)) {
            return true
        }
    }
    return false
}
