import db from "$lib/server/prismadb"
import type { InitialViewParametersType, LevelsType, SceneDataType } from "../admin/(admin)/+page.server"

export const load = async ({request}) => {
  // const userAgent = request.headers.get('user-agent')
  // console.log({userAgent})
  const scenes = await db.scene.findMany({
    include: {
      infoHotspots: true,
      linkHotspots: true
    },
    orderBy: {
      sort: 'asc'
    }
  })

  let scenesData: SceneDataType[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsType,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersType,
    }
  })

  return { scenes: scenesData }
}