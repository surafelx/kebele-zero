import * as THREE from 'three'

export default class KebeleSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setAreas()
    }

    setAreas()
    {
        // Kebele Souq Area
        this.souqArea = this.areas.add({
            position: new THREE.Vector2(this.x + 5, this.y + 5),
            halfExtents: new THREE.Vector2(3, 2),
            hasKey: true,
            testCar: true,
            active: true
        })

        // Kebele Radio Area
        this.radioArea = this.areas.add({
            position: new THREE.Vector2(this.x - 25, this.y + 5),
            halfExtents: new THREE.Vector2(3, 2),
            hasKey: true,
            testCar: true,
            active: true
        })

        // Kebele Events Area
        this.eventsArea = this.areas.add({
            position: new THREE.Vector2(this.x + 5, this.y - 5),
            halfExtents: new THREE.Vector2(3, 2),
            hasKey: true,
            testCar: true,
            active: true
        })

        // About Kebele Area
        this.aboutArea = this.areas.add({
            position: new THREE.Vector2(this.x - 5, this.y - 5),
            halfExtents: new THREE.Vector2(3, 2),
            hasKey: true,
            testCar: true,
            active: true
        })

        // Set up area interactions
        this.souqArea.on('interact', () => {
            console.log('Souq area clicked');
            if (window.openKebeleModal) {
                window.openKebeleModal('souq');
            } else {
                // Fallback to custom event
                window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'souq' }));
            }
        })

        this.radioArea.on('interact', () => {
            console.log('Radio area clicked');
            if (window.openKebeleModal) {
                window.openKebeleModal('radio');
            } else {
                // Fallback to custom event
                window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'radio' }));
            }
        })

        this.eventsArea.on('interact', () => {
            console.log('Events area clicked');
            if (window.openKebeleModal) {
                window.openKebeleModal('events');
            } else {
                // Fallback to custom event
                window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'events' }));
            }
        })

        this.aboutArea.on('interact', () => {
            console.log('About area clicked');
            if (window.openKebeleModal) {
                window.openKebeleModal('about');
            } else {
                // Fallback to custom event
                window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'about' }));
            }
        })
    }

 
}