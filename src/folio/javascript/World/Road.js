import * as THREE from 'three'

export default class Road {
    constructor(_options) {
        this.resources = _options.resources
        this.objects = _options.objects
        this.debug = _options.debug

        // Road parameters
        this.width = 6 // width of the road
        this.depth = 0.1 // thickness
        this.textureRepeat = 4 // how many times the asphalt texture repeats along the road
        this.material = null
        this.mesh = null

        this.setMaterial()
    }

    setMaterial() {
        const textureLoader = new THREE.TextureLoader()
        const asphaltTexture = textureLoader.load('../../models/road/asphalt.jpg') // replace with your texture
        asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping
        asphaltTexture.repeat.set(this.textureRepeat, 1)

        this.material = new THREE.MeshStandardMaterial({
            map: asphaltTexture,
            roughness: 0.8,
            metalness: 0.2
        })
    }

    add(_options) {
        const start = _options.start
        const end = _options.end

        // Calculate road length
        const delta = end.clone().sub(start)
        const length = delta.length()
        const angle = Math.atan2(delta.y, delta.x)

        // Create road shape
        const shape = new THREE.Shape()
        shape.moveTo(-this.width / 2, 0)
        shape.lineTo(this.width / 2, 0)
        shape.lineTo(this.width / 2, length)
        shape.lineTo(-this.width / 2, length)
        shape.closePath()

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: this.depth,
            bevelEnabled: false
        })

        // Rotate and position along path
        this.mesh = new THREE.Mesh(geometry, this.material)
        this.mesh.rotation.z = angle
        this.mesh.position.set(start.x, start.y, 0)

        this.objects.add(this.mesh)
    }
}
