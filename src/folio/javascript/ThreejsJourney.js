import { TweenLite } from 'gsap/TweenLite'

export default class ThreejsJourney
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.world = _options.world

        // Setup
        this.$container = document.querySelector('.js-kebele-loading')
        this.seenCount = window.localStorage.getItem('kebeleLoadingSeenCount') || 0
        this.seenCount = parseInt(this.seenCount)
        this.shown = false
        this.traveledDistance = 0
        this.minTraveledDistance = (this.config.debug ? 5 : 50) * (this.seenCount + 1)
        this.prevent = !!window.localStorage.getItem('kebeleLoadingPrevent')

        // Disable loading screen for minimal experience
        // if(this.config.debug)
        //     this.start()

        // if(this.prevent)
        //     return

        return

        this.setLog()

        this.time.on('tick', () =>
        {
            if(this.world.physics)
            {
                this.traveledDistance += this.world.physics.car.forwardSpeed

                if(!this.config.touch && !this.shown && this.traveledDistance > this.minTraveledDistance)
                {
                    this.start()
                }
            }
        })
    }

    // Removed setYesNo method - no longer needed for Kebele Zero loading screen

    setLog()
    {
//         console.log(
//             `%c 
// ▶
// ▶▶▶▶
// ▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶     ▶
// ▶▶▶▶      ▶▶▶▶▶▶▶▶
// ▶     ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
//    ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
//       ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶      
// ▶▶        ▶▶▶▶▶▶▶▶▶▶     ▶   ▶▶▶
// ▶▶▶▶▶▶        ▶      ▶▶▶▶▶   ▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶       ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶
//  ▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶
//      ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
// ▶▶▶▶     ▶▶▶▶   ▶▶▶
// ▶▶▶▶▶▶▶     ▶   
// ▶▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶
// ▶▶
//             `,
//             'color: #705df2;'
//         )
        console.log('%cWhat are you doing here?! you sneaky developer...', 'color: #32ffce');
        console.log('%cDo you want to learn how this portfolio has been made?', 'color: #32ffce');
        console.log('%cWelcome to Kebele Zero 👉 https://kebele-zero.com', 'color: #F59E0B');
        console.log('%c— Ethiopian Cultural Platform', 'color: #777777');
    }

    hide()
    {
        // Fade out the loading screen
        TweenLite.to(this.$container, 0.8, {
            opacity: 0,
            onComplete: () => {
                this.$container.style.display = 'none'
            }
        })
    }

    start()
    {
        // Show the loading screen briefly
        this.$container.style.display = 'flex'
        TweenLite.fromTo(this.$container, 0.5, { opacity: 0 }, { opacity: 1 })

        // Auto-hide after 1 second (much faster)
        TweenLite.delayedCall(1, () =>
        {
            this.hide()
        })

        this.shown = true

        window.localStorage.setItem('kebeleLoadingSeenCount', this.seenCount + 1)
    }

    // Removed updateMessages and next methods - no longer needed for Kebele Zero loading screen
}