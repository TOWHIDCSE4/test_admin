import DashboardAPI from 'api/DashboardAPI'
import { useAuth } from 'contexts/Authenticate'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SideBarItem from '../../../Atoms/SideBarItem'
import { treeConfig, filterConfigByPerms } from '../../Routes/config'
import './style.scss'

const SideBar = () => {
    const [statistic, setStatistic] = useState({
        all_teacher_count: 0,
        inactive_teacher_count: 0,
        trial_teacher_count: 0,
        referral_teacher_count: 0,
        pending_teacher_count: 0,
        pending_regular_request_count: 0,
        pending_absent_request_count: 0,
        regular_student_count: 0,
        trial_student_count: 0,
        active_student_count: 0,
        inactive_student_count: 0,
        pending_marketing_inbox_count: 0
    })

    const { user } = useAuth()

    let permsByUser = []

    if (user && user?.permissions) {
        permsByUser = user?.permissions
    }
    const authNavItems = filterConfigByPerms(treeConfig, permsByUser)

    const fetchStatistic = () => {
        // DashboardAPI.getStatisticsSideBar()
        //     .then((res) => setStatistic(res))
        //     .catch((e) => console.error(e))
    }

    useEffect(() => {
        fetchStatistic()
    }, [])

    const renderSideBarItems = (navItems) =>
        navItems.map((item, i) => (
            <SideBarItem key={i} navItem={item} statisticSideBar={statistic} />
        ))

    return (
        <nav id='sidebar' className='sidebar ph-sidebar'>
            <div className='sidebar-content '>
                <Link className='sidebar-brand' to='/'>
                    <i className='align-middle' data-feather='box' />
                    <span className='align-middle'>Quản trị</span>
                </Link>
                <ul className='sidebar-nav'>
                    {permsByUser.length > 0 && renderSideBarItems(authNavItems)}
                </ul>
            </div>
        </nav>
    )
}

export default SideBar
