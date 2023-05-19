<script lang="ts">
  import { onMount } from "svelte";
  import Marzipano from "marzipano";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";

  export let data

  let viewerHTML: HTMLElement | null = null;
  let viewer: any = null;
  let scenes: any[] = []
  let autorotate: any = null

  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  function startAutorotate() {
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function createLinkHotspotElement(hotspot: any) {
    var wrapper = document.createElement('div')
		let toolbarComponent = new LinkHotspot({
			target: wrapper,
			props: {}
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

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot: any) {
    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div')

		let toolbarComponent = new InfoHotSpot({
			target: wrapper,
			props: {}
		})

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper)

    return wrapper
  }

  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element: HTMLElement) {
    var eventList = [
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'wheel'
    ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event: Event) {
        event.stopPropagation();
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
    // updateSceneName(scene);
    // updateSceneList(scene);
  }

  onMount(() => {
    if (!viewerHTML) return
    /// Create viewer.
    viewer = new Marzipano.Viewer(viewerHTML, viewerOpts);

    // Create scenes.
    scenes = data.scenes.map(function(data) {
      var urlPrefix = "./tiles";
      var source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
      var geometry = new Marzipano.CubeGeometry(data.levels);

      var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
      var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

      var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });

      // Create link hotspots.
      data.linkHotspots.forEach(function(hotspot) {
        var element = createLinkHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      // Create info hotspots.
      data.infoHotspots.forEach(function(hotspot) {
        var element = createInfoHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      return {
        data: data,
        scene: scene,
        view: view
      };
    });

    // Set up autorotate, if enabled.
    autorotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI/2
    });

    scenes.forEach(function(scene) {
      var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
      if (!el) return

      el.addEventListener('click', function() {
        switchScene(scene)
      });
    });

    // Display the initial scene.
    switchScene(scenes[0])
  });

  const getPitchYaw = (e: MouseEvent) => {
    var view = viewer.view();
    console.log(view.screenToCoordinates({x : e.x, y: e.y}))
  }
</script>

<svelte:head>
  <title>Sample Tour | Image 360</title>
  <meta name="description" content="A sample 360° tour created by the VietHungIt.">
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="pano" bind:this={viewerHTML} class="w-full h-screen" on:dblclick={getPitchYaw}/>

<style>
  :global(#pano > canvas ~ div) {
    overflow: hidden !important;
  }
</style>
