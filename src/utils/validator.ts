export const phoneNumberValidator = (phoneNumber: number) =>
    `${phoneNumber}`.match(/^0[0-9]{9,14}$/)
