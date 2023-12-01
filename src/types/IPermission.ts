export interface IPermission {
    id: number
    name: string
    description: string
    groupModule: string
    codeGroupModule: string
    codePermission?: string
    createdAt?: number
}
