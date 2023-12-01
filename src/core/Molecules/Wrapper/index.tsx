import Router from 'core/Molecules/Routes'
import SideBar from 'core/Molecules/Wrapper/SideBar'
import Header from 'core/Molecules/Wrapper/Header'
import { Suspense } from 'react'
import { Spin } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import './style.scss'

const Home = () => (
    <BrowserRouter>
        <div id='sidebar_menu'>
            <SideBar />
        </div>
        <div className='main ph-main'>
            <Header />
            <Suspense
                fallback={
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '50%'
                        }}
                    >
                        <Spin size='large' />
                    </div>
                }
            >
                <main className='main-content' id='main_content'>
                    <Router />
                </main>
            </Suspense>
        </div>
    </BrowserRouter>
)

export default Home
