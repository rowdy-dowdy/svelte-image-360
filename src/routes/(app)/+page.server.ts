export type LinkHostSpotType = {
  yaw: number,
  pitch: number,
  rotation: number,
  target: string,
  direction?: "l" | "r" | "t" | "b"
}

export type InfoHostSpotType = {
  yaw: number,
  pitch: number,
  rotation: number,
  title: string,
  description: string
  type?: "1" | "2" | "video",
  direction?: "l" | "r" | "t" | "b"
}

export type SceneDataType = {
  id: string,
  name: string,
  levels: {
    tileSize: number,
    size: number,
    fallbackOnly?: boolean
  }[],
  faceSize: number,
  initialViewParameters: {
    pitch: number,
    yaw: number,
    fov: number
  },
  linkHotspots: LinkHostSpotType[],
  infoHotspots: InfoHostSpotType[]
}

export type DataType = {
  scenes: SceneDataType[],
  name: string,
  settings: {
    mouseViewMode: string,
    autorotateEnabled: boolean,
    fullscreenButton: boolean,
    viewControlButtons: boolean
  }
}

export const load = async () => {
  var data: DataType = {
    "scenes": [
      {
        "id": "home2",
        "name": "Tầng 1 Văn Phòng KennaTech",
        "levels": [
          {
            "tileSize": 256,
            "size": 256,
            "fallbackOnly": true
          },
          {
            "tileSize": 512,
            "size": 512
          },
          {
            "tileSize": 512,
            "size": 1024
          },
          {
            "tileSize": 512,
            "size": 2048
          }
        ],
        "faceSize": 2048,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [
          {
            "yaw": -2.1286284873084327,
            "pitch": -0.07944601245308647,
            "rotation": 0,
            "target": "home3"
          }
        ],
        "infoHotspots": [
          {
            "yaw": -2.403026743082725,
            "pitch": -0.06929274622522641,
            "rotation": 0,
            "title": "Tủ giày",
            "description": "he Oriente Station is one of the most important bus and train stations in the city. Designed by the Spanish architect and engineer Santiago Calatrava, it has an enormous metal skeleton that covers the eight train lines and its platforms. Finished in 1998 to serve the Expo’98 and, later, the Parque das Nações area, in its surroundings are companies, services, hotels, bars, animation, as well as the well known Vasco da Gama shopping centre."
          },
          {
            "yaw": 1.6653534579255869,
            "pitch": 0.08749508508219606,
            "rotation": 0,
            "title": "Khu dân cư",
            "description": "he Oriente Station is one of the most important bus and train stations in the city. Designed by the Spanish architect and engineer Santiago Calatrava, it has an enormous metal skeleton that covers the eight train lines and its platforms. Finished in 1998 to serve the Expo’98 and, later, the Parque das Nações area, in its surroundings are companies, services, hotels, bars, animation, as well as the well known Vasco da Gama shopping centre."
          },
          {
            "yaw": -3.0786401997724724,
            "pitch": -0.06929438842952962,
            "rotation": 0,
            "title": "Bồn rửa mặt",
            "description": "he Oriente Station is one of the most important bus and train stations in the city. Designed by the Spanish architect and engineer Santiago Calatrava, it has an enormous metal skeleton that covers the eight train lines and its platforms. Finished in 1998 to serve the Expo’98 and, later, the Parque das Nações area, in its surroundings are companies, services, hotels, bars, animation, as well as the well known Vasco da Gama shopping centre.",
            type: '2'
          }
        ]
      },
      {
        "id": "home3",
        "name": "Tầng 2 Văn Phòng KennaTech",
        "levels": [
          {
            "tileSize": 256,
            "size": 256,
            "fallbackOnly": true
          },
          {
            "tileSize": 512,
            "size": 512
          },
          {
            "tileSize": 512,
            "size": 1024
          },
          {
            "tileSize": 512,
            "size": 2048
          }
        ],
        "faceSize": 2048,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [
          {
            "yaw": -1.3521962951798514,
            "pitch": -0.020799492635731553,
            "rotation": 0,
            "target": "home2"
          },
          {
            "yaw": 1.4159304874614698,
            "pitch": -0.06845356607135855,
            "rotation": 0,
            "target": "home1"
          }
        ],
        "infoHotspots": []
      },
      {
        "id": "home1",
        "name": "Tầng 3 Văn Phòng KennaTech",
        "levels": [
          {
            "tileSize": 256,
            "size": 256,
            "fallbackOnly": true
          },
          {
            "tileSize": 512,
            "size": 512
          },
          {
            "tileSize": 512,
            "size": 1024
          },
          {
            "tileSize": 512,
            "size": 2048
          }
        ],
        "faceSize": 2000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [
          {
            "yaw": 2.3673777158953815,
            "pitch": 0.006078600382705801,
            "rotation": 0,
            "target": "home3",
            direction: "l"
          },
        ],
        "infoHotspots": [
          // {
          //   "yaw": 1.2345073005366078,
          //   "pitch": -0.1058840518530424,
          //   "rotation": 0,
          //   "title": "Bồn rửa mặt",
          //   "description": "he Oriente Station is one of the most important bus and train stations in the city. Designed by the Spanish architect and engineer Santiago Calatrava, it has an enormous metal skeleton that covers the eight train lines and its platforms. Finished in 1998 to serve the Expo’98 and, later, the Parque das Nações area, in its surroundings are companies, services, hotels, bars, animation, as well as the well known Vasco da Gama shopping centre.",
          //   type: 'video'
          // }
        ]
      },
      {
        "id": "mountain",
        "name": "Khu vui chơi",
        "levels": [
          {
            "tileSize": 256,
            "size": 256,
            "fallbackOnly": true
          },
          {
            "tileSize": 512,
            "size": 512
          },
          {
            "tileSize": 512,
            "size": 1024
          },
          {
            "tileSize": 512,
            "size": 2048
          }
        ],
        "faceSize": 2048,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [],
        "infoHotspots": []
      }
    ],
    "name": "Project Title",
    "settings": {
      "mouseViewMode": "drag",
      "autorotateEnabled": true,
      "fullscreenButton": false,
      "viewControlButtons": false
    }
  }

  return data
}