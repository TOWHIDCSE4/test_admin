export const POINT_VND_RATE = 100

export enum EnumTransactionType {
    IN = 0,
    OUT = 1
}

export enum EnumTransactionStatus {
    FAILED = 0,
    DONE = 1,
    PROCESSING = 2
}

export enum EnumWalletHistoryType {
    DEPOSIT = 0,
    WITHDRAW = 1
}
export enum EnumWalletHistoryStatus {
    FAILED = 0,
    DONE = 1,
    PROCESSING = 2,
    PENDING = 3,
    CANCEL = 4,
    REJECTED = 5
}

export const OrderSource = {
    BANK: 'BANK',
    VISA: 'VISA',
    CC_APPOTAPAY: 'CC_APPOTAPAY',
    ATM_APPOTAPAY: 'ATM_APPOTAPAY',
    BANK_APPOTAPAY: 'BANK_APPOTAPAY',
    EWALLET_APPOTAPAY: 'EWALLET_APPOTAPAY'
}
