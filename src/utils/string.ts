import { EnumScoreClassification } from 'const'
import sanitizeHtml from 'sanitize-html'

export const createSlugsName = (name: string) => {
    if (typeof name !== 'string') return ''
    name = name
        .replace(
            /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,
            ' '
        )
        .replace(/\s\s+/g, ' ')
    name = name.trim()
    let splitted = name.split(' ')
    splitted = splitted.map((s) => {
        let str = s
        str = str.toLowerCase()
        str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        str = str.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        str = str.replace(/[ìíịỉĩ]/g, 'i')
        str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        str = str.replace(/[ùúụủũưừứựửữ]/g, 'u')
        str = str.replace(/[ỳýỵỷỹ]/g, 'y')
        str = str.replace(/đ/g, 'd')
        str = str.replace(
            /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,
            ''
        )
        return str.toUpperCase()
    })
    return splitted.join('-').toLowerCase()
}

export function calculateClassification(score: number) {
    if (score < EnumScoreClassification.POOR) {
        return 'Poor'
    }
    if (score < EnumScoreClassification.AVERAGE) {
        return 'Average'
    }
    if (score < EnumScoreClassification.GOOD) {
        return 'Good'
    }
    if (score < EnumScoreClassification.VERY_GOOD) {
        return 'Very good'
    }
    return 'Excellent'
}

export function urlToFileName(url: string) {
    if (!url) return ''
    return url.slice(url.lastIndexOf('/') + 1)
}

export function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
        allowedSchemes: [...sanitizeHtml.defaults.allowedSchemes, 'data']
    })
}
