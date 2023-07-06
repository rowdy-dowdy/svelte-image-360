<script lang="ts">
  import { onMount } from "svelte";
  import Marzipano, { Scene } from "marzipano";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";
  import InfoHotSpot2 from "$lib/web/InfoHotSpot2.svelte";
  import InfoHotSpotVideo from "$lib/web/InfoHotSpotVideo.svelte";
  import { hold } from "../../stores/pano.js";
  // import type { Scene } from "@prisma/client";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server.js";
  import type { LinkHotspots, InfoHotspots, GroupScene } from "@prisma/client";
  import { page } from "$app/stores";
  import { goto, invalidateAll } from "$app/navigation";
  import { Button, Dropdown, DropdownDivider, DropdownItem, Indicator, Modal } from "flowbite-svelte";
  import ModelAddHotspot from "./ModelAddHotspot.svelte";
  import ModelDeleteHotspot from "./ModelDeleteHotspot.svelte";
  import ModelEditHotspot from "./ModelEditHotspot.svelte";
  import ModelDeleteScene from "./ModelDeleteScene.svelte";
  import ModelEditScene from "./ModelEditScene.svelte";
  import LinkHotspot2 from "$lib/web/LinkHotspot2.svelte";
  import LinkHotspot3 from "$lib/web/LinkHotspot3.svelte";
  import { deserialize, enhance } from "$app/forms";
  import { append } from "svelte/internal";
  import { alertStore } from "../../stores/alert.js";
  import LinkHotspot4 from "$lib/web/LinkHotspot4.svelte";

  export let data: SceneDataType[]
  export let groups: GroupScene[]

  let viewerHTML: HTMLElement | null = null
  let viewer: Marzipano.Viewer | null = null

  type SceneType = {
    data: SceneDataType
    scene: Marzipano.Scene
    view: Marzipano.RectilinearView
  }

  let scenes: SceneType[] = []

  $: scenes = viewer ? data.map(function(data) {
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
  }) : [] as SceneType[]

  let currentScene = data[0] 
  let fullScreen = false
  let autoRotateCheck = false

  let autoRotate: Function | null = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: currentScene.initialViewParameters.pitch,
    targetFov: Math.PI/2
  })

  // web
  $: sceneId = $page.url.searchParams.get('scene')
  $: {
    let scene = scenes.find(v => v?.data.id == sceneId)
    if (scene) {
      switchScene(scene)
    }
    else {
      scenes.length > 0 ? goto('/admin/?scene='+scenes[0].data.id) : goto('/admin/')
    }
  }

  let showFormModalAdd = false
  let coordinatesAdd = { yaw: 0, pitch: 0 }

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

    if (hotspot?.type == "2") {
      let toolbarComponent = new LinkHotspot2({
        target: wrapper,
        props: {
          title: findSceneDataById(hotspot.target)?.name || ""
        }
      })
    }
    else if (hotspot?.type == "3") {
      let toolbarComponent = new LinkHotspot3({
			  target: wrapper,
        props: {
          title: findSceneDataById(hotspot.target)?.name || ""
        }
      })
    }
    else if (hotspot?.type == "4") {
      let toolbarComponent = new LinkHotspot4({
			  target: wrapper,
        props: {
          title: findSceneDataById(hotspot.target)?.name || ""
        }
      })
    }
    else {
      let toolbarComponent = new LinkHotspot({
			  target: wrapper,
        props: {
          title: findSceneDataById(hotspot.target)?.name || "",
          image: `/storage/tiles/${hotspot.target}/demo.jpg`
        }
      })
    }

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

    if (hotspot.type == "2") {
      let toolbarComponent = new InfoHotSpot2({
        target: wrapper,
        props: {
          title: hotspot?.title || "",
          video: hotspot?.video || "",
        }
      })
    }
    else {
      let toolbarComponent = new InfoHotSpot({
        target: wrapper,
        props: {
          title: hotspot?.title || ""
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
    // stopAutorotate()
    scene.view.setParameters(scene.data.initialViewParameters)
    scene.scene.switchTo()
    // startAutorotate()
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

  const toggleFullScreen = () => {
    if (!fullScreen) {
      document.documentElement.requestFullscreen()
      fullScreen = true
    }
    else {
      document.exitFullscreen()
      fullScreen = false
    }
  }

  onMount(() => {
    if (!viewerHTML) return
    /// Create viewer.
    viewer = new Marzipano.Viewer(viewerHTML, {
      controls: {
        mouseViewMode: "drag"
      }
    })
  });

  const getPitchYaw = (e: MouseEvent) => {
    if (!viewer) return

    var rect = (e.target as HTMLElement).getBoundingClientRect()
    let coordinates = (viewer.view() as any).screenToCoordinates({x : e.clientX - rect.left, y: e.clientY - rect.top})

    coordinatesAdd = {
      yaw: coordinates.yaw,
      pitch: coordinates.pitch
    }

    console.log({coordinates})

    showFormModalAdd = true
  }

  const panoEventMouseDown = (e: Event) => {
    $hold = true
  }

  const panoEventMouseUp = (e: Event) => {
    $hold = false
  }

  let popupDeleteHotspot = false
  let valueDeleteHotspot: {
    id: string
    type: 'link' | 'info'
  } | null = null
  const deleteHotspot = (id: string, type: 'link' | 'info') => {
    valueDeleteHotspot = {
      id,
      type
    }
    popupDeleteHotspot = true
  }

  let showFormModalEdit = false
  let valueEditHotspot: {
    type: 'info' | "link"
    value: LinkHotspots | InfoHotspots
  } | null = null
  const editHotspot = (value: LinkHotspots | InfoHotspots, type: 'link' | 'info') => {
    valueEditHotspot = {
      type,
      value
    }
    showFormModalEdit = true
  }

  let popupDeleteScene = false
  let valueDeleteScene: string | null = null
  const deleteScene = () => {
    valueDeleteScene = sceneId
    popupDeleteScene = true
  }

  let hiddenPopupEditScene = true
  let valueEditScene: SceneDataType | null = null
  const editScene = () => {
    valueEditScene = currentScene
    hiddenPopupEditScene = false
  }

  const updateInitialViewParametersScene = async () => {
    if (!viewer) return

    let data = new FormData()
    data.append('id', sceneId || "")

    let _params = (viewer.view() as any)._params
    const initialViewParameters = { pitch: _params.pitch, yaw: _params.yaw, fov: _params.fov }
    data.append('initialViewParameters', JSON.stringify(initialViewParameters))
    
    const res = await fetch('/admin?/updateInitialViewParametersScene', {
      method: 'post',
      body: data
    })

    const result = deserialize(await res.text());

    if (result.type === 'success') {
      await invalidateAll()

      alertStore.addAlert({
        type: 'success'
      })
    }
    else {
      alertStore.addAlert({
        type: 'error'
      })
    }
  }
</script>

<svelte:head>
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

<div id="pano" bind:this={viewerHTML}  class="w-full h-full" on:dblclick={getPitchYaw}
  on:mousedown={panoEventMouseDown}
  on:mouseup={panoEventMouseUp}
/>

<div class="options-bar absolute bottom-0 left-0 right-0 bg-black/60 text-white select-none">
  <div class="absolute left-0 top-0 flex-none flex divide-x divide-transparent">
    <span class="icon w-10 h-10 p-2 bg-sky-600 cursor-pointer" on:click={editScene}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path><path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path></svg>
    </span>

    <span class="icon w-10 h-10 p-2 bg-red-600 cursor-pointer" on:click={deleteScene}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path></svg>
    </span>
    
  </div>
  <div class="text-center p-2">{currentScene.name}</div>

  <div class="absolute right-0 top-0 flex-none flex divide-x divide-transparent">
    <form method="post" on:submit|preventDefault={updateInitialViewParametersScene}>
      <button type="submit" class="icon w-10 h-10 p-2 bg-blue-500 hover:bg-blue-400 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ><path d="M5 21h14a2 2 0 0 0 2-2V8a1 1 0 0 0-.29-.71l-4-4A1 1 0 0 0 16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zm10-2H9v-5h6zM13 7h-2V5h2zM5 5h2v4h8V5h.59L19 8.41V19h-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5H5z"></path></svg>
      </button>
    </form>

    {#if autoRotateCheck}
      <span class="icon w-10 h-10 p-2 bg-black hover:bg-gray-600 cursor-pointer" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M9 9h6v6H9z"></path></svg>
      </span>
    {:else}
      <span class="icon w-10 h-10 p-2 bg-black hover:bg-gray-600 cursor-pointer" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="m9 17 8-5-8-5z"></path></svg>
      </span>
    {/if}

    {#if !fullScreen}
      <span class="icon w-10 h-10 p-2 bg-black hover:bg-gray-600 cursor-pointer" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z"></path></svg>
      </span>
    {:else}
      <span class="icon w-10 h-10 p-2 bg-black hover:bg-gray-600 cursor-pointer" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z"></path></svg>
      </span>
    {/if}
  </div>
</div>

<div class="absolute top-0 left-0 bg-black/60 text-white px-2 py-1">
  Nhấp đúp chuột để thêm mới điểm nóng
</div>

<ModelAddHotspot bind:showFormModalAdd={showFormModalAdd} bind:coordinatesAdd={coordinatesAdd} bind:scenes={data}/>

<div class="absolute top-0 right-0 p-4">
  <Button class="gap-2">
    Danh sách điểm nóng
    <Indicator color="none" class="bg-primary-200 text-xs text-primary-800 font-semibold" size="lg"
      >{currentScene.infoHotspots.length + currentScene.linkHotspots.length}</Indicator>
  </Button>
  <Dropdown class="w-96 overflow-y-auto py-1 max-h-[600px]" placement="bottom-end">
    {#if currentScene.infoHotspots.length + currentScene.linkHotspots.length == 0}
      <p class="px-4 py-2 text-center">Không có điểm nóng nào</p>
    {/if}

    {#each currentScene.linkHotspots as item (item.id)}
      <DropdownItem class="flex items-center text-base font-semibold gap-2 cursor-auto">
        <span class="flex-none icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.465 11.293c1.133-1.133 3.109-1.133 4.242 0l.707.707 1.414-1.414-.707-.707c-.943-.944-2.199-1.465-3.535-1.465s-2.592.521-3.535 1.465L4.929 12a5.008 5.008 0 0 0 0 7.071 4.983 4.983 0 0 0 3.535 1.462A4.982 4.982 0 0 0 12 19.071l.707-.707-1.414-1.414-.707.707a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l2.122-2.121z"></path><path d="m12 4.929-.707.707 1.414 1.414.707-.707a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.122 2.121c-1.133 1.133-3.109 1.133-4.242 0L10.586 12l-1.414 1.414.707.707c.943.944 2.199 1.465 3.535 1.465s2.592-.521 3.535-1.465L19.071 12a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0z"></path></svg></span>
        <span class="flex-grow min-w-0">{findSceneDataById(item.target)?.name || 'Liên kết'}</span>

        <span class="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
          on:click|preventDefault={() => editHotspot(item, 'link')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path><path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path></svg>
        </span>
        <span class="flex-none icon p-1 hover:text-red-600 cursor-pointer"
          on:click|preventDefault={() => deleteHotspot(item.id, 'link')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path></svg>
        </span>
      </DropdownItem>
    {/each}

    {#if currentScene.infoHotspots.length > 0 && currentScene.linkHotspots.length > 0}
      <DropdownDivider />
    {/if}

    {#each currentScene.infoHotspots as item (item.id)}
      <DropdownItem class="flex items-center text-base font-semibold gap-2 cursor-auto">
        <span class="flex-none icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg></span>
        <span class="flex-grow min-w-0">{item.title}</span>

        <span class="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
          on:click|preventDefault={() => editHotspot(item, 'info')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path><path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path></svg>
        </span>
        <span class="flex-none icon p-1 hover:text-red-600 cursor-pointer"
          on:click|preventDefault={() => deleteHotspot(item.id, 'info')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path></svg>
        </span>
      </DropdownItem>
    {/each}
  </Dropdown>
</div>

<ModelDeleteHotspot bind:popupDeleteHotspot={popupDeleteHotspot} bind:valueDeleteHotspot={valueDeleteHotspot} />
<ModelEditHotspot bind:scenes={data} bind:valueEditHotspot={valueEditHotspot} bind:showFormModalEdit={showFormModalEdit} />

<ModelDeleteScene bind:popupDelete={popupDeleteScene} bind:valueDelete={valueDeleteScene} />
<ModelEditScene bind:hidden={hiddenPopupEditScene} bind:data={valueEditScene} bind:groups={groups} />

<style>
  :global(#pano > canvas ~ div) {
    overflow: hidden !important;
  }
</style>
