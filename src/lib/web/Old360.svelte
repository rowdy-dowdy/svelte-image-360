<script lang="ts">
  import { Viewer, utils } from "@photo-sphere-viewer/core";
  import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
  import { GalleryPlugin } from "@photo-sphere-viewer/gallery-plugin";
  import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
  import { onDestroy, onMount } from "svelte";

  let viewerHTML: HTMLElement | null;
  const baseUrl = './tiles2/' || "https://photo-sphere-viewer-data.netlify.app/assets/";

  const animatedValues = {
    pitch: { start: -Math.PI / 2, end: 0.2 },
    yaw: { start: Math.PI, end: 0 },
    zoom: { start: 0, end: 50 },
    fisheye: { start: 2, end: 0 },
  };

  let viewer: Viewer | null = null;
  let autorotate: AutorotatePlugin | null = null;
  let markersPlugin: MarkersPlugin | null = null;

  onMount(() => {
    viewer = new Viewer({
      container: "viewer",
      panorama: baseUrl + "1.jpg",
      loadingImg: undefined,
      // loadingImg: baseUrl + "loader.gif",
      touchmoveTwoFingers: true,

      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.start,
      fisheye: animatedValues.fisheye.start,
      // navbar: [
      //   "autorotate",
      //   "zoom",
      //   {
      //     title: "Rerun animation",
      //     content: "🔄",
      //     onClick: intro,
      //   },
      //   "caption",
      //   "fullscreen",
      // ],
      plugins: [
        [
          AutorotatePlugin,
          {
            autostartDelay: null,
            autostartOnIdle: true,
            autorotatePitch: animatedValues.pitch.end,
            autorotateSpeed: '1rpm',
          },
        ],
        [
          MarkersPlugin,
          {
            markers: [
              {
                // image marker that opens the panel when clicked
                id: "image",
                position: { yaw: 0.32, pitch: 0.11 },
                image: baseUrl + "pictos/pin-blue.png",
                size: { width: 32, height: 32 },
                anchor: "bottom center",
                zoomLvl: 100,
                tooltip: "A image marker. <b>Click me!</b>",
                content: "dfsa",
              },
              {
                // image marker rendered in the 3D scene
                id: "imageLayer",
                imageLayer: baseUrl + "pictos/tent.png",
                size: { width: 120, height: 94 },
                position: { yaw: -0.45, pitch: -0.1 },
                tooltip: "Image embedded in the scene",
              },
              {
                // html marker with custom style
                id: "text",
                position: { yaw: 0, pitch: 0 },
                html: "HTML <b>marker</b> &hearts;",
                anchor: "bottom right",
                scale: [0.5, 1.5],
                style: {
                  maxWidth: "100px",
                  color: "white",
                  fontSize: "20px",
                  fontFamily: "Helvetica, sans-serif",
                  textAlign: "center",
                },
                tooltip: {
                  content: "An HTML marker",
                  position: "right",
                },
              },
              {
                // polygon marker
                id: "polygon",
                polyline: [
                  [6.2208, 0.0906],
                  [0.0443, 0.1028],
                  [0.2322, 0.0849],
                  [0.4531, 0.0387],
                  [0.5022, -0.0056],
                  [0.4587, -0.0396],
                  [0.252, -0.0453],
                  [0.0434, -0.0575],
                  [6.1302, -0.0623],
                  [6.0094, -0.0169],
                  [6.0471, 0.032],
                  [6.2208, 0.0906],
                ],
                svgStyle: {
                  fill: "rgba(200, 0, 0, 0.2)",
                  stroke: "rgba(200, 0, 50, 0.8)",
                  strokeWidth: "2px",
                },
                tooltip: {
                  content: "A dynamic polygon marker",
                  position: "bottom right",
                },
              },
              {
                // polyline marker
                id: "polyline",
                polylinePixels: [
                  [2478, 1635],
                  [2184, 1747],
                  [1674, 1953],
                  [1166, 1852],
                  [709, 1669],
                  [301, 1519],
                  [94, 1399],
                  [34, 1356],
                ],
                svgStyle: {
                  stroke: "rgba(140, 190, 10, 0.8)",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "10px",
                },
                tooltip: "A dynamic polyline marker",
              },
              {
                // circle marker
                id: "circle",
                circle: 20,
                position: { textureX: 2500, textureY: 1200 },
                tooltip: "A circle marker",
              },
            ],
          },
        ],
      ],
    });

    autorotate = viewer.getPlugin(AutorotatePlugin) as any;

    markersPlugin = viewer.getPlugin(MarkersPlugin) as any;

    viewer.addEventListener("ready", intro, { once: true });

    function intro() {
      autorotate?.stop();
      markersPlugin?.hideAllMarkers()

      new utils.Animation({
        properties: animatedValues,
        duration: 2500,
        easing: "inOutQuad",
        onTick: (properties) => {
          viewer?.setOption("fisheye", properties.fisheye);
          viewer?.rotate({ yaw: properties.yaw, pitch: properties.pitch });
          viewer?.zoom(properties.zoom);
        },
      }).then(() => {
        autorotate?.setOptions({
          autostartDelay: 0,
          autostartOnIdle: true,
        });
        autorotate?.start();
        markersPlugin?.showAllMarkers()
      });
    }

    markersPlugin?.addEventListener("select-marker", ({ marker }) => {
      // markersPlugin?.updateMarker({
      //   id: marker.id,
      //   image: 'assets/pin-blue.png',
      // });
      if (marker.id == "new-marker") {
        changeScreen(2);
      }
    });
  });

  const changeScreen = (i: number) => {
    if (viewer) {
      viewer?.setPanorama(baseUrl + (i == 1 ? "1.jpg" : "2.jpg"))
        .then(() => {
          console.log('b')
        })
    }
  };

  onDestroy(() => {
    if (viewer) {
      viewer.destroy()
    }
  })
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.css"
  />
  <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/gallery-plugin@5/index.css"> -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5/index.css"
  />
</svelte:head>

<div id="viewer" bind:this={viewerHTML} class="w-full h-screen" />

<div class="absolute top-0 left-0 z-50">
  <button on:click={() => changeScreen(1)}>1</button>
  <button on:click={() => changeScreen(2)}>2</button>
</div>

<style>
  button {
    @apply px-6 py-1.5 rounded bg-white;
  }

  :global(.psv-loader-container) {
    display: none !important;
  }
  :global(.psv-loader) {
    display: none !important;
  }
</style>