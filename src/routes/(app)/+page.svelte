<script lang="ts">
  import { onMount } from "svelte";
  import Marzipano from "marzipano";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";
  import type { InfoHostSpotType, LinkHostSpotType, SceneDataType } from "./+page.server.js";
  import InfoHotSpot2 from "$lib/web/InfoHotSpot2.svelte";
  import InfoHotSpotVideo from "$lib/web/InfoHotSpotVideo.svelte";
  import Anim from "$lib/web/Anim.svelte";
  import { hold } from "../../stores/pano.js";

  export let data

  let viewerHTML: HTMLElement | null = null;
  let viewer: Marzipano.Viewer | null = null;
  let scenes: {
    data: SceneDataType,
    scene: Marzipano.Scene,
    view: Marzipano.RectilinearView
  }[] = []
  let autoRotate: Function | null = null
  let currentScene = data.scenes[0]
  let fullScreen = false
  let autoRotateCheck = true

  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  function startAutorotate() {
    if (!viewer || !autoRotate) return

    viewer.startMovement(autoRotate);
    viewer.setIdleMovement(3000, autoRotate);
  }

  function stopAutorotate() {
    if (!viewer) return
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function createLinkHotspotElement(hotspot: LinkHostSpotType) {
    var wrapper = document.createElement('div')
		let toolbarComponent = new LinkHotspot({
			target: wrapper,
			props: {
        title: findSceneDataById(hotspot.target)?.name || "",
        direction: hotspot.direction
      }
		});

		// toolbarComponent.$on('click-eye', ({ detail }) => eye = detail);
		// toolbarComponent.$on('click-lines', ({ detail }) => lines = detail);
		// toolbarComponent.$on('click-reset', () => {
		// 	map.setView(initialView, 5, { animate: true })
		// })

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });
    
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot: InfoHostSpotType) {
    var wrapper = document.createElement('div')

    if (hotspot.type == "2") {
      let toolbarComponent = new InfoHotSpot2({
        target: wrapper,
        props: {
          title: hotspot.title,
          description: hotspot.description
        }
      })
    }
    else if (hotspot.type == "video") {
      let toolbarComponent = new InfoHotSpotVideo({
        target: wrapper,
        props: {}
      })
    }
    else {
      let toolbarComponent = new InfoHotSpot({
        target: wrapper,
        props: {
          title: hotspot.title,
          description: hotspot.description
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
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id: string) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  function switchScene(scene: any) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    currentScene = scene.data
    // updateSceneName(scene);
    // updateSceneList(scene);
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

  const toggleFullScreen = () => {
    if (!fullScreen) {
      document.documentElement.requestFullscreen()
      fullScreen = true
    }
    else {
      document.exitFullscreen();
      fullScreen = false
    }
  }

  onMount(() => {
    if (!viewerHTML) return
    /// Create viewer.
    viewer = new Marzipano.Viewer(viewerHTML, viewerOpts)

    // Create scenes.
    scenes = data.scenes.map(function(data) {
      var urlPrefix = "./tiles"
      var source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" })
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
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch })
      })

      // Create info hotspots.
      data.infoHotspots.forEach(function(hotspot) {
        var element = createInfoHotspotElement(hotspot)
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch })
      })

      return {
        data: data,
        scene: scene,
        view: view
      }
    })

    // Set up autorotate, if enabled.
    autoRotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI/2
    })

    // Display the initial scene.
    switchScene(scenes[0])
  });

  const getPitchYaw = (e: MouseEvent) => {
    if (!viewer) return

    var view = viewer.view() as any
    console.log(view.screenToCoordinates({x : e.x, y: e.y}))
  }

  const panoEventMouseDown = (e: Event) => {
    $hold = true
  }

  const panoEventMouseUp = (e: Event) => {
    $hold = false
  }
</script>

<svelte:head>
  <title>Sample Tour | Image 360</title>
  <meta name="description" content="A sample 360° tour created by the VietHungIt.">
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

<div id="pano" bind:this={viewerHTML}  class="w-full h-screen" on:dblclick={getPitchYaw}
  on:mousedown={panoEventMouseDown}
  on:mouseup={panoEventMouseUp}
/>

<div class="fixed bottom-0 left-0 right-0 bg-black/60 text-white select-none">
  <div class="text-center p-2">{currentScene.name}</div>

  <div class="absolute right-0 top-0 flex-none flex divide-x divide-transparent">
    {#if autoRotateCheck}
      <span class="icon w-10 h-10 p-2 bg-black cursor-pointer" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M9 9h6v6H9z"></path></svg>
      </span>
    {:else}
      <span class="icon w-10 h-10 p-2 bg-black cursor-pointer" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="m9 17 8-5-8-5z"></path></svg>
      </span>
    {/if}

    {#if !fullScreen}
      <span class="icon w-10 h-10 p-2 bg-black cursor-pointer" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z"></path></svg>
      </span>
    {:else}
      <span class="icon w-10 h-10 p-2 bg-black cursor-pointer" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z"></path></svg>
      </span>
    {/if}
  </div>
</div>


<div class="fixed w-full h-screen top-0 left-0 pointer-events-none">
  <Anim />
</div>

<style>
  :global(#pano > canvas ~ div) {
    overflow: hidden !important;
  }
</style>
