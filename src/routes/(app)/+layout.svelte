<script lang="ts">
  // import Image360 from '$lib/web/Image360.svelte';
  import { GradientButton } from 'flowbite-svelte';
  import { scale } from 'svelte/transition';
  // import type { SceneDataType } from '../admin/(admin)/+page.server';
  // import { page } from "$app/stores";
  // import { goto } from '$app/navigation';
  import { allowedPlayAduio } from '../../stores/pano';

  export let data
  let start = true

  // if (data.scenes.length > 0 ) {
  //   if (!$page.url.searchParams.get('scene'))
  //     goto('?scene='+data.scenes[0].id)
  // }

  const startTour = () => {
    $allowedPlayAduio = true
    start = true
  }

</script>

<svelte:head>
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

{#if data.scenes.length > 0}
  {#await import('$lib/web/Image360.svelte')}
    loading...
  {:then Image360}
    <Image360.default data={data.scenes} settingMainAudio={data.settings.find(v => v.name == "main audio")} groups={data.groups}/>
  {/await}
{:else}
  <div class="fixed w-full h-screen top-0 left-0 grid place-items-center">
    Không có bối cảnh nào
  </div>
{/if}
{#if !start}
  <div transition:scale={{start: 2, duration: 700, opacity: 0}} class="fixed w-full h-screen top-0 left-0 z-[100] bg-white">
    <img src="{data.settings.find(v => v.name == "banner")?.value}" class="w-full h-full object-cover" loading="lazy">

    <div class="absolute w-full h-full left-0 top-0 flex flex-col items-center justify-center gap-8">
      <h3 class="text-3xl md:text-5xl lg:text-7xl font-semibold text-white text-center" style="text-shadow: 2px 7px 5px rgba(0,0,0,0.3), 
      0px -4px 10px rgba(255,255,255,0.3);">Một chạm tới <span class="text-sky-500">Bắc Hà</span></h3>

      <GradientButton size="lg" on:click={startTour}>Bắt đầu tham quan</GradientButton>
    </div>
  </div>
{/if}

<style>
  :global(html, body) {
    @apply w-full h-full overflow-hidden;
  }
</style>