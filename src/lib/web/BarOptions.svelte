<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createEventDispatcher } from 'svelte';
  import { allowedPlayAduio, showListScene } from "../../stores/pano";
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

  const toogleMainAduio = (play?: boolean) => {
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

  const toogleSceneAduio = (play?: boolean) => {
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
      toogleSceneAduio(true)
    }
  } else {
    toogleSceneAduio(false)
  }

  $: if($allowedPlayAduio) {
    toogleMainAduio(true)
    toogleSceneAduio(true)
  }

  let showDescription = false

  const toogleListScene = () => {
    $showListScene = !$showListScene
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

      toogleMainAduio(true)
      // toogleSceneAduio(true)
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
<audio bind:this={sceneAudio} bind:currentTime={sceneAudioTime} 
  bind:duration={sceneAudioDuration} bind:ended={sceneAudioEnded} class="sr-only"></audio>

<div class="fixed right-0 bottom-0">
  <div class="flex flex-col">
    <div class="relative w-20 h-20 md:w-32 md:h-32">
      <div class="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Anim src="/lotties/hello.json" />
      </div>
      <button class="absolute left-[43%] top-[60%] md:left-[48%] md:top-[65%] text-white" 
        on:click|preventDefault={() => toogleSceneAduio()}
      >
        <span class="material-symbols-outlined">
          {sceneAudioCheck ? 'mic' : 'mic_off'}
        </span>
      </button>
    </div>
    <div class="w-full px-4 pb-2">
      <Progressbar color="green" progress={((sceneAudioTime / sceneAudioDuration) * 100).toString() || "0"} size="h-1.5" />
    </div>
  </div>
  <!-- <div class="relative w-20 md:w-32">
    <div class="absolute w-40 h-40 right-0 bottom-0 rounded-full bg-gradient-to-br from-sky-300 to-teal-400
      translate-x-[10%] translate-y-[10%]"></div>
    <div class="absolute right-0 bottom-2">
      <div class="flex flex-col">
        <div class="relative w-20 h-20 md:w-32 md:h-32 right-0 bottom-0 overflow-hidden cursor-pointer"
          on:click={() => toogleSceneAduio()}
        >
          <div class="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Anim src="/lotties/hello.json" />
          </div>
          <div class="icon w-[20%] p-1 pt-2 absolute left-[55%] -translate-x-1/2 bottom-[16%] bg-[#4691fb] text-white">
            {#if sceneAudioCheck}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"></path><path d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .38-.116c.026-.015.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z"></path></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m21.707 20.293-2.023-2.023A9.566 9.566 0 0 0 21.999 12c0-4.091-2.472-7.453-5.999-9v2c2.387 1.386 3.999 4.047 3.999 7a8.113 8.113 0 0 1-1.672 4.913l-1.285-1.285C17.644 14.536 18 13.19 18 12c0-1.771-.775-3.9-2-5v7.586l-2-2V4a1 1 0 0 0-1.554-.832L7.727 6.313l-4.02-4.02-1.414 1.414 18 18 1.414-1.414zM12 5.868v4.718L9.169 7.755 12 5.868zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20v-1.879l-2-2v2.011l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9h.879L3.102 7.223A1.995 1.995 0 0 0 2 9v6c0 1.103.897 2 2 2z"></path></svg>
            {/if}
          </div>
        </div>
        <div class="w-full px-4">
          <Progressbar progress={((sceneAudioTime / sceneAudioDuration) * 100).toString() || "0"} size="h-1.5" />
        </div>
      </div>
    </div>
  </div> -->
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
    
    <button class="bar-icon" on:click={() => toogleMainAduio()}>
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