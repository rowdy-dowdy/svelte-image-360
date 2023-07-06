<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createEventDispatcher } from 'svelte';
  import { allowedPlayAduio, showListScene, videoShow } from "../../stores/pano";
  import Anim from "./Anim.svelte";
  import { Progressbar } from "flowbite-svelte";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { fly, scale } from "svelte/transition";
  import { page } from '$app/stores';
  import type { Setting } from "@prisma/client";

	const dispatch = createEventDispatcher()

  export let autoRotateCheck: boolean
  export let currentScene: SceneDataType
  export let settingMainAudio: Setting | undefined

  let fullScreen = false

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

  $: if (sceneAudioEnded) {
    sceneAudioCheck = false
  }

  $: if (sceneAudio && currentScene.audio) {
    if($allowedPlayAduio) {
      // sceneAudio.pause()
      sceneAudio.src = currentScene.audio
      sceneAudio.load()
      toogleSceneAudio(true)
    }
  } else {
    toogleSceneAudio(false)
  }

  $: if($allowedPlayAduio) {
    toogleMainAudio(true)
    toogleSceneAudio(true)
  }

  let showDescription = false

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
      console.log(mainAudioAfterVideoShow, sceneAudioAfterVideoShow)
      if (mainAudioAfterVideoShow) { 
        toogleMainAudio(true)
      }
      if (sceneAudioAfterVideoShow) { 
        toogleSceneAudio(true)
      }
    }
  }

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
  })

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', exitHandler)
    document.removeEventListener('webkitfullscreenchange', exitHandler)
    document.removeEventListener('mozfullscreenchange', exitHandler)
    document.removeEventListener('MSFullscreenChange', exitHandler)
  })
</script>

<audio src="{settingMainAudio?.value}" bind:this={mainAudio} class="sr-only" loop></audio>
<audio bind:this={sceneAudio} bind:ended={sceneAudioEnded} class="sr-only"></audio>
<!-- <audio bind:this={sceneAudio} bind:currentTime={sceneAudioTime} 
  bind:duration={sceneAudioDuration} bind:ended={sceneAudioEnded} class="sr-only"></audio> -->

<div class="fixed right-0 bottom-0">
  <div class="flex flex-col">
    <div class="relative w-20 h-20 md:w-32 md:h-32">
      <div class="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Anim src="/lotties/hello.json" />
      </div>
      <button class="absolute left-[43%] top-[60%] md:left-[48%] md:top-[65%] text-white" 
        on:click|preventDefault={() => toogleSceneAudio()}
      >
        <span class="material-symbols-outlined">
          {sceneAudioCheck ? 'mic' : 'mic_off'}
        </span>
      </button>
    </div>
    <!-- <div class="w-full px-4 pb-2">
      <Progressbar color="green" progress={((sceneAudioTime / sceneAudioDuration) * 100).toString() || "0"} size="h-1.5" />
    </div> -->
  </div>
</div>

<div class="fixed top-0 right-0 pointer-events-none p-2 flex items-start space-x-4">
  {#if showDescription}
    <div 
      in:fly="{{ y: -50, duration: 500 }}"
      out:scale="{{ start: .4, duration: 500 }}" 
      class="relative w-80 max-h-[24rem] z-10 rounded bg-gradient-to-br from-sky-400
        to-teal-500 flex flex-col items-center pointer-events-auto text-white"
    >
      <div class="w-full flex-grow min-h-0 py-4 px-4 overflow-y-auto whitespace-pre-wrap">
        {currentScene.description || "Chưa có mô tả"}
      </div>
      <span class="absolute top-4 right-4 flex-none cursor-pointer"
        on:click={() => showDescription = false}
      >
        <span class="material-symbols-outlined">
          close
        </span>
      </span>
    </div>
  {/if}

  <div class="flex flex-col space-y-3">
    <button class="bar-icon" on:click={() => toggleFullScreen()}>
      {#if fullScreen}
        <span class="material-symbols-outlined">
          zoom_out_map
        </span>
      {:else}
        <span class="material-symbols-outlined">
          zoom_in_map
        </span>
      {/if}
    </button>

    <button class="bar-icon" on:click={() => toggleAutorotate()}>
      {#if autoRotateCheck}
        <span class="material-symbols-outlined">
          sync
        </span>
      {:else}
        <span class="material-symbols-outlined">
          sync_disabled
        </span>
      {/if}
    </button>
    
    <button class="bar-icon" on:click={() => toogleMainAudio()}>
      {#if mainAudioCheck}
        <span class="material-symbols-outlined">
          volume_up
        </span>
      {:else}
        <span class="material-symbols-outlined">
          no_sound
        </span>
      {/if}
    </button>

    <button class="bar-icon" on:click={() => showDescription = !showDescription}>
      <span class="material-symbols-outlined">
        info_i
      </span>
    </button>
  </div>
  
</div>

<style lang="postcss">
  .bar-icon {
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
  }
</style>