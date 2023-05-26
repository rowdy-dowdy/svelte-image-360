<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Marzipano from "marzipano";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";
  import InfoHotSpot2 from "$lib/web/InfoHotSpot2.svelte";
  import InfoHotSpotVideo from "$lib/web/InfoHotSpotVideo.svelte";
  import { hold } from "../../stores/pano.js";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server.js";
  import type { InfoHotspots, LinkHotspots } from "@prisma/client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import BarOptions from "./BarOptions.svelte";
  import LeftSide from "./LeftSide.svelte";

  export let data: SceneDataType[]

  let hasMount: boolean = false

  let viewerHTML: HTMLElement | null = null
  let viewer: Marzipano.Viewer | null = null

  type SceneType = {
    data: SceneDataType
    scene: Marzipano.Scene
    view: Marzipano.RectilinearView
  }

  let scenes: SceneType[] = []

  let autoRotate: Function | null = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI/2
  })

  let currentScene = data[0] 
  let autoRotateCheck = true

  // web
  $: sceneId = $page.url.searchParams.get('scene')
  $: changeScene(sceneId)

  const changeScene = (sceneId: string | null) => {
    if (!hasMount) return
    let scene = scenes.find(v => v?.data.id == sceneId)
    if (scene) {
      switchScene(scene)
    }
    else {
      scenes.length > 0 ? goto('/?scene='+scenes[0].data.id) : goto('/')
    }
  }

  function startAutorotate() {
    if (!viewer || !autoRotate) return

    viewer.startMovement(autoRotate)
    viewer.setIdleMovement(3000, autoRotate)
    autoRotateCheck = true
  }

  function stopAutorotate() {
    if (!viewer) return
    viewer.stopMovement()
    viewer.setIdleMovement(Infinity)
    autoRotateCheck = false
  }

  function createLinkHotspotElement(hotspot: LinkHotspots) {
    var wrapper = document.createElement('div')
		let toolbarComponent = new LinkHotspot({
			target: wrapper,
			props: {
        title: findSceneDataById(hotspot.target)?.name || "",
        direction: hotspot.direction as any
      }
		});

		// toolbarComponent.$on('click-eye', ({ detail }) => eye = detail);
		// toolbarComponent.$on('click-lines', ({ detail }) => lines = detail);
		// toolbarComponent.$on('click-reset', () => {
		// 	map.setView(initialView, 5, { animate: true })
		// })

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      goto('/admin/?scene='+hotspot.target)
    });
    
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot: InfoHotspots) {
    var wrapper = document.createElement('div')

    if (hotspot?.type == "2") {
      let toolbarComponent = new InfoHotSpot2({
        target: wrapper,
        props: {
          title: hotspot?.title || "",
          description: hotspot?.description || ""
        }
      })
    }
    else if (hotspot?.type == "video") {
      let toolbarComponent = new InfoHotSpotVideo({
        target: wrapper,
        props: {}
      })
    }
    else {
      let toolbarComponent = new InfoHotSpot({
        target: wrapper,
        props: {
          title: hotspot?.title || "",
          description: hotspot?.description || ""
        }
      })
    }

    stopTouchAndScrollEventPropagation(wrapper)

    return wrapper
  }

  function stopTouchAndScrollEventPropagation(element: HTMLElement) {
    var eventList = [
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'wheel', 'click', 'mousedown'
    ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event: Event) {
        event.stopPropagation();
        event.stopImmediatePropagation()
      });
    }
  }

  function findSceneById(id: string) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i]?.data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id: string) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        return data[i];
      }
    }
    return null;
  }

  function switchScene(scene: SceneType) {
    let temp = autoRotateCheck

    stopAutorotate()
    scene.view.setParameters(scene.data.initialViewParameters)
    scene.scene.switchTo()

    if (temp) {
      startAutorotate()
    }
    currentScene = scene.data
  }

  function toggleAutorotate() {
    if (autoRotateCheck) {
      stopAutorotate()
      autoRotateCheck = false
    } else {
      startAutorotate()
      autoRotateCheck = true
    }
  }

  onMount(() => {
    hasMount = true

    if (!viewerHTML) return
    /// Create viewer.
    viewer = new Marzipano.Viewer(viewerHTML, {
      controls: {
        mouseViewMode: "drag"
      }
    })

    scenes = data.map(function(data) {
      var urlPrefix = "./tiles"
      var source = Marzipano.ImageUrlSource.fromString(data.url + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: data.url + "/preview.jpg" })
      var geometry = new Marzipano.CubeGeometry(data.levels)

      var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180)
      var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter)

      var scene = viewer!.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      })

      // Create link hotspots.
      data.linkHotspots.forEach(function(hotspot) {
        var element = createLinkHotspotElement(hotspot)
        scene?.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch })
      })

      // Create info hotspots.
      data.infoHotspots.forEach(function(hotspot) {
        var element = createInfoHotspotElement(hotspot)
        scene?.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch })
      })

      return {
        data: data,
        scene: scene,
        view: view
      }
    })

    if (!sceneId) {
      goto('/?scene='+scenes[0].data.id)
    }
    else {
      changeScene(sceneId)
    }
  })

  const panoEventMouseDown = (e: Event) => {
    $hold = true
  }

  const panoEventMouseUp = (e: Event) => {
    $hold = false
  }
</script>

<svelte:head>
  <title>Bắc Hà thăm quan | Live 360</title>
  <meta name="description" content="A sample 360° tour created by the VietHungIt.">
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

<div id="pano" bind:this={viewerHTML}  class="w-full h-screen"
  on:mousedown={panoEventMouseDown}
  on:mouseup={panoEventMouseUp}
/>

<LeftSide data={data} sceneId={sceneId} />

<BarOptions autoRotateCheck={autoRotateCheck} on:toggleAutorotate={toggleAutorotate} currentScene={currentScene} />

<style lang="postcss">
  :global(#pano > canvas ~ div) {
    overflow: hidden !important;
  }
</style>
