export const load = async () => {
  var data = {
    "scenes": [
      {
        "id": "room",
        "name": "Jerónimos Monastery",
        "levels": [
          {
            "tileSize": 250,
            "size": 250,
            "fallbackOnly": true
          },
          {
            "tileSize": 500,
            "size": 500
          },
          {
            "tileSize": 500,
            "size": 1000
          },
          {
            "tileSize": 500,
            "size": 2000
          }
        ],
        "faceSize": 4000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "type": "jpg",
        "linkHotspots": [
          {
            "yaw": 0.010843761396778007,
            "pitch": 0.11054577665990095,
            "rotation": 0,
            "target": "mountain"
          },
          {
            "yaw": -1.7746019905996206,
            "pitch": 0.1508152622844534,
            "rotation": 0,
            "target": "house"
          }
        ]
      },
      {
        "id": "mountain",
        "name": "Electricity Museum",
        "levels": [
          {
            "tileSize": 250,
            "size": 250,
            "fallbackOnly": true
          },
          {
            "tileSize": 500,
            "size": 500
          },
          {
            "tileSize": 500,
            "size": 1000
          },
          {
            "tileSize": 500,
            "size": 2000
          }
        ],
        "faceSize": 4000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "type": "jpg",
        "linkHotspots": [
          {
            "yaw": 2.4423556534191686,
            "pitch": 0.26408084823755473,
            "rotation": 0,
            "target": "room"
          }
        ]
      },
      {
        "id": "house",
        "name": "house",
        "levels": [
          { "tileSize": 312.5, "size": 312.5, "fall backOnly": true },
          { "tileSize": 625, "size": 625},
          { "tileSize": 625, "size": 1250},
          { "tileSize": 625, "size": 2500},
        ],
        "faceSize": 5000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "type": "jpg",
        "linkHotspots": [
          {
            "yaw": 2.4294376357980987,
            "pitch": -0.16151030914396358,
            "rotation": 0,
            "target": "mountain"
          }
        ],
      },
      {
        "id": "room2",
        "name": "room2",
        "levels": [
          { "tileSize": 312.5, "size": 312.5, "fall backOnly": true },
          { "tileSize": 625, "size": 625 },
          { "tileSize": 625, "size": 1250 },
          { "tileSize": 625, "size": 2500 }
        ],
        "faceSize": 5000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "type": "jpg",
        "linkHotspots": [],
      }
           
    ],
    "name": "Sample Tour",
    "settings": {
      "mouseViewMode": "drag",
      "autorotateEnabled": true,
      "fullscreenButton": true,
      "viewControlButtons": true
    }
  }

  return data
}