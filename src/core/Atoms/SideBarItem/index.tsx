/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { flatStructure } from 'utils/data-structure'
import { flattenDeep } from 'lodash-es'
import { Badge } from 'antd'
import _ from 'lodash'

const SideBarItem = ({ navItem, statisticSideBar }) => {
    const location = useLocation()
    const activeRoute = (...routeName) =>
        isActive(...routeName) ? 'active' : ''

    const secondLevelActive = (...routeName) =>
        isActive(...routeName) ? 'show' : ''

    const isActive = (...routes) => {
        for (const route of routes) {
            if (!route || route === '#') {
                continue
            }

            const { pathname } = location
            if (pathname === route) {
                return true
            }
        }

        return false
    }

    const hasWindow = typeof window !== 'undefined'

    const setShowMainContent = () => {
        const width = hasWindow ? window.innerWidth : null
        if (width < 993) {
            document.getElementById('sidebar_menu').style.display = 'none'
            document
                .getElementById('main_content')
                .classList.remove('hide-menu-content')
            document.getElementById('hide_menu_mobile').style.display = 'none'
            document.getElementById('show_menu_mobile').style.display = 'block'
        }
    }

    const parseRoute = (route) => route

    const renderThreeLevel = (parent_route, navChilds, parent) => {
        const routes = navChilds.map((c) => c.route)
        const id = parent_route.substring(1)
        return (
            <ul
                className={`sidebar-dropdown list-unstyled collapse ${secondLevelActive(
                    ...routes
                )}`}
                id={id}
                data-parent={`#${parent}`}
            >
                {navChilds.map((c, i) => {
                    const route = parseRoute(c.route)
                    return (
                        <li
                            key={i}
                            className={`sidebar-item ${activeRoute(c.route)}`}
                        >
                            <Link
                                to={route}
                                className='sidebar-link'
                                onClick={setShowMainContent}
                            >
                                {c.title}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        )
    }

    const renderSecondLevel = (parent_route, navChilds) => {
        const routes = flattenDeep(
            navChilds.map((c) => {
                if (c.children && c.children.length) {
                    return flatStructure(c.children).map((item) => item.route)
                }
                return c.route
            })
        )
        const id = parent_route.substring(1)
        return (
            <ul
                className={`sidebar-dropdown list-unstyled collapse ${secondLevelActive(
                    ...routes
                )}`}
                id={id}
                data-parent='#sidebar'
            >
                {navChilds.map((_navItem, i) => {
                    const routesChild = flatStructure(_navItem.children).map(
                        (item) => item.route
                    )
                    return (
                        <React.Fragment key={i}>
                            {_navItem.children &&
                            _navItem.children.length > 0 ? (
                                <li
                                    className={`sidebar-item ${activeRoute(
                                        ...routesChild
                                    )}`}
                                >
                                    <a
                                        href={_navItem.route || '#'}
                                        className='sidebar-link collapsed'
                                        data-toggle={
                                            _navItem.children &&
                                            _navItem.children.length > 0 &&
                                            'collapse'
                                        }
                                    >
                                        <span className='align-middle'>
                                            {_navItem.title}
                                        </span>
                                    </a>
                                </li>
                            ) : (
                                <li
                                    className={`sidebar-item ${activeRoute(
                                        _navItem.route
                                    )}`}
                                >
                                    <Link
                                        to={parseRoute(_navItem.route) || '#'}
                                        replace
                                        className='sidebar-link'
                                        onClick={setShowMainContent}
                                    >
                                        <span className='align-middle'>
                                            {_navItem.title}
                                        </span>
                                        {_.get(
                                            statisticSideBar,
                                            _navItem?.statistic
                                        ) > 0 && (
                                            <span style={{ float: 'right' }}>
                                                <Badge
                                                    count={_.get(
                                                        statisticSideBar,
                                                        _navItem?.statistic
                                                    )}
                                                    style={{
                                                        backgroundColor:
                                                            '#faad14',
                                                        fontSize: '15px'
                                                    }}
                                                    overflowCount={1000000}
                                                />
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            )}
                            {_navItem.children &&
                                _navItem.children.length > 0 &&
                                renderThreeLevel(
                                    _navItem.route,
                                    _navItem.children,
                                    id
                                )}
                        </React.Fragment>
                    )
                })}
            </ul>
        )
    }

    const routes = flatStructure([navItem]).map((item) => item.route)
    return (
        <li className={`sidebar-item ${activeRoute(...routes)}`}>
            {navItem.children && navItem.children.length > 0 ? (
                <a
                    href={navItem.route || '#'}
                    className='sidebar-link collapsed'
                    data-toggle={
                        navItem.children &&
                        navItem.children.length > 0 &&
                        'collapse'
                    }
                >
                    <i
                        className={`align-middle fas fa-fw fa-${navItem.icon}`}
                        data-feather={navItem.icon}
                    />
                    <span className='align-middle'>{navItem.title}</span>
                </a>
            ) : (
                <Link
                    to={parseRoute(navItem.route) || '#'}
                    replace
                    className='sidebar-link'
                    onClick={setShowMainContent}
                >
                    <i
                        className={`align-middle fas fa-fw fa-${navItem.icon}`}
                        data-feather={navItem.icon}
                    />
                    <span className='align-middle'>{navItem.title}</span>
                </Link>
            )}
            {navItem.children &&
                navItem.children.length > 0 &&
                renderSecondLevel(navItem.route, navItem.children)}
        </li>
    )
}

export default SideBarItem
