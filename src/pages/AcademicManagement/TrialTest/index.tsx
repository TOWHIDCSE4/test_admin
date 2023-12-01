import { FC, useState, useEffect } from 'react'
import IframeTrialTest from 'iframe/TrialTest'
import { Card, Input, Select } from 'antd'
import * as store from 'utils/storage'

type Props = {
    type?: number
}

const { Search } = Input
const { Option } = Select
const TRIAL_TEST_URL = process.env.REACT_APP_TRIAL_TEST_URL
const TrialTest: FC<Props> = ({ type }) => {
    useEffect(() => {
        const auth_token = store.get('access_token')
        const adminIframeTrialTest = new IframeTrialTest(
            `${TRIAL_TEST_URL}?auth_token=${auth_token}`
        )
        const iframe = adminIframeTrialTest?.iframe
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.frameBorder = '0'
        iframe.onload = function (params) {
            iframe.contentWindow.postMessage('requestHeightChange', '*')

            window.addEventListener('message', (e) => {
                let { data } = e
                // if (!data) data = e.originalEvent.data

                if (typeof data === 'string') {
                    data = data.split(':')
                    if (data[0] === 'setHeight') {
                        iframe.style.height = `calc(100vh - 115px)`
                        iframe.style.minHeight = `500px`
                    }
                }
            })
        }
        document.getElementById('trial-test').appendChild(iframe)
    }, [])

    return (
        <div>
            <div id='trial-test' />
        </div>
    )
}

export default TrialTest
