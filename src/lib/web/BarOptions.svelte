<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createEventDispatcher } from 'svelte';
  import { allowedPlayAduio, showListScene, videoShow } from "../../stores/pano";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { fly, scale } from "svelte/transition";
  import type { Viewer } from "@photo-sphere-viewer/core";
  import { setting } from "$lib/admin/settings";
  //@ts-ignore
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';
  import type { GroupScene } from "@prisma/client";

	const dispatch = createEventDispatcher()

  export let viewer: Viewer | null
  export let autoRotateCheck: boolean
  export let currentScene: SceneDataType
  export let scenes: SceneDataType[]
  export let groups: GroupScene[]

  let fullScreen = false
  let showDescription = false
  let showMoreOptions = false

  let prevScene: SceneDataType | null = null
  let nextScene: SceneDataType | null = null
  let nextGroup: GroupScene | null = null

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }

  const exitHandler = () => {
    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen && !(document as any).mozFullScreen && !(document as any).msFullscreenElement) {
      fullScreen = false
    }
    else {
      fullScreen = true
    }
  }

  const toggleAutorotate = () => {
    dispatch('toggleAutorotate')
  }

  let mainAudio: HTMLMediaElement | null = null
  let mainAudioCheck = false

  const toogleMainAudio = (play?: boolean) => {
    if (play != undefined) {
      play ? mainAudio?.play() : mainAudio?.pause()
      mainAudioCheck = play
      return
    }

    if (mainAudioCheck) {
      mainAudio?.pause()
      mainAudioCheck = false
    }
    else {
      mainAudio?.play()
      mainAudioCheck = true
    }
  }

  let sceneAudio: HTMLMediaElement | null = null
  let sceneAudioCheck = false
  let sceneAudioTime = 0
  let sceneAudioDuration = 0
  let sceneAudioEnded = false

  const toogleSceneAudio = (play?: boolean) => {
    if (play != undefined) {
      play ? sceneAudio?.play() : sceneAudio?.pause()
      sceneAudioCheck = play
      return
    }

    if (sceneAudioCheck) {
      sceneAudio?.pause()
      sceneAudioCheck = false
    }
    else {
      sceneAudio?.play()
      sceneAudioCheck = true
    }
  }

  // $: if (sceneAudioEnded) {
  //   sceneAudioCheck = false
  // }

  $: watchChangeSceneAudio(sceneAudio, currentScene)
  $: watchChangeAllowedPlayAudio($allowedPlayAduio)

  const watchChangeSceneAudio = (sceneAudio: HTMLMediaElement | null, currentScene: SceneDataType) => {
    if (sceneAudio && currentScene.audio) {
      if($allowedPlayAduio) {
        // sceneAudio.pause()
        sceneAudio.src = currentScene.audio
        sceneAudio.load()
        if (sceneAudioCheck)
          toogleSceneAudio(true)
      }
    } else {
      toogleSceneAudio(false)
    }
  }

  const watchChangeAllowedPlayAudio = (allowedPlayAduio: boolean) => {
    if(allowedPlayAduio) {
      toogleMainAudio(true)

      if (sceneAudio && currentScene.audio) {
        sceneAudio.src = currentScene.audio
        sceneAudio.load()
        setTimeout(() => {
          toogleSceneAudio(true)
        }, 2500);
      }
    }
  }

  $: changeVideoShow($videoShow)

  let mainAudioAfterVideoShow = true
  let sceneAudioAfterVideoShow = true
  const changeVideoShow = (videoShow: string | null) => {
    if (videoShow != null) {
      mainAudioAfterVideoShow = mainAudioCheck
      sceneAudioAfterVideoShow = sceneAudioCheck
      toogleMainAudio(false)
      toogleSceneAudio(false)
    }
    else {
      if (mainAudioAfterVideoShow) { 
        toogleMainAudio(true)
      }
      if (sceneAudioAfterVideoShow) { 
        toogleSceneAudio(true)
      }
    }
  }

  // screen shot
  const screenShot = () => {
    viewer?.addEventListener('render', () => {
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      // @ts-ignore
      link.href = viewer?.renderer.renderer.domElement.toDataURL();
      link.click();
    }, { once: true });
    viewer?.needsUpdate();
  }

  // next scene
  $: findNextScene(currentScene)

  const findNextScene = (currentScene: SceneDataType) => {
    let index = scenes.findIndex(v => v.id == currentScene.id)

    prevScene = index > 0 ? scenes[index - 1] : null

    nextScene = (index < scenes.length - 1) ? scenes[index + 1] : null

    if (nextScene?.groupId != nextGroup?.id) {
      nextGroup = groups.find(v => v.id == nextScene?.groupId) || null
    }
    else {
      nextGroup = null
    }
  }

  findNextScene(currentScene)

  onMount(() => {
    document.addEventListener('fullscreenchange', exitHandler)
    document.addEventListener('webkitfullscreenchange', exitHandler)
    document.addEventListener('mozfullscreenchange', exitHandler)
    document.addEventListener('MSFullscreenChange', exitHandler)

    if ($allowedPlayAduio) {
      if (sceneAudio && currentScene.audio) {
        sceneAudio.pause()
        sceneAudio.src = currentScene.audio
        sceneAudio.load()
      }

      toogleMainAudio(true)
      // toogleSceneAudio(true)
    }

    let lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery a',
      // children: 'a',
      pswpModule: () => import('photoswipe'),
    })

    lightbox.init()
  })

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', exitHandler)
    document.removeEventListener('webkitfullscreenchange', exitHandler)
    document.removeEventListener('mozfullscreenchange', exitHandler)
    document.removeEventListener('MSFullscreenChange', exitHandler)
  })
</script>

<audio src="{setting("main audio")}" bind:this={mainAudio} class="sr-only" loop></audio>
<audio bind:this={sceneAudio} bind:ended={sceneAudioEnded} class="sr-only"></audio>
<!-- <audio bind:this={sceneAudio} bind:currentTime={sceneAudioTime} 
  bind:duration={sceneAudioDuration} bind:ended={sceneAudioEnded} class="sr-only"></audio> -->

<div class="absolute left-0 right-0 bottom-0 z-10 p-2 pointer-events-none">
  {#if showDescription}
    <div 
      in:fly="{{ y: 50, duration: 500 }}"
      out:scale="{{ start: .8, duration: 500 }}" 
      class="absolute w-screen right-0 bottom-0 sm:right-4 sm:bottom-16 sm:w-80 max-h-[24rem] z-10 rounded bg-gradient-to-br from-sky-400
        to-teal-500 flex flex-col items-center pointer-events-auto text-white"
    >
      <div class="w-full flex-grow min-h-0 py-4 px-4 overflow-y-auto whitespace-pre-wrap custom-bar">
        {currentScene.description || "Chưa có mô tả"}
      </div>

      <div class="p-2 flex items-center justify-center cursor-pointer"
        on:click={() => showDescription = false}
      >
        <span class="material-symbols-outlined">
          expand_more
        </span>
      </div>
    </div>
  {/if}

  <div class="flex space-x-4 items-end">
    <div class="icon"
      on:click={() => $showListScene = !$showListScene}
    >
      <span class="material-symbols-outlined">
        {mainAudioCheck ? 'menu' : 'menu_open'}
      </span>
    </div>

    <div class="!ml-auto"></div>

    <div class="relative w-20 h-20 sm:w-32 sm:h-32 select-none pointer-events-auto">
      <button class="w-full h-full rounded-full"
        on:click|preventDefault={() => toogleSceneAudio()}
      >
        <img src="/images/{(sceneAudioEnded ? false : sceneAudioCheck) ? 'voice_on.png' : 'voice_off.png'}" alt="" class="w-full h-full">
      </button>

      <div class="icon absolute top-0 left-0 border-2 border-white"
        on:click={() => showDescription = !showDescription}
      >
        <span class="material-symbols-outlined">
          info_i
        </span>
      </div>
    </div>

    <div class="flex flex-col space-y-2 select-none">
      <div id="gallery" class="flex flex-col space-y-2 opacity-0 invisible translate-y-11 transition-all 
        {showMoreOptions ? '!opacity-100 !visible !translate-y-0' : ''}">
        <a href="{setting("so do")}" class="icon block"
          data-pswp-width="10000" 
          data-pswp-height="10000" 
          target="_blank"
          rel="noreferrer"
        >
          <span class="material-symbols-outlined">
            location_on
          </span>
        </a>

        <div class="icon"
          on:click={() => screenShot()}
        >
          <span class="material-symbols-outlined">
            photo_camera
          </span>
        </div>

        <div class="icon"
          on:click={() => toogleMainAudio()}
        >
          <span class="material-symbols-outlined">
            {mainAudioCheck ? 'volume_up' : 'no_sound'}
          </span>
        </div>

        <div class="icon"
          on:click={() => toggleAutorotate()}
        >
          <span class="material-symbols-outlined">
            {autoRotateCheck ? 'sync' : 'sync_disabled'}
          </span>
        </div>

        <div class="icon"
          on:click={() => toggleFullScreen()}
        >
          <span class="material-symbols-outlined">
            {fullScreen ? 'zoom_out_map' : 'zoom_in_map'}
          </span>
        </div>
      </div>

      <div class="icon"
        on:click={() => showMoreOptions = !showMoreOptions}
      >
        <span class="material-symbols-outlined">
          more_horiz
        </span>
      </div>
    </div>
  </div>
</div>

<!-- <div class="absolute w-full h-full top-0 left-0 bg-green-400"></div> -->

<div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
  <div class="flex flex-col justify-center items-center space-y-2">
    {#if nextScene}
      {#if nextGroup}
        <a href="/{nextScene.slug}" class="px-4 py-2 rounded-full shadow flex items-center
          bg-gradient-to-t from-gray-400 via-gray-200 to-gray-100 text-sm font-semibold"
        >
          {nextGroup.name}
          <span class="material-symbols-outlined !-mr-2">
            navigate_next
          </span>
        </a>
      {:else}
      <a href="/{nextScene.slug}" class="block"><img src="/images/tien.svg" class="w-8 h-8"></a>
      {/if}
    {/if}

    {#if prevScene}
      <a href="/{prevScene.slug}" class="block"><img src="/images/lui.svg" class="w-8 h-8"></a>
    {/if}
  </div>
</div>

{#if nextScene}
  <div class="absolute right-0 top-1/2 -translate-y-1/2 z-10">
    <a href="/{nextScene.slug}" class="w-40 p-2 pr-0.5 rounded-l-lg bg-black/40 text-white flex space-x-2 items-center text-sm">
      <div class="flex-grow min-w-0 flex flex-col items-center justify-center text-center space-y-1">
        <p>Điểm đến tiếp:</p>
        <p class="font-semibold">{nextScene.name}</p>
      </div>
      <div class="flex-none w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center">
        <span class="material-symbols-outlined !text-3xl">
          arrow_forward
        </span>
      </div>
    </a>
  </div>
{/if}

<style lang="postcss">
  .icon {
    @apply w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-700 hover:bg-sky-600 text-white 
      flex items-center justify-center cursor-pointer pointer-events-auto select-none;
  }

  .icon .material-symbols-outlined {
    @apply !text-xl sm:!text-2xl;
  }

  /* .bar-icon {
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
    -webkit-transform: translate3d(0,0,0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000;
    transform: translate3d(0,0,0);
    transform: translateZ(0);
    
    @apply rounded p-1.5 text-white bg-black/50 grid place-items-center 
      pointer-events-auto hover:bg-white/50 hover:text-gray-800 transition-colors;
  }
  .bar-icon .material-symbols-outlined {
    @apply !text-[28px];
  } */

  .custom-bar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-bar::-webkit-scrollbar-thumb {
    background: rgba(90, 90, 90);
  }

  .custom-bar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  :global(.pswp img) {
    max-width: none;
    object-fit: contain;
  }
</style>