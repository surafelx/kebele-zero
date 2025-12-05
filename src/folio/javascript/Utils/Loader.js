import EventEmitter from './EventEmitter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter
{
    /**
     * Constructor
     */
    constructor()
    {
        super()

        this.setLoaders()

        this.toLoad = 0
        this.loaded = 0
        this.items = {}
    }

    /**
     * Set loaders
     */
    setLoaders()
    {
        this.loaders = []

        // Images
        this.loaders.push({
            extensions: ['jpg', 'png'],
            action: (_resource) =>
            {
                const image = new Image()

                image.addEventListener('load', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.addEventListener('error', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.src = _resource.source
            }
        })

        // Draco
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')
        dracoLoader.setDecoderConfig({ type: 'js' })

        this.loaders.push({
            extensions: ['drc'],
            action: (_resource) =>
            {
                dracoLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)

                    DRACOLoader.releaseDecoderModule()
                })
            }
        })

        // GLTF
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (_resource) =>
            {
                gltfLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                }, undefined, (_error) =>
                {
                    console.error(`Failed to load GLTF ${_resource.name}:`, _error)
                    this.fileLoadEnd(_resource, null)
                })
            }
        })

        // FBX
        const fbxLoader = new FBXLoader()

        this.loaders.push({
            extensions: ['fbx'],
            action: (_resource) =>
            {
                fbxLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })
    }

    /**
     * Load
     */
    load(_resources = [])
    {
        for(const _resource of _resources)
        {
            this.toLoad++

            // Handle source if it's an object (e.g., imported asset)
            let source = _resource.source
            if(typeof source === 'object' && source !== null)
            {
                source = source.default || source.src || source
            }

            // Ensure source is a string
            if(typeof source !== 'string')
            {
                console.warn(`Cannot handle source type for ${_resource.name}: ${typeof source}`)
                this.toLoad--
                continue
            }

            // Handle data URLs (e.g., base64 encoded images and models)
            let extension = null
            if(source.startsWith('data:'))
            {
                // Extract extension from data URL
                if(source.includes('data:image/'))
                {
                    // Image types (e.g., "data:image/png;base64," -> "png")
                    const mimeMatch = source.match(/data:image\/([a-z]+);/)
                    if(mimeMatch)
                    {
                        extension = mimeMatch[1]
                    }
                }
                else if(source.includes('data:model/gltf'))
                {
                    // GLTF/GLB models (e.g., "data:model/gltf-binary;base64," -> "glb")
                    extension = 'glb'
                }
            }
            else
            {
                // Regular file extension matching
                const extensionMatch = source.match(/\.([a-z]+)$/)
                if(extensionMatch && typeof extensionMatch[1] !== 'undefined')
                {
                    extension = extensionMatch[1]
                }
            }

            if(extension)
            {
                const loader = this.loaders.find((_loader) => _loader.extensions.find((_extension) => _extension === extension))

                if(loader)
                {
                    // Create a copy of resource with resolved source
                    const resourceWithSource = { ..._resource, source }
                    loader.action(resourceWithSource)
                }
                else
                {
                    console.warn(`Cannot found loader for ${_resource.name} with extension ${extension}`)
                }
            }
            else
            {
                console.warn(`Cannot found extension of ${_resource.name} with source ${source.substring(0, 100)}...`)
            }
        }
    }

    /**
     * File load end
     */
    fileLoadEnd(_resource, _data)
    {
        this.loaded++
        this.items[_resource.name] = _data

        this.trigger('fileEnd', [_resource, _data])

        if(this.loaded === this.toLoad)
        {
            this.trigger('end')
        }
    }
}
