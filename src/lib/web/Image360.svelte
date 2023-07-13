<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  // import Marzipano from "marzipano";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";
  import InfoHotSpot2 from "$lib/web/InfoHotSpot2.svelte";
  import InfoHotSpotVideo from "$lib/web/InfoHotSpotVideo.svelte";
  import { hold, videoShow } from "../../stores/pano.js";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server.js";
  import type { GroupScene, InfoHotspots, LinkHotspots, Setting } from "@prisma/client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import BarOptions from "./BarOptions.svelte";
  import LeftSide from "./LeftSide.svelte";
  import LinkHotspot2 from "./LinkHotspot2.svelte";
  import LinkHotspot3 from "./LinkHotspot3.svelte";
  import LinkHotspot4 from "./LinkHotspot4.svelte";
  import VideoShow from "./VideoShow.svelte";
  import { Viewer, utils } from "@photo-sphere-viewer/core";
  import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
  import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
  import "@photo-sphere-viewer/core/index.css"
  import "@photo-sphere-viewer/markers-plugin/index.css"
  import "$lib/admin/tinymce.css"
  import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
  import Map from "./Map.svelte";

  export let start: boolean
  export let data: SceneDataType[]
  export let groups: GroupScene[]

  let isMount: boolean = false
  let isStart: boolean = false

  let viewerHTML: HTMLElement | null = null
  let viewer: Viewer | null = null

  let sceneSlug: string | undefined = undefined
  let currentScene: SceneDataType = sceneSlug ? (data.find(v => v.slug == sceneSlug) || data[0]) : data[0]
  let autoRotateCheck = true
  let fullScreen = false
  let markersPlugin: MarkersPlugin | null
  let autoRotate: AutorotatePlugin | null

  // web
  $: sceneSlug = $page.params.slug
  $: currentScene = sceneSlug ? (data.find(v => v.slug == sceneSlug) || data[0]) : data[0]
  $: changeScene(sceneSlug)

  const changeScene = (sceneSlug: string | undefined) => {
    if (!isMount) return
    let scene = sceneSlug ? (data.find(v => v.slug == sceneSlug) || data[0]) : data[0]
    if (scene) {
      autoRotate?.setOptions({
        autorotatePitch: scene.initialViewParameters.pitch
      })
      switchScene(scene)
    }
  }

  function switchScene(scene: SceneDataType) {
    markersPlugin?.clearMarkers()
    viewer?.setPanorama({
      width: scene.faceSize,
      cols: 16,
      rows: 8,
      baseUrl: `/storage/tiles/${scene.id}/low.jpg`,
      tileUrl: (col: number, row: number) => {
        return `/storage/tiles/${scene.id}/${row}_${col}.jpg`
      },
    }, {
      pitch: scene.initialViewParameters.pitch,
      yaw: scene.initialViewParameters.yaw,
      zoom: scene.initialViewParameters.zoom,
      showLoader: false,
      transition: 100,

      // overlay: false
    }).then(v => {
      createLinkHotspotElements(scene.linkHotspots)
      createInfoHotspotElements(scene.infoHotspots)
    })
  }

  function toggleAutorotate(value?: boolean) {
    if (value != undefined) {
      value ? autoRotate?.start() : autoRotate?.stop()
      autoRotateCheck = value
      autoRotate?.setOptions({
        autostartOnIdle: value,
      });
      return
    }

    if (autoRotateCheck) {
      autoRotate?.stop()
      autoRotate?.setOptions({
        autostartOnIdle: false,
      });
      autoRotateCheck = false
    } 
    else {
      autoRotate?.setOptions({
        autostartOnIdle: true,
      });
      autoRotate?.start()
      autoRotateCheck = true
    }
  }

  const findSceneDataById = (id: string ) => data.find(v => v.id == id)
 
  function createLinkHotspotElements(hotspots: LinkHotspots[]) { 
    hotspots.forEach(hotspot => {
      let wrapper = document.createElement('div'),
        tooltip = undefined,
        html = undefined,
        image = undefined,
        size = { width: 0, height: 0 }

      let target = findSceneDataById(hotspot.target)

      if (hotspot?.type == "2") {
        tooltip = target?.name || ""
        image = '/images/flycam.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "3") {
        tooltip = target?.name || ""
        image = '/images/arrow.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "4") {
        new LinkHotspot4({
          target: wrapper,
          props: {
            title: target?.name || ""
          }
        })
        html = wrapper.innerHTML
      }
      else {
        new LinkHotspot({
          target: wrapper,
          props: {
            title: target?.name || "",
            image: `/storage/tiles/${hotspot.target}/low.jpg`
          }
        })
        html = wrapper.innerHTML
      }

      markersPlugin?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: size,
        anchor: 'center',
        data: {
          type: 'link',
          target: target?.slug
        },
        tooltip: tooltip
      });
    })
  }

  function createInfoHotspotElements(hotspots: InfoHotspots[]) {
    hotspots.forEach(hotspot => {
      let wrapper = document.createElement('div'),
        tooltip = undefined,
        html = undefined,
        image = undefined,
        content = undefined

      if (hotspot?.type == "2") {
        new InfoHotSpot2({
          target: wrapper,
          props: {
            // title: findSceneDataById(hotspot.target)?.name || ""
          }
        })
        tooltip = hotspot.title ?? ''
        html = wrapper.innerHTML
      }
      else {
        new InfoHotSpot({
          target: wrapper,
          props: {
          }
        })
        tooltip = hotspot.title ?? ''
        content = hotspot.description ?? ''
        html = wrapper.innerHTML
      }

      markersPlugin?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: { width: 40, height: 40 },
        anchor: 'center',
        content,
        data: {
          type: 'info',
          title: tooltip,
          video: hotspot.video
        },
        tooltip: tooltip
      });
    })
  }

  // stop auto rotate in video show
  $: changeVideoShow($videoShow)

  let autoRotateAfterVideoShow = true
  const changeVideoShow = (videoShow: string | null) => {
    if (videoShow != null) {
      autoRotateAfterVideoShow = autoRotateCheck
      toggleAutorotate(false)
    }
    else {
      if (autoRotateAfterVideoShow) { 
        toggleAutorotate(true)
      }
    }
  }

  // start in tro
  $: startIntro(start)

  const startIntro = (start: boolean) => {
    if (start && !isStart) {
      intro()
    }
  }

  let animatedValues = {
    pitch: { start: -Math.PI / 2, end: currentScene.initialViewParameters.pitch || 0.2 },
    yaw: { start: -1, end: currentScene.initialViewParameters.yaw || 0 },
    zoom: { start: 0, end: currentScene.initialViewParameters.zoom || 50 },
    fisheye: { start: 2, end: 0 },
  }

  function intro() {
    autoRotate?.stop();
    // markersPlugin?.hideAllMarkers()

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
      createLinkHotspotElements(currentScene.linkHotspots || [])
      createInfoHotspotElements(currentScene.infoHotspots || [])

      autoRotate?.setOptions({
        autorotatePitch: currentScene?.initialViewParameters.pitch,
        autostartDelay: 1000,
        autostartOnIdle: true,
      });
      autoRotate?.start();

      // markersPlugin?.showAllMarkers()
    });
  }

  onMount(() => {
    if (!viewerHTML) return

    /// Create viewer.
    viewer = new Viewer({
      container: viewerHTML,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: animatedValues.pitch.end,
          autorotateSpeed: '0.5rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.start,
      fisheye: animatedValues.fisheye.start,

      // touchmoveTwoFingers: true,
      panorama: {
        width: currentScene.faceSize,
        cols: 16,
        rows: 8,
        baseUrl: `/storage/tiles/${currentScene.id}/low.jpg`,
        tileUrl: (col: number, row: number) => {
          return `/storage/tiles/${currentScene.id}/${row}_${col}.jpg`
        },
      },
    })

    markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
    autoRotate = viewer.getPlugin(AutorotatePlugin) as AutorotatePlugin;

    if (start && !isStart) {
      viewer.addEventListener("ready", intro, { once: true });
      isStart = true
    }

    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      if (marker.data?.type == "link" && marker.data?.target) {
        if (marker.data?.target)
          goto(`/${marker.data?.target}`)
        else 
          goto(`/`)
      }
      
      if (marker.data?.type == "info") {
        if (marker.data?.video) {
          $videoShow = marker.data?.video
        }
      }
    })

    isMount = true
  })

  onDestroy(() => {
    if (viewer)
      viewer.destroy()
  })
</script>

<!-- <div id="viewer" bind:this={viewerHTML}  class="w-full h-screen" /> -->

<LeftSide data={data} sceneSlug={sceneSlug} {currentScene} groups={groups} />

<BarOptions bind:viewer={viewer} autoRotateCheck={autoRotateCheck} 
  on:toggleAutorotate={() => toggleAutorotate()} currentScene={currentScene} scenes={data}
  {groups} />

<VideoShow />

<Map />

<style lang="postcss">
  :global(.psv-loader-container) {
    display: none !important;
  }
  :global(.psv-container) {
    background: none !important;
  }

  :global(.psv-panel-content) {
    @apply backdrop-blur-md;
  }

  :global(.psv-panel.psv--capture-event.psv-panel--open) {
    width: 600px;
    max-width: 100%;
  }
</style>
