/* eslint-disable radix */
import * as store from './storage'

export function toReadablePrice(price, divider = '.') {
    // const _price = parseInt(price || 0);
    // const reverseWords = _price.toString().split('').reverse();
    // return reverseWords.map((w, i) => {
    //     if (i % 3 === 0 && i !== 0) {
    //         return w + divider;
    //     } else {
    //         return w;
    //     }
    // }).reverse().join('');

    let _price: any = price || 0
    _price = (Math.round(_price * 100) / 100).toFixed(2)
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })
    return formatter.format(_price)
}

export function toStringPrice(price, isCurrency = false) {
    const currency = store.get('currency') || 'VNĐ'
    const exchange_rate = store.get('exchange_rate') || 1
    let _price: any = parseInt(price || 0) / exchange_rate
    _price = (Math.round(_price * 100) / 100).toFixed(2)
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })
    return {
        price: formatter.format(_price),
        currency
    }
}
