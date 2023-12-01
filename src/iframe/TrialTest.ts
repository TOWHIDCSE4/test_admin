export default class IspeakIframeTrialTest {
    src: any

    safe: boolean

    iframe: HTMLIFrameElement

    constructor(src) {
        this.src = src
        this.safe = true
        this.iframe = document.createElement('iframe')
        this.iframe.allow =
            'camera; microphone; autoplay; display-capture; picture-in-picture; fullscreen; display'
        this.iframe.src = this.src
        this.iframe.id = 'admin-trial-test-id'
    }
}
