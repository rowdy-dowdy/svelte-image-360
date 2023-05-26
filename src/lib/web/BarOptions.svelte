<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createEventDispatcher } from 'svelte';
  import { allowedPlayAduio } from "../../stores/pano";
  import Anim from "./Anim.svelte";
  import { Progressbar } from "flowbite-svelte";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { fly } from "svelte/transition";

	const dispatch = createEventDispatcher()

  export let autoRotateCheck: boolean
  export let currentScene: SceneDataType

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

  $: if (sceneAudio && currentScene.audio) {
    if($allowedPlayAduio) {
      // sceneAudio.pause()
      sceneAudio.src = currentScene.audio
      sceneAudio.load()
      toogleSceneAduio(true)
    }
  }

  $: if($allowedPlayAduio) {
    toogleMainAduio(true)
    toogleSceneAduio(true)
  }

  let showDescription = false

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

<audio src="./audios/main.mp3" bind:this={mainAudio} class="sr-only"></audio>
<audio bind:this={sceneAudio} bind:currentTime={sceneAudioTime} bind:duration={sceneAudioDuration} class="sr-only"></audio>

<div class="fixed bottom-0 left-0 right-0 bg-black/60 text-white select-none px-2 py-2">
  <div class="flex items-center space-x-2">
    <span class="bar-icon icon !mr-auto">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zM4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1z"></path></svg>
    </span>

    {#if mainAudioCheck}
      <span class="bar-icon icon" on:click={() => toogleMainAduio()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"></path><path d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697L14 21.868V2.132L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2z"></path></svg>
      </span>
    {:else}
      <span class="bar-icon icon" on:click={() => toogleMainAduio()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m7.727 6.313-4.02-4.02-1.414 1.414 18 18 1.414-1.414-2.02-2.02A9.578 9.578 0 0 0 21.999 12c0-4.091-2.472-7.453-5.999-9v2c2.387 1.386 3.999 4.047 3.999 7a8.13 8.13 0 0 1-1.671 4.914l-1.286-1.286C17.644 14.536 18 13.19 18 12c0-1.771-.775-3.9-2-5v7.586l-2-2V2.132L7.727 6.313zM4 17h2.697L14 21.868v-3.747L3.102 7.223A1.995 1.995 0 0 0 2 9v6c0 1.103.897 2 2 2z"></path></svg>
      </span>
    {/if}

    {#if autoRotateCheck}
      <span class="bar-icon icon" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m13 7.101.01.001a4.978 4.978 0 0 1 2.526 1.362 5.005 5.005 0 0 1 1.363 2.528 5.061 5.061 0 0 1-.001 2.016 4.976 4.976 0 0 1-1.363 2.527l1.414 1.414a7.014 7.014 0 0 0 1.908-3.54 6.98 6.98 0 0 0 0-2.819 6.957 6.957 0 0 0-1.907-3.539 6.97 6.97 0 0 0-2.223-1.5 6.921 6.921 0 0 0-1.315-.408c-.137-.028-.275-.043-.412-.063V2L9 6l4 4V7.101zm-7.45 7.623c.174.412.392.812.646 1.19.249.37.537.718.854 1.034a7.036 7.036 0 0 0 2.224 1.501c.425.18.868.317 1.315.408.167.034.338.056.508.078v2.944l4-4-4-4v3.03c-.035-.006-.072-.003-.107-.011a4.978 4.978 0 0 1-2.526-1.362 4.994 4.994 0 0 1 .001-7.071L7.051 7.05a7.01 7.01 0 0 0-1.5 2.224A6.974 6.974 0 0 0 5 12a6.997 6.997 0 0 0 .55 2.724z"></path></svg>
      </span>
    {:else}
      <span class="bar-icon icon" on:click={toggleAutorotate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M9 9h6v6H9z"></path></svg>
      </span>
    {/if}

    {#if !fullScreen}
      <span class="bar-icon icon" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z"></path></svg>
      </span>
    {:else}
      <span class="bar-icon icon" on:click={toggleFullScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z"></path></svg>
      </span>
    {/if}

    <div class="!ml-auto">
      <div class="relative">
        <span class="bar-icon icon" on:click={() => showDescription = !showDescription}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
        </span>

        {#if showDescription}
          <div transition:fly="{{ y: 200, duration: 500 }}" class="absolute bottom-10 right-0 w-80 max-h-[24rem] z-10 rounded bg-gradient-to-br from-sky-400 to-teal-500 flex flex-col items-center">
            <div class="w-full flex-grow min-h-0 py-4 px-4 overflow-y-auto whitespace-pre-wrap">
              {currentScene.description || "Chưa có mô tả"}
            </div>
            <span class="flex-none icon w-8 h-8 cursor-pointer"
              on:click={() => showDescription = false}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path></svg>
            </span>
          </div>
        {/if}
      </div>

      <div class="w-[9.5rem]"></div>
      
      <div class="absolute right-0 bottom-2">
        <div class="flex flex-col">
          <div class="relative w-32 h-32 right-0 bottom-0 overflow-hidden cursor-pointer"
            on:click={() => toogleSceneAduio()}
          >
            <div class="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Anim src="/lotties/robot.json" />
            </div>
            <div class="icon w-7 p-1 pt-2 absolute left-[55%] -translate-x-1/2 bottom-[16%] bg-[#4691fb]">
              {#if sceneAudioCheck}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"></path><path d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .38-.116c.026-.015.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z"></path></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m21.707 20.293-2.023-2.023A9.566 9.566 0 0 0 21.999 12c0-4.091-2.472-7.453-5.999-9v2c2.387 1.386 3.999 4.047 3.999 7a8.113 8.113 0 0 1-1.672 4.913l-1.285-1.285C17.644 14.536 18 13.19 18 12c0-1.771-.775-3.9-2-5v7.586l-2-2V4a1 1 0 0 0-1.554-.832L7.727 6.313l-4.02-4.02-1.414 1.414 18 18 1.414-1.414zM12 5.868v4.718L9.169 7.755 12 5.868zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20v-1.879l-2-2v2.011l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9h.879L3.102 7.223A1.995 1.995 0 0 0 2 9v6c0 1.103.897 2 2 2z"></path></svg>
              {/if}
            </div>
          </div>
          <div class="w-full px-4">
            <Progressbar progress={((sceneAudioTime / sceneAudioDuration) * 100).toString() || "0"} size="h-1.5" />
            <!-- <progress value="{(sceneAudioTime / sceneAudioDuration) || 0}"/> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .bar-icon {
    @apply w-9 h-9 cursor-pointer hover:scale-110 transition-all;
  }
</style>