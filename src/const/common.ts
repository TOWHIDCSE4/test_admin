export const PAGINATION_CONFIG = {
    bordered: true,
    scroll: {
        x: 500,
        y: 768
    },
    sticky: true
}

export const TEACHER_ALLOWED_ABSENCE_CLASS = 4

export interface IModalProps {
    visible: boolean
    toggleModal: (visible: boolean) => void
}

export const encodeFilenameFromLink = (link) => {
    if (!link) {
        return null
    }

    const fileName = encodeURIComponent(`${link}`.split('/').pop())
    const path = link.substring(0, link.lastIndexOf('/') + 1)
    return path + fileName
}

export const IELTS_TEACHER_FAKE_ID = -99

// export enum EnumLearningMediumType {
//     HMP = 1, // Hamia Meet Plus
//     SKYPE = 2
// }
