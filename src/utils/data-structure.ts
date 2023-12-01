/* eslint-disable no-restricted-syntax */
export function flatStructure(treeConfig: any, parent?: any) {
    if (Array.isArray(treeConfig) && treeConfig.length > 0) {
        let flatConfig = []

        for (const item of treeConfig) {
            if (Array.isArray(item.children) && item.children.length > 0) {
                flatConfig = flatConfig.concat(
                    flatStructure(item.children, item)
                )
            } else {
                if (parent) {
                    const cloneParent = { ...parent }
                    delete cloneParent.children
                    item.parent = cloneParent
                }
                flatConfig.push(item)
            }
        }

        return flatConfig
    }
    return []
}
