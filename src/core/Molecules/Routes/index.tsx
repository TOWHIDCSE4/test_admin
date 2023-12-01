import { Switch, Redirect } from 'react-router-dom'
import { flatStructure } from 'utils/data-structure'
import { AuthenticatedRoute, RRoute } from 'core/Atoms/RRoute'
import _ from 'lodash'
import NotFound from 'core/Atoms/NotFound'
import { treeConfig, routeWithoutSidebar } from './config'

export default function Router() {
    const sidebarConfig = flatStructure(treeConfig)

    const flatConfig = _.concat(sidebarConfig, routeWithoutSidebar)
    return (
        <Switch>
            {flatConfig.map((container, i) => (
                <AuthenticatedRoute
                    exact
                    key={container.route}
                    path={container.route}
                    title={
                        container.parent
                            ? `${`${container.title} - ${container.parent.title}`}`
                            : container.title
                    }
                    importPath={container.component}
                    required={container.required}
                />
            ))}
            <RRoute
                exact
                key='notfound'
                path='/not-found'
                title='Not found'
                component={(props) => <NotFound {...props} />}
            />
            <Redirect to='/not-found' />
        </Switch>
    )
}
