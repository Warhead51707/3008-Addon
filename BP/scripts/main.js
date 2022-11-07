import { system, world, BlockLocation } from '@minecraft/server'

const overworld = world.getDimension('overworld')

let loadedChunks = []

const scale = 10

const structures = [
    {
        structure: "3008:test",
        weight: 9
    },
    {
        structure: "3008:pillar",
        weight: 1
    }
]

async function loadChunk(x, z) {
    const y = 257

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

    for (let sx = x * scale + 7; sx <= x * scale + 8; sx++) {
        for (let sz = z * scale + 7; sz <= z * scale + 8; sz++) {
            for (let sy = y + 28; sy <= y + 29; sy++) {
                try {
                    await overworld.runCommandAsync(`setblock ${sx} ${sy} ${sz} air`)
                } catch { }
            }
        }
    }
}

const distance = 6

system.runSchedule(async () => {
    for (const player of world.getPlayers()) {
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