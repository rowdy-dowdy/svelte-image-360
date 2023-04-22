<script lang="ts">
  import { onMount } from "svelte";
  //@ts-ignore
  import Marzipano from "marzipano";
  import IconHotsport from "$lib/web/icon-hotsport.svelte";

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
		let toolbarComponent = new IconHotsport({
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
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create hotspot/tooltip header.
    var header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    // Create image element.
    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = './img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    // Create title element.
    var titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    var title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    // Create close element.
    var closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    var closeIcon = document.createElement('img');
    closeIcon.src = './img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    // Construct header element.
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    // Create text element.
    var text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    var modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };

    // Show content when hotspot is clicked.
    wrapper.querySelector('.info-hotspot-header')?.addEventListener('click', toggle)

    // Hide content when close icon is clicked.
    modal.querySelector('.info-hotspot-close-wrapper')?.addEventListener('click', toggle)

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
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
    /// Create viewer.
    viewer = new Marzipano.Viewer(viewerHTML, viewerOpts);

    // Create scenes.
    scenes = data.scenes.map(function(data) {
      var urlPrefix = ".";
      var source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}." + data.type,
        { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview." + data.type });
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
      // data.infoHotspots.forEach(function(hotspot) {
      //   var element = createInfoHotspotElement(hotspot);
      //   scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      // });

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
