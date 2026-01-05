import * as THREE from 'three'

export default class CrossroadsSection
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

        
        this.setStatic()
        this.setAreas()
        this.setTiles()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.crossroadsStaticBase.scene,
            collision: this.resources.items.crossroadsStaticCollision.scene,
            floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

     setAreas()
        {
               // Kebele Souq Area
                    this.souqArea = this.areas.add({
                        position: new THREE.Vector2(this.x + 20, this.y - 8),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })
            
                    // Kebele Radio Area
                    this.radioArea = this.areas.add({
                        position: new THREE.Vector2(this.x + 20, this.y + 5),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })
            
                    // Kebele Events Area
                    this.eventsArea = this.areas.add({
                        position: new THREE.Vector2(this.x - 16 , this.y + 15),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })

                      // Kebele Games Area
                    this.gamesArea = this.areas.add({
                        position: new THREE.Vector2(this.x - 22 , this.y-3),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })

                    // Kebele Media Area
                    this.mediaArea = this.areas.add({
                        position: new THREE.Vector2(this.x - 23, this.y-22),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })

                    // Kebele Forum Area
                    this.aboutArea = this.areas.add({
                        position: new THREE.Vector2(this.x, this.y - 8),
                        halfExtents: new THREE.Vector2(3, 2),
                        hasKey: true,
                        testCar: true,
                        active: true
                    })
            
                    // Forum Kebele Area
                    this.forumArea = this.areas.add({
                        position: new THREE.Vector2(this.x, this.y - 20),
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

                     this.gameArea.on('interact', () => {
                        console.log('Game area clicked');
                        if (window.openKebeleModal) {
                            window.openKebeleModal('games');
                        } else {
                            // Fallback to custom event
                            window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'about' }));
                        }
                    })

                    this.forumArea.on('interact', () => {
                        console.log('Forum area clicked');
                        if (window.openKebeleModal) {
                            window.openKebeleModal('forum');
                        } else {
                            // Fallback to custom event
                            window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'about' }));
                        }
                    })
        }
    

    setTiles()
    {
        // To intro
        this.tiles.add({
            start: new THREE.Vector2(this.x, - 10),
            delta: new THREE.Vector2(0, this.y + 10)
        })

         // To events
        this.tiles.add({
            start: new THREE.Vector2(this.x - 13, this.y + 15),
            delta: new THREE.Vector2(13, 0)
        })


        // To Radio
        this.tiles.add({
            start: new THREE.Vector2(this.x + 2, this.y + 4),
            delta: new THREE.Vector2(15, 0)
        })

         this.tiles.add({
            start: new THREE.Vector2(this.x+15, -25),
            delta: new THREE.Vector2(0,  4)
        })
        // To souq
        this.tiles.add({
            start: new THREE.Vector2(this.x + 2, this.y - 17),
            delta: new THREE.Vector2(18, 0)
        })

        
         this.tiles.add({
            start: new THREE.Vector2(this.x+15, -45),
            delta: new THREE.Vector2(0,  18)
        })

         this.tiles.add({
            start: new THREE.Vector2(this.x, -20),
            delta: new THREE.Vector2(0, this.y + 8)
        })


        // To Games
        this.tiles.add({
            start: new THREE.Vector2(this.x - 20, this.y - 4),
            delta: new THREE.Vector2(20, 0)
        })

        
        
        // To Media
        this.tiles.add({
            start: new THREE.Vector2(this.x - 18, this.y - 17),
            delta: new THREE.Vector2(15, 0)
        })

        
        
    }
}
