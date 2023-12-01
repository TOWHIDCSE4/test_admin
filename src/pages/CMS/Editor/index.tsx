/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { API_HOST } from 'core/Molecules/PageUtils'
import Sidebar from 'core/Atoms/PageBuilder/SideBar'
import TopNav from 'core/Atoms/PageBuilder/TopNav'
import geditorConfig from 'core/Molecules/PageUtils/geditor_config'
import GrapesJS from 'grapesjs'
import gjsBasicBlocks from 'grapesjs-blocks-basic'

export const storageSetting = (pageId) => ({
    type: 'remote',
    stepsBeforeSave: 3,
    contentTypeJson: true,
    storeComponents: true,
    storeStyles: true,
    storeHtml: true,
    storeCss: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    id: 'mycustom-',
    urlStore: `${API_HOST}/admin/pages/${pageId}/content`,
    urlLoad: `${API_HOST}/admin/pages/${pageId}/content`
})

const Editor = () => {
    const [editor, setEditor] = useState(null)
    const [assets, setAssets] = useState([])
    const [pages, setPages] = useState([])
    const [error, setError] = useState('')
    const { pageId } = useParams()

    useEffect(() => {
        async function getAllAssets() {
            try {
                const response = await axios.get(`${API_HOST}/assets/`)
                setAssets(response.data)
            } catch (err) {
                setAssets(err.message)
            }
        }
        async function getAllPages() {
            try {
                const response = await axios.get(`${API_HOST}/pages/`)
                setPages(response.data)
            } catch (err) {
                setError(err.message)
            }
        }
        // getAllPages()
        // getAllAssets()
    }, [])

    useEffect(() => {
        // const editor = geditorConfig(assets, pageId)
        if (!editor) {
            const e = GrapesJS.init({
                container: `#example-editor`,
                fromElement: true,
                plugins: [gjsBasicBlocks],
                storageManager: storageSetting(pageId)
            })
            setEditor(e)
        }

        // setEditor(editor)
    }, [])
    return (
        <div className='App'>
            {/* <div
                id='navbar'
                className='sidenav d-flex flex-column overflow-scroll'
            >
                <nav className='navbar navbar-light'>
                    <div className='container-fluid'>
                        <span className='navbar-brand mb-0 h3 logo'>
                            Code Dexterous
                        </span>
                    </div>
                </nav>
                <Sidebar />
            </div>
            <div className='main-content' id='main-content'>
                <TopNav />
                <div id='editor' />
            </div> */}
            <div id='example-editor' />
        </div>
    )
}

export default Editor
