import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter
{
    constructor()
    {
        super()

        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16
        this.paused = false

        this.tick = this.tick.bind(this)

        // Pause when tab is hidden — saves 100 % GPU/CPU on background tabs
        this._onVisibilityChange = () =>
        {
            if (document.hidden)
            {
                this.stop()
            }
            else
            {
                // Reset current so delta doesn't spike on resume
                this.current = Date.now()
                this.tick()
            }
        }
        document.addEventListener('visibilitychange', this._onVisibilityChange)

        // Pause/resume when app modals open over the 3D scene
        this._onModalOpen  = () => { this.paused = true;  this.stop() }
        this._onModalClose = () => { this.paused = false; this.current = Date.now(); this.tick() }
        window.addEventListener('kebele:modal:open',  this._onModalOpen)
        window.addEventListener('kebele:modal:close', this._onModalClose)

        this.tick()
    }

    tick()
    {
        this.ticker = window.requestAnimationFrame(this.tick)

        const current = Date.now()
        this.delta = current - this.current
        this.elapsed = current - this.start
        this.current = current

        // Clamp delta: min 1 ms (guards 120 Hz edge cases), max 60 ms
        if (this.delta < 1)  this.delta = 1
        if (this.delta > 60) this.delta = 60

        this.trigger('tick')
    }

    stop()
    {
        window.cancelAnimationFrame(this.ticker)
    }

    dispose()
    {
        this.stop()
        document.removeEventListener('visibilitychange', this._onVisibilityChange)
        window.removeEventListener('kebele:modal:open',  this._onModalOpen)
        window.removeEventListener('kebele:modal:close', this._onModalClose)
    }
}
