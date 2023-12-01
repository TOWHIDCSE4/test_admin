import { Button } from 'antd'
import React from 'react'

export default function RedirectButton({ children, to }: any) {
    const handleRedirect = () => {
        const win = window.open(to, '_blank')
        win.focus()
    }

    return (
        <Button
            style={{ width: '100%' }}
            type='primary'
            onClick={handleRedirect}
        >
            {children}
        </Button>
    )
}
