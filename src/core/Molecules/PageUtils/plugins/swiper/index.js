/* eslint-disable no-restricted-syntax */
import grapesjs from 'grapesjs'
import loadComponents from './components'
import loadBlocks from './blocks'

export default grapesjs.plugins.add('swiperComponent', (editor, opts = {}) => {
    const options = {
        label: 'Swiper',
        name: 'cswiper',
        category: 'Custom'
    }
    for (const name in options) {
        if (!(name in opts)) opts[name] = options[name]
    }

    loadBlocks(editor, options)
    loadComponents(editor, opts)
})
