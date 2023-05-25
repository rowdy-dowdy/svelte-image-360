<script lang="ts">
  import Image360 from '$lib/web/Image360.svelte';
  import { GradientButton } from 'flowbite-svelte';
  import { fade } from 'svelte/transition';
  import type { SceneDataType } from '../admin/(admin)/+page.server';
  import { page } from "$app/stores";
  import { goto } from '$app/navigation';

  export let data
  let start = false

  // if (data.scenes.length > 0 ) {
  //   if (!$page.url.searchParams.get('scene'))
  //     goto('?scene='+data.scenes[0].id)
  // }
</script>

<svelte:head>
  <title>Sample Tour | Image 360</title>
  <meta name="description" content="A sample 360° tour created by the VietHungIt.">
  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
  <style> @-ms-viewport { width: device-width; } </style>
</svelte:head>

<Image360 data={data.scenes} />
{#if !start}
  <div transition:fade class="fixed w-full h-screen top-0 left-0 z-[100]">
    <img src="https://vr360.danangfantasticity.com/assets/vr360.jpg" class="w-full h-full object-cover">

    <div class="absolute w-full h-full left-0 top-0 flex flex-col items-center justify-center gap-8">
      <h3 class="text-7xl font-semibold text-white" style="text-shadow: 2px 7px 5px rgba(0,0,0,0.3), 
      0px -4px 10px rgba(255,255,255,0.3);">Một chạm tới <span class="text-sky-600">Bắc Hà</span></h3>

      <GradientButton size="lg" on:click={() => start = true}>Bắt đầu tham quan</GradientButton>
    </div>
  </div>
{/if}