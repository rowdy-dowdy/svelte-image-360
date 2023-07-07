<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade, fly } from "svelte/transition";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { showListScene } from "../../stores/pano";
  import type { GroupScene } from "@prisma/client";
  import GroupSwiper from "./GroupSwiper.svelte";
  import SimpleBar from 'simplebar'
  import 'simplebar/dist/simplebar.css';
  import { onMount } from "svelte";

  export let data: SceneDataType[]
  export let sceneSlug: string | null
  export let groups: GroupScene[]

  let showSceneDemo = false
  let showSceneDemImage = ''
  const enterSceneTitle = (e: MouseEvent, id: string) => {
    showSceneDemImage = `/storage/tiles/${id}/demo.jpg`
    showSceneDemo = true
  }

  const leaveSceneTitle = (e: MouseEvent) => {
    showSceneDemo = false
  }

  const clickSceneTitle = (id: string) => {
    showSceneDemo = false
    goto(`/${id}`)
  }

  let groupSelect: string | null = null

  $: sceneFilter = groupSelect ? data.filter(v => v.groupId == groupSelect) : data

  let listScene: HTMLElement

  onMount(() => {
    new SimpleBar(listScene);
  })
</script>

{#if showSceneDemo}
  <div transition:fade class="absolute top-0 left-0 w-full h-full pointer-events-none">
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-3/4 max-w-3xl border-4 border-white">
        <img src="{showSceneDemImage}" alt="" class="w-full h-full" loading="lazy">
      </div>
    </div>
  </div>
{/if}

<!-- <div class="absolute top-0 left-0 w-full h-full p-6 pointer-events-none overflow-hidden flex flex-col">
  <div class="md:pl-6 lg:pl-12 mb-12">
    <div class="w-32 h-32">
      <img src="/logo.png" alt="logo Bắc Hà" class="w-full h-full object-contain">
    </div>
  </div>
  
  {#if $showListScene}
    <div 
      transition:fly={{x: -200}} 
      class="w-full max-w-[280px] flex-grow min-h-0 pointer-events-auto"
      bind:this={listScene}
    >
      <div class="flex flex-col text-white"
        on:mouseleave={(e) => leaveSceneTitle(e)}
      >
        {#each new Array(10) as item}
        {#each data as item (item.id)}
          <div class="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.2] pointer-events-auto"
            on:mouseenter={(e) => enterSceneTitle(e,item.id)}
            on:click={() => clickSceneTitle(item.slug)}
          >
            <div class="w-1 h-8 bg-white group-hover:bg-sky-600 {sceneSlug == item.slug ? '!bg-sky-600' : ''}"></div>
            <span class="group-hover:text-teal-300" style="text-shadow: rgb(0, 0, 0) 1px 1px 4px;">{item.name}</span>
          </div>
        {/each}
        {/each}
      </div>
    </div>
    {/if}
</div> -->

<div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden py-8">
  <button class="absolute left-0 top-[20%] rounded-r py-1 px-2 text-white bg-black/50 grid place-items-center 
    pointer-events-auto hover:bg-white/40 hover:text-gray-800 transition-colors"
    on:click|preventDefault={() => $showListScene = true}
  >
    <span class="material-symbols-outlined !text-2xl">
      view_list
    </span>
  </button>
  
  <div class="relative h-full flex flex-col items-center space-y-4
    max-w-[280px] text-white rounded-r-lg bg-black/20 backdrop-blur py-4 pointer-events-auto
    -translate-x-full transition-all {$showListScene ? '!translate-x-0' : ''}"
  >
    <div class="w-20 h-20 mx-4">
      <img src="/logo.png" alt="logo Bắc Hà" class="w-full h-full object-contain" loading="lazy">
    </div>

    <button class="absolute top-0 right-4 rounded p-1 text-white bg-black/60 grid place-items-center pointer-events-auto hover:bg-white/40 transition-colors"
      on:click|preventDefault={() => $showListScene = false}
    >
      <span class="material-symbols-outlined">
        close
      </span>
    </button>

    <div class="w-full flex pointer-events-auto">
      <GroupSwiper groups={groups} bind:groupSelect={groupSelect} />
    </div>

    <div bind:this={listScene} class="flex-grow min-h-0 w-full">
      <div class="w-full px-4 flex flex-col space-y-4"
        on:mouseleave={(e) => leaveSceneTitle(e)}
      >
        {#each sceneFilter as item (item.id)}
          <div class="w-full bg-black/30 rounded-lg pointer-events-auto p-4 pb-3 cursor-pointer hover:bg-white/40
            transition-colors {sceneSlug == item.slug ? 'bg-white/40' : ''}"
            on:mouseenter={(e) => enterSceneTitle(e,item.id)}
            on:click={() => clickSceneTitle(item.slug)}
          >
            <div class="w-full aspect-[5/2.5] rounded-lg overflow-hidden">
              <img src="{item.url}/1/f/0/0.jpg" alt="{item.name}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="text-center mt-2 text-sm md:text-base" style="text-shadow: rgb(0, 0, 0) 1px 1px 4px;">{item.name}</div>
          </div>
        {:else}
          <p class="p-2 text-center">Không có địa điểm nào</p>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
 :global(.simplebar-scrollbar::before) {
    background-color: white;
  }
</style>