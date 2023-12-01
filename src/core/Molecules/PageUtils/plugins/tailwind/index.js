/* eslint-disable no-restricted-syntax */
import grapesjs from 'grapesjs'
import loadComponents from './components'
import loadTraits from './traits'

export default grapesjs.plugins.add(
    'tailwindComponent',
    (editor, opts = {}) => {
        const options = {}
        for (const name in options) {
            if (!(name in opts)) opts[name] = options[name]
        }

        loadTraits(editor, options)
        loadComponents(editor, opts)
    }
)
