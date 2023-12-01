import React, { useState, useRef, useMemo, useEffect, memo } from 'react'
import { Select, Spin } from 'antd'
import { SelectProps } from 'antd/es/select'
import debounce from 'lodash/debounce'

interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<ValueType[]>
    debounceTimeout?: number
    initialFetch?: boolean
    optionsData?: boolean
}

function DebounceSelect<
    OptionType extends {
        key?: string
        label: React.ReactNode
        value: string | number
    } = any
>({
    fetchOptions,
    debounceTimeout = 300,
    initialFetch = true,
    ...props
}: DebounceSelectProps) {
    const fetchRef = useRef(0)

    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [options, setOptions] = useState<OptionType[]>([])

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value: string) => {
            fetchRef.current += 1
            const fetchId = fetchRef.current
            setOptions([])
            setIsFetching(true)

            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    return
                }

                setOptions(newOptions)
                setIsFetching(false)
            })
        }

        return debounce(loadOptions, debounceTimeout)
    }, [fetchOptions, debounceTimeout])

    useEffect(() => {
        debounceFetcher.cancel()
    }, [debounceFetcher])

    useEffect(() => {
        debounceFetcher('')
        debounceFetcher.flush()
    }, [fetchOptions])

    useEffect(() => {
        if (initialFetch) {
            debounceFetcher('')
            debounceFetcher.flush()
        }
        return () => {
            debounceFetcher.cancel()
        }
    }, [])

    return (
        <Select<OptionType>
            showSearch
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={isFetching ? <Spin size='small' /> : null}
            {...props}
            options={options}
        />
    )
}
export default memo(DebounceSelect)
