import { system, world, BlockLocation } from '@minecraft/server'

const overworld = world.getDimension('overworld')

let loadedChunks = []

const scale = 10

const structures = [
    {
        structure: "3008:pillar",
        weight: 10
    },
    {
        structure: "3008:beds",
        weight: 35
    },
    {
        structure: "3008:tables",
        weight: 35
    },
    {
        structure: "3008:rest_area",
        weight: 20
    }
]

async function loadChunk(x, z) {
    const y = 256

    let totalWeight = 0

    for (const structure of structures) {
        totalWeight += structure.weight
    }

    let random = Math.floor(Math.random() * totalWeight + 1)

    let chosenStructure = null

    for (const structure of structures) {
        random -= structure.weight

        if (random > 0) continue

        chosenStructure = structure

        break
    }

    const rotations = [
        '0_degrees',
        '90_degrees',
        '180_degrees',
        '270_degrees'
    ]

    await overworld.runCommandAsync(`structure load ${chosenStructure.structure} ${x * scale} ${y} ${z * scale} ${rotations[Math.floor(Math.random() * 4)]}`)
}

const distance = 6

let shouldPlayMusic = false

system.runSchedule(async () => {
    for (const player of world.getPlayers()) {

        if (!shouldPlayMusic) {
            shouldPlayMusic = true

            world.playMusic('music.day', { loop: true, volume: 0.5, fade: 1 })
        }

        for (let x = -distance; x < distance; x++) {
            for (let z = -distance; z < distance; z++) {
                const playerChunkPos = new BlockLocation(Math.floor(player.location.x / scale), Math.floor(player.location.y / scale), Math.floor(player.location.z / scale))

                if ((playerChunkPos.x + x) % 2 == 0 || (playerChunkPos.z + z) % 2 == 0) continue

                if (loadedChunks.includes(`${playerChunkPos.x + x}_${playerChunkPos.z + z}`)) continue

                loadedChunks.push(`${playerChunkPos.x + x}_${playerChunkPos.z + z}`)

                await loadChunk(playerChunkPos.x + x, playerChunkPos.z + z)
            }
        }
    }
}, 20)