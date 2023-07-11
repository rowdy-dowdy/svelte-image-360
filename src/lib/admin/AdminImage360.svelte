<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";
  import InfoHotSpot from "$lib/web/InfoHotSpot.svelte";
  import InfoHotSpot2 from "$lib/web/InfoHotSpot2.svelte";
  import InfoHotSpotVideo from "$lib/web/InfoHotSpotVideo.svelte";
  import { hold, videoShow } from "../../stores/pano.js";
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
  import { Viewer } from "@photo-sphere-viewer/core";
  import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
  import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
  import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
  import "@photo-sphere-viewer/core/index.css"
  import "@photo-sphere-viewer/markers-plugin/index.css"
  import "$lib/admin/tinymce.css"

  export let sceneId: string | null
  export let data: SceneDataType[]
  export let groups: GroupScene[]

  let viewerHTML: HTMLElement | null = null
  let viewer: Viewer | null = null

  let currentScene: SceneDataType | null = null
  let fullScreen = false
  let autoRotateCheck = false
  let markersPlugin: MarkersPlugin | null
  let autoRotate: AutorotatePlugin | null
  let isMount = false

  // web
  $: currentScene = data.find(v => v.id == sceneId) || null
  $: changeScene(sceneId)
  $: changeDataScene(data)

  const changeScene = (id: string | null) => {
    if (!isMount) return
    let scene = data.find(v => v.id == id)
    if (scene) {
      autoRotate?.setOptions({
        autorotatePitch: scene.initialViewParameters.pitch
      })
      switchScene(scene)
    }
  }

  const changeDataScene = async (data: SceneDataType[]) => {
    if (currentScene && isMount) {
      console.log(currentScene.id, sceneId)
      await new Promise(res => {
        markersPlugin?.clearMarkers()
        res(true)
      })
      createLinkHotspotElements(currentScene.linkHotspots)
      createInfoHotspotElements(currentScene.infoHotspots)
    }
  }

  const findSceneDataById = (id: string ) => data.find(v => v.id == sceneId)

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

  function toggleAutorotate() {
    if (autoRotateCheck) {
      autoRotate?.stop()
      autoRotateCheck = false
    } else {
      autoRotate?.start()
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
 
  function createLinkHotspotElements(hotspots: LinkHotspots[]) {
    hotspots.forEach(hotspot => {
      let wrapper = document.createElement('div'),
        tooltip = undefined,
        html = undefined,
        image = undefined,
        size = { width: 0, height: 0 }

      if (hotspot?.type == "2") {
        tooltip = findSceneDataById(hotspot.target)?.name || ""
        image = '/images/flycam.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "3") {
        tooltip = findSceneDataById(hotspot.target)?.name || ""
        image = '/images/arrow.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "4") {
        new LinkHotspot4({
          target: wrapper,
          props: {
            title: findSceneDataById(hotspot.target)?.name || ""
          }
        })
        html = wrapper.innerHTML
      }
      else {
        new LinkHotspot({
          target: wrapper,
          props: {
            title: findSceneDataById(hotspot.target)?.name || "",
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
          target: hotspot.target
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
        size = { width: 0, height: 0 },
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
        size: size,
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
  
  // add hotspot modal
  let showFormModalAdd = false
  let coordinatesAdd = { yaw: 0, pitch: 0 }

  // delete hotspot modal
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

  // edit hotspot modal
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

  // delete scene modal
  let popupDeleteScene = false
  let valueDeleteScene: string | null = null
  const deleteScene = () => {
    valueDeleteScene = sceneId
    popupDeleteScene = true
  }

  // edit scene modal
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

    let _params = viewer.getPosition()
    const initialViewParameters = { pitch: _params.pitch, yaw: _params.yaw, zoom: viewer.getZoomLevel() }
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

  onMount(() => {
    if (!viewerHTML) return

    viewer = new Viewer({
      container: viewerHTML,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: true,
          autorotatePitch: currentScene?.initialViewParameters.pitch,
          autorotateSpeed: '0.5rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: currentScene?.initialViewParameters.pitch,
      defaultYaw: currentScene?.initialViewParameters.yaw,
      defaultZoomLvl: currentScene?.initialViewParameters.zoom,

      touchmoveTwoFingers: true,
      panorama: {
        width: currentScene?.faceSize,
        cols: 16,
        rows: 8,
        baseUrl: `/storage/tiles/${currentScene?.id}/low.jpg`,
        tileUrl: (col: number, row: number) => {
          return `/storage/tiles/${currentScene?.id}/${row}_${col}.jpg`
        },
      },
    })

    markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
    autoRotate = viewer.getPlugin(AutorotatePlugin) as AutorotatePlugin

    if (data.length > 0) {
      createLinkHotspotElements(currentScene?.linkHotspots || [])
      createInfoHotspotElements(currentScene?.infoHotspots || [])
    }

    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      if (marker.data?.type == "link" && marker.data?.target) {
        sceneId = marker.data?.target
      }
      
      if (marker.data?.type == "info") {
        if (marker.data?.video) {
          $videoShow = marker.data?.video
        }
      }
    })

    viewer.addEventListener('dblclick', ({ data }) => {
      coordinatesAdd = {
        yaw: data.yaw,
        pitch: data.pitch
      }

      showFormModalAdd = true
    })

    isMount = true
  })

  onDestroy(() => {
    // if(viewer)
    //   viewer.destroy()
  })
</script>

<div id="viewer" bind:this={viewerHTML}  class="w-full h-full"/>

<div class="options-bar absolute bottom-0 left-0 right-0 bg-black/60 text-white select-none z-10">
  <div class="absolute left-0 top-0 flex-none flex divide-x divide-transparent">
    <span class="icon w-10 h-10 p-2 bg-sky-600 cursor-pointer" on:click={editScene}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path><path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path></svg>
    </span>

    <span class="icon w-10 h-10 p-2 bg-red-600 cursor-pointer" on:click={deleteScene}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path></svg>
    </span>
    
  </div>
  <div class="text-center p-2">{currentScene?.name}</div>

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

<ModelAddHotspot bind:showFormModalAdd={showFormModalAdd} bind:coordinatesAdd={coordinatesAdd} bind:scenes={data} bind:sceneId={sceneId}/>

{#if currentScene}
  <div class="absolute top-0 right-0 p-4 z-10">
    <Button class="gap-2">
      Danh sách điểm nóng
      <Indicator color="none" class="bg-primary-200 text-xs text-primary-800 font-semibold" size="lg"
        >{currentScene.infoHotspots.length + currentScene.linkHotspots.length}</Indicator>
    </Button>
    <Dropdown class="w-96 overflow-y-auto py-1 max-h-[500px]" placement="bottom-end">
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
{/if}

<ModelDeleteHotspot bind:popupDeleteHotspot={popupDeleteHotspot} bind:valueDeleteHotspot={valueDeleteHotspot} />
<ModelEditHotspot bind:scenes={data} bind:valueEditHotspot={valueEditHotspot} bind:showFormModalEdit={showFormModalEdit} />

<ModelDeleteScene bind:popupDelete={popupDeleteScene} bind:valueDelete={valueDeleteScene} />
<ModelEditScene bind:hidden={hiddenPopupEditScene} bind:data={valueEditScene} bind:groups={groups} />

<style lang="postcss">
  :global(.psv-panel-content) {
    backdrop-filter: blur(20px);
    /* all: unset; */
    color: #fff;
    padding: 1rem;
    overflow-y: auto;
  }

  :global(.psv-panel-content *) {
    /* all: unset; */
    word-wrap: break-word;
  }
</style>