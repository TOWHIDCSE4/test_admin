import { Alert } from 'antd'

const ExtendTime = ({ ...props }) => (
    <div className='row'>
        <div className='col-12 col-xl-12'>
            <Alert
                message='Feature is under development'
                description='This feature is under development. Please try it again'
                type='info'
                showIcon
            />
        </div>
    </div>
)

export default ExtendTime
