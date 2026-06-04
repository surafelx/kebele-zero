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
        this.camera = _options.camera
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false


        this.setStatic()
        this.setAreas()
        this.setLabels()
        this.setProps()
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
            
                    // Area interactions — fire a custom event that App.tsx listens to
                    this.souqArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'souq' }));
                    })

                    this.radioArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'radio' }));
                    })

                    this.eventsArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'events' }));
                    })
            
                    this.aboutArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'about' }));
                    })

                    this.gamesArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'games' }));
                    })

                    this.mediaArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'media' }));
                    })

                    this.forumArea.on('interact', () => {
                        window.dispatchEvent(new CustomEvent('openKebeleModal', { detail: 'forum' }));
                    })

        }

    /**
     * Floating sign labels over each interactive pad so the player knows
     * what every area opens before driving onto it. Canvas-generated, so
     * no extra assets are loaded; billboarded to always face the camera.
     */
    setLabels()
    {
        this.labels = {}
        this.labels.items = []

        // text + brand colour for each pad (matches the area positions above)
        const configs = [
            { text: 'SOUQ',   color: '#f97316', position: new THREE.Vector2(this.x + 20, this.y - 8)  },
            { text: 'RADIO',  color: '#a855f7', position: new THREE.Vector2(this.x + 20, this.y + 5)  },
            { text: 'EVENTS', color: '#22c55e', position: new THREE.Vector2(this.x - 16, this.y + 15) },
            { text: 'GAMES',  color: '#eab308', position: new THREE.Vector2(this.x - 22, this.y - 3)  },
            { text: 'MEDIA',  color: '#0ea5e9', position: new THREE.Vector2(this.x - 23, this.y - 22) },
            { text: 'ABOUT',  color: '#10b981', position: new THREE.Vector2(this.x,      this.y - 8)  },
            { text: 'FORUM',  color: '#3b82f6', position: new THREE.Vector2(this.x,      this.y - 20) },
        ]

        for (const config of configs)
        {
            const texture = this.createLabelTexture(config.text, config.color)
            const aspect = texture.image.width / texture.image.height

            const height = 1.4
            const geometry = new THREE.PlaneBufferGeometry(height * aspect, height, 1, 1)
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
            })

            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(config.position.x, config.position.y, 2.3)
            // billboards update their own matrix each frame
            mesh.matrixAutoUpdate = true
            this.container.add(mesh)

            this.labels.items.push({ mesh, baseZ: 2.3, phase: Math.random() * Math.PI * 2 })
        }

        // Billboard + gentle bob each tick (paused automatically when tab hidden / modal open)
        this.time.on('tick', () =>
        {
            const camera = this.camera && this.camera.instance
            if (!camera) return

            for (const label of this.labels.items)
            {
                // face the camera
                label.mesh.quaternion.copy(camera.quaternion)
                // subtle vertical bob for life
                label.mesh.position.z = label.baseZ + Math.sin(this.time.elapsed * 0.002 + label.phase) * 0.12
            }
        })
    }

    /**
     * Render a neubrutalist sign (solid fill, thick black border, offset
     * shadow, white Comic Sans text) to a canvas and return it as a texture.
     */
    createLabelTexture(text, color)
    {
        const w = 512
        const h = 192
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')

        const pad = 18
        const radius = 22
        const shadow = 10

        const roundRect = (x, y, rw, rh, r) =>
        {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.arcTo(x + rw, y,      x + rw, y + rh, r)
            ctx.arcTo(x + rw, y + rh, x,      y + rh, r)
            ctx.arcTo(x,      y + rh, x,      y,      r)
            ctx.arcTo(x,      y,      x + rw, y,      r)
            ctx.closePath()
        }

        // offset shadow
        ctx.fillStyle = '#000000'
        roundRect(pad + shadow, pad + shadow, w - pad * 2 - shadow, h - pad * 2 - shadow, radius)
        ctx.fill()

        // body
        ctx.fillStyle = color
        roundRect(pad, pad, w - pad * 2 - shadow, h - pad * 2 - shadow, radius)
        ctx.fill()

        // border
        ctx.lineWidth = 8
        ctx.strokeStyle = '#000000'
        roundRect(pad, pad, w - pad * 2 - shadow, h - pad * 2 - shadow, radius)
        ctx.stroke()

        // text — white fill with black outline
        const cx = pad + (w - pad * 2 - shadow) / 2
        const cy = pad + (h - pad * 2 - shadow) / 2
        ctx.font = '900 84px "Comic Sans MS", "Comic Sans", cursive, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.lineWidth = 8
        ctx.strokeStyle = '#000000'
        ctx.strokeText(text, cx, cy + 4)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(text, cx, cy + 4)

        const texture = new THREE.CanvasTexture(canvas)
        texture.anisotropy = 4
        texture.needsUpdate = true
        return texture
    }

    /**
     * Populate the crossroads with car-knockable physics props.
     * All use existing loaded models; repeated props pass duplicated:true.
     */
    setProps()
    {
        const R = this.resources.items

        // small helper to place one prop at an absolute (x,y) within the section
        const place = (model, dx, dy, opts = {}) =>
        {
            const base = R[`${model}Base`]
            const collision = R[`${model}Collision`]
            if (!base || !collision) return   // asset not loaded — skip gracefully

            this.objects.add({
                base: base.scene,
                collision: collision.scene,
                offset: new THREE.Vector3(this.x + dx, this.y + dy, opts.z ?? 0.4),
                rotation: new THREE.Euler(0, 0, opts.rotation ?? 0),
                duplicated: true,
                shadow: opts.shadow ?? { sizeX: 1.2, sizeY: 1.2, offsetZ: - 0.35, alpha: 0.35 },
                mass: opts.mass ?? 1.5,
                soundName: opts.soundName ?? 'woodHit',
                sleep: true
            })
        }

        // ── Bowling set by the GAMES pad (pad at x-22, y-3) ──────────────────
        // 10-pin triangle just north of the pad, apex toward the approach
        {
            const ox = - 22, oy = 2        // triangle centre relative to section
            const gap = 0.62
            for (let row = 0; row < 4; row++)
            {
                for (let i = 0; i <= row; i++)
                {
                    const px = ox + (i - row / 2) * gap
                    const py = oy - row * gap
                    place('bowlingPin', px, py, {
                        z: 0.2, mass: 0.6, soundName: 'bowlingPin',
                        shadow: { sizeX: 0.45, sizeY: 0.45, offsetZ: - 0.18, alpha: 0.35 }
                    })
                }
            }
            // ball ready to roll, further north of the apex
            place('bowlingBall', ox, oy + 2.4, {
                z: 0.3, mass: 5, soundName: 'bowlingBall',
                shadow: { sizeX: 0.7, sizeY: 0.7, offsetZ: - 0.2, alpha: 0.4 }
            })
        }

        // ── Brick stall by the SOUQ pad (pad at x+20, y-8) ───────────────────
        // a small 3-wide, 2-high wall + a couple on top, north of the pad
        {
            const ox = 20, oy = - 3
            const bw = 1.05
            for (let layer = 0; layer < 2; layer++)
            {
                for (let i = - 1; i <= 1; i++)
                {
                    place('brick', ox + i * bw, oy, {
                        z: 0.3 + layer * 0.55, mass: 1.5, soundName: 'brick',
                        shadow: { sizeX: 1.1, sizeY: 0.7, offsetZ: - 0.3, alpha: 0.35 }
                    })
                }
            }
            place('brick', ox - 0.5, oy, { z: 1.4, mass: 1.5, soundName: 'brick' })
            place('brick', ox + 0.5, oy, { z: 1.4, mass: 1.5, soundName: 'brick' })
        }

        // ── Traffic cones lining the northern approach lane (intro→junction) ─
        // The road from the intro runs along x≈0 from dy +18 down to the junction
        {
            for (let dy = 18; dy >= 2; dy -= 3)
            {
                place('cone', - 2.5, dy, { z: 0.2, mass: 0.4, soundName: 'woodHit',
                    shadow: { sizeX: 0.5, sizeY: 0.5, offsetZ: - 0.2, alpha: 0.3 } })
                place('cone',   2.5, dy, { z: 0.2, mass: 0.4, soundName: 'woodHit',
                    shadow: { sizeX: 0.5, sizeY: 0.5, offsetZ: - 0.2, alpha: 0.3 } })
            }
        }

        // ── Scattered playful props around the junction ─────────────────────
        {
            const scatter = [
                ['lemon', - 8,  - 4], ['lemon',  9, - 14], ['lemon', - 4, - 16],
                ['egg',     6,  - 6], ['egg',  - 10, - 12], ['egg',    3, - 20],
            ]
            for (const [model, dx, dy] of scatter)
            {
                place(model, dx, dy, { z: 0.3, mass: 1,
                    shadow: { sizeX: 0.6, sizeY: 0.6, offsetZ: - 0.2, alpha: 0.3 } })
            }
            // a honking horn near the centre
            place('horn', - 5, - 8, { z: 0.2, mass: 1.5, rotation: 0.4, soundName: 'horn',
                shadow: { sizeX: 1.65, sizeY: 0.75, offsetZ: - 0.1, alpha: 0.4 } })
        }
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
