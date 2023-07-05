<script lang="ts">
  import type { GroupScene } from "@prisma/client";
  import { onDestroy, onMount } from "svelte";
  import Swiper from 'swiper';
  // import Swiper styles
  import 'swiper/css';

  export let groups: GroupScene[]
  export let groupSelect: string | null = null

  let slide: HTMLElement
  let swiper: Swiper | null

  onMount(() => {
    swiper = new Swiper(slide, {
      slidesPerView: 'auto',
      spaceBetween: 8,
    });
  })

  onDestroy(() => {
    if (swiper)
      swiper.destroy
  })
</script>

<div bind:this={slide} class="swiper w-full">
  <div class="swiper-wrapper">
    <div class="swiper-slide !w-2"></div>
    <div class="swiper-slide !w-auto bg-black/40 rounded-lg px-4 py-2 cursor-pointer
      hover:bg-white/40 transition-colors whitespace-nowrap {groupSelect == null ? 'bg-white/40' : ''}"
      on:click|preventDefault={() => groupSelect = null}
    >Tất cả</div>
    {#each groups as item}
      <div class="swiper-slide !w-auto bg-black/40 rounded-lg px-4 py-2 cursor-pointer 
        hover:bg-white/40 transition-colors whitespace-nowrap {groupSelect == item.id ? 'bg-white/40' : ''}"
        on:click|preventDefault={() => groupSelect = item.id}
      >{item.name}</div>
    {/each}
    <div class="swiper-slide !w-2"></div>
  </div>
</div>