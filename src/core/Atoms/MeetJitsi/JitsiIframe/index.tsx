import { JitsiMeetExternalAPI } from 'assets/themes/js/api_meet'
import React, { Component } from 'react'

class JitsiIframe extends React.Component<any, any> {
    domain = 'meet.englishplus.vn'

    api: any

    constructor(props) {
        super(props)
        this.state = {
            isAudioMuted: false,
            isVideoMuted: false
        }
    }

    startMeet = () => {
        const options = {
            roomName: this.props.roomName,
            width: '100%',
            configOverwrite: { prejoinPageEnabled: false },
            interfaceConfigOverwrite: {
                // overwrite interface properties
            },
            userInfo: {
                displayName: this.props.displayName,
                avatarURL: this.props.avatarURL
            }
        }

        this.api = new JitsiMeetExternalAPI(this.domain, options)

        this.api.addEventListeners({
            readyToClose: this.handleClose,
            participantLeft: this.handleParticipantLeft,
            participantJoined: this.handleParticipantJoined,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
            audioMuteStatusChanged: this.handleMuteStatus,
            videoMuteStatusChanged: this.handleVideoStatus
        })
    }

    handleClose = () => {
        window.location.href = '/'
    }

    handleParticipantLeft = async (participant) => {
        const data = await this.getParticipants()
    }

    handleParticipantJoined = async (participant) => {
        const data = await this.getParticipants()
    }

    handleVideoConferenceJoined = async (participant) => {
        const data = await this.getParticipants()
    }

    handleVideoConferenceLeft = () => {}

    handleMuteStatus = (audio) => {}

    handleVideoStatus = (video) => {}

    getParticipants() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.api.getParticipantsInfo()) // get all participants
            }, 500)
        })
    }

    // custom events
    executeCommand(command) {
        this.api.executeCommand(command)
        if (command === 'hangup') {
            return this.props.history.push('/thank-you')
        }

        // if (command === 'toggleAudio') {
        //     this.setState({ isAudioMuted: !this.state.isAudioMuted })
        // }

        // if (command === 'toggleVideo') {
        //     this.setState({ isVideoMuted: !this.state.isVideoMuted })
        // }
    }

    componentDidMount() {
        if (JitsiMeetExternalAPI) {
            this.startMeet()
        } else {
            alert('JitsiMeetExternalAPI not loaded')
        }
    }

    render() {
        const { isAudioMuted, isVideoMuted } = this.state
        return (
            <>
                <div id='jitsi-iframe' />
                <div className='item-center'>
                    {/* <span>&nbsp;&nbsp;</span> */}
                    <i
                        onClick={() => this.executeCommand('toggleAudio')}
                        className={`fas fa-2x grey-color ${
                            isAudioMuted
                                ? 'fa-microphone-slash'
                                : 'fa-microphone'
                        }`}
                        aria-hidden='true'
                        title='Mute / Unmute'
                    />
                    <i
                        onClick={() => this.executeCommand('hangup')}
                        className='fas fa-phone-slash fa-2x red-color'
                        aria-hidden='true'
                        title='Leave'
                    />
                    <i
                        onClick={() => this.executeCommand('toggleVideo')}
                        className={`fas fa-2x grey-color ${
                            isVideoMuted ? 'fa-video-slash' : 'fa-video'
                        }`}
                        aria-hidden='true'
                        title='Start / Stop camera'
                    />
                    <i
                        onClick={() => this.executeCommand('toggleShareScreen')}
                        className='fas fa-film fa-2x grey-color'
                        aria-hidden='true'
                        title='Share your screen'
                    />
                </div>
            </>
        )
    }
}

export default JitsiIframe
