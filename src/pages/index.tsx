import { BrowserRouter, Switch } from 'react-router-dom'
import { AuthProvider } from 'contexts/Authenticate'
import { AuthenticatedRoute, AsyncRoute, RRoute } from 'core/Atoms/RRoute'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

const App = () => (
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
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
                    <Switch>
                        <AsyncRoute
                            exact
                            path='/login'
                            importPath={() => import('pages/Auth/Login')}
                        />
                        <AuthenticatedRoute
                            path='/meet'
                            importPath={() =>
                                import('pages/TeachingManagement/Meet')
                            }
                        />
                        <AuthenticatedRoute
                            path='/'
                            importPath={() => import('core/Molecules/Wrapper')}
                        />
                    </Switch>
                </Suspense>
            </AuthProvider>
        </QueryClientProvider>
    </BrowserRouter>
)

export default App
