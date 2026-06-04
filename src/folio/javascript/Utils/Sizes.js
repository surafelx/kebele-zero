import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor()
    {
        super()

        // Debounce timer so rapid resize events don't hammer the GPU
        this._resizeTimer = null

        this._onResize = () =>
        {
            clearTimeout(this._resizeTimer)
            this._resizeTimer = setTimeout(() => this.resize(), 100)
        }
        window.addEventListener('resize', this._onResize)

        this.resize()
    }

    resize()
    {
        // Use window dimensions directly — no DOM append/remove needed
        this.width    = window.innerWidth
        this.height   = window.innerHeight
        // viewport alias kept for backward compatibility
        this.viewport = { width: this.width, height: this.height }

        this.trigger('resize')
    }

    dispose()
    {
        clearTimeout(this._resizeTimer)
        window.removeEventListener('resize', this._onResize)
    }
}
