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
  import { isSafari } from "./map.js";
  import LinkHotspot4 from "./LinkHotspot4.svelte";
  import VideoShow from "./VideoShow.svelte";
  import { Viewer, utils } from "@photo-sphere-viewer/core";
  import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
  import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
  import "@photo-sphere-viewer/core/index.css"
  import "@photo-sphere-viewer/markers-plugin/index.css"
  import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";

  export let data: SceneDataType[]
  export let groups: GroupScene[]

  let isMount: boolean = false

  let viewerHTML: HTMLElement | null = null
  let viewer: Viewer | null = null
  export let settingMainAudio: Setting | undefined

  // type SceneType = {
  //   data: SceneDataType
  //   scene: Marzipano.Scene
  //   view: Marzipano.RectilinearView
  // }

  // let scenes: SceneType[] = []
  let currentScene = data[0] 
  let autoRotateCheck = true

  // let autoRotate: Function | null = Marzipano.autorotate({
  //   yawSpeed: 0.03,
  //   targetPitch: currentScene.initialViewParameters.pitch,
  //   targetFov: Math.PI/2
  // })

  // $: changeAutoRotate(currentScene)

  // const changeAutoRotate = (currentScene: SceneDataType) => {
  //   autoRotate = Marzipano.autorotate({
  //     yawSpeed: 0.03,
  //     targetPitch: currentScene.initialViewParameters.pitch,
  //     targetFov: Math.PI/2
  //   })
  // }

  // $: changeVideoShow($videoShow)

  // let autoRotateAfterVideoShow = autoRotateCheck
  // const changeVideoShow = (videoShow: string | null) => {
  //   if (videoShow != null) {
  //     autoRotateAfterVideoShow = autoRotateCheck
  //     stopAutorotate()
  //   }
  //   else {
  //     if (autoRotateAfterVideoShow) { 
  //       startAutorotate()
  //     }
  //   }
  // }

  // web
  $: sceneSlug = $page.params.slug
  // $: changeScene(sceneSlug)

  // const changeScene = (sceneSlug: string | null) => {
  //   if (!isMount) return
  //   let scene = scenes.find(v => v?.data.slug == sceneSlug)
  //   if (scene) {
  //     switchScene(scene)
  //   }
  //   else {
  //     scenes.length > 0 ? goto(`/${scenes[0].data.slug}`) : goto('/')
  //   }
  // }

  // function startAutorotate() {
  //   if (!viewer || !autoRotate) return

  //   viewer.startMovement(autoRotate)
  //   viewer.setIdleMovement(3000, autoRotate)
  //   autoRotateCheck = true
  // }

  // function stopAutorotate() {
  //   if (!viewer) return
  //   viewer.stopMovement()
  //   viewer.setIdleMovement(Infinity)
  //   autoRotateCheck = false
  // }

  // function createLinkHotspotElement(hotspot: LinkHotspots) {
  //   var wrapper = document.createElement('div')
    
	// 	if (hotspot?.type == "2") {
  //     let toolbarComponent = new LinkHotspot2({
  //       target: wrapper,
  //       props: {
  //         title: findSceneDataById(hotspot.target)?.name || ""
  //       }
  //     })
  //   }
  //   else if (hotspot?.type == "3") {
  //     let toolbarComponent = new LinkHotspot3({
	// 		target: wrapper,
  //       props: {
  //         title: findSceneDataById(hotspot.target)?.name || ""
  //       }
  //     })
  //   }
  //   else if (hotspot?.type == "4") {
  //     let toolbarComponent = new LinkHotspot4({
	// 		target: wrapper,
  //       props: {
  //         title: findSceneDataById(hotspot.target)?.name || ""
  //       }
  //     })
  //   }
  //   else {
  //     let toolbarComponent = new LinkHotspot({
	// 		target: wrapper,
  //       props: {
  //         title: findSceneDataById(hotspot.target)?.name || "",
  //         image: `/storage/tiles/${hotspot.target}/demo.jpg`
  //       }
  //     })
  //   }

	// 	// toolbarComponent.$on('click-eye', ({ detail }) => eye = detail);
	// 	// toolbarComponent.$on('click-lines', ({ detail }) => lines = detail);
	// 	// toolbarComponent.$on('click-reset', () => {
	// 	// 	map.setView(initialView, 5, { animate: true })
	// 	// })

  //   // Add click event handler.
  //   wrapper.addEventListener('click', function() {
  //     let scene = scenes.find(v => v.data.id == hotspot.target)
  //     goto(`/${scene?.data.slug}`)
  //   });
    
  //   stopTouchAndScrollEventPropagation(wrapper);

  //   return wrapper;
  // }

  // function createInfoHotspotElement(hotspot: InfoHotspots) {
  //   var wrapper = document.createElement('div')

  //   if (hotspot.type == "2") {
  //     let toolbarComponent = new InfoHotSpot2({
  //       target: wrapper,
  //       props: {
  //         title: hotspot?.title || "",
  //         video: hotspot?.video || "",
  //       }
  //     })
  //   }
  //   else {
  //     let toolbarComponent = new InfoHotSpot({
  //       target: wrapper,
  //       props: {
  //         title: hotspot?.title || "",
  //         description: hotspot?.description || ""
  //       }
  //     })
  //   }

  //   stopTouchAndScrollEventPropagation(wrapper)

  //   return wrapper
  // }

  // function stopTouchAndScrollEventPropagation(element: HTMLElement) {
  //   var eventList = [
  //     'touchstart', 'touchmove', 'touchend', 'touchcancel',
  //     'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
  //     'wheel', 'click', 'mousedown'
  //   ];
  //   for (var i = 0; i < eventList.length; i++) {
  //     element.addEventListener(eventList[i], function(event: Event) {
  //       event.stopPropagation();
  //       event.stopImmediatePropagation()
  //     });
  //   }
  // }

  // function findSceneById(id: string) {
  //   for (var i = 0; i < scenes.length; i++) {
  //     if (scenes[i]?.data.id === id) {
  //       return scenes[i];
  //     }
  //   }
  //   return null;
  // }

  // function findSceneDataById(id: string) {
  //   for (var i = 0; i < data.length; i++) {
  //     if (data[i].id === id) {
  //       return data[i];
  //     }
  //   }
  //   return null;
  // }

  // function switchScene(scene: SceneType) {
  //   let temp = autoRotateCheck

  //   stopAutorotate()
  //   scene.view.setParameters(scene.data.initialViewParameters)
  //   scene.scene.switchTo()

  //   if (temp) {
  //     startAutorotate()
  //   }
  //   currentScene = scene.data
  // }

  // function toggleAutorotate() {
  //   if (autoRotateCheck) {
  //     stopAutorotate()
  //     autoRotateCheck = false
  //   } else {
  //     startAutorotate()
  //     autoRotateCheck = true
  //   }
  // }

  const animatedValues = {
    pitch: { start: -Math.PI / 2, end: 0.2 },
    yaw: { start: Math.PI, end: 0 },
    zoom: { start: 0, end: 50 },
    fisheye: { start: 2, end: 0 },
  };

  const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

  onMount(() => {
    isMount = true

    if (!viewerHTML) return
    /// Create viewer.
    viewer = new Viewer({
      container: viewerHTML,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: true,
          autorotatePitch: animatedValues.pitch.end,
          autorotateSpeed: '0.5rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.start,
      fisheye: animatedValues.fisheye.start,

      touchmoveTwoFingers: true,
      panorama: {
        width: data[0].faceSize,
        cols: 16,
        rows: 8,
        baseUrl: `/storage/tiles/${data[0].id}/low.jpg`,
        tileUrl: (col: number, row: number) => {
          return `/storage/tiles/${data[0].id}/${row}_${col}.jpg`
        },
      },
    })

    const markersPlugin: MarkersPlugin = viewer.getPlugin(MarkersPlugin);

    viewer.addEventListener('dblclick', ({ data }) => {
      var wrapper = document.createElement('div')
    
      new LinkHotspot2({
        target: wrapper,
        props: {
          title: "Đồng Bằng sông Cửu Long"
        }
      })

      markersPlugin.addMarker({
        id: '#' + Math.random(),
        position: { yaw: data.yaw, pitch: data.pitch },
        html: wrapper.innerHTML,
        size: { width: 0, height: 0 },
        anchor: 'bottom center',
        // tooltip: 'Generated pin',
      });
    });

    let autorotate = viewer.getPlugin(AutorotatePlugin) as any;

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

    // if (!sceneSlug) {
    //   goto(`/${scenes[0].data.slug}`)
    // }
    // else {
    //   changeScene(sceneSlug)
    // }
  })

  const panoEventMouseDown = (e: Event) => {
    $hold = true
  }

  const panoEventMouseUp = (e: Event) => {
    $hold = false
  }

  onDestroy(() => {
    if (viewer)
      viewer.destroy()
  })
</script>

<svelte:head>
  <!-- <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style> -->
</svelte:head>

<div id="viewer" bind:this={viewerHTML}  class="w-full h-screen"
  on:mousedown={panoEventMouseDown}
  on:mouseup={panoEventMouseUp}
/>

<!-- <LeftSide data={data} sceneSlug={sceneSlug} groups={groups} />

<BarOptions {settingMainAudio} autoRotateCheck={autoRotateCheck} on:toggleAutorotate={toggleAutorotate} currentScene={currentScene} />

<VideoShow /> -->

<style lang="postcss">
  :global(.psv-loader-container) {
    display: none !important;
  }
  :global(.psv-container) {
    background: none !important;
  }

  :global(.psv-panel-content) {
    @apply backdrop-blur-md;
    all: unset;
  }
</style>
