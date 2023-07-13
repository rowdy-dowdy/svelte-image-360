<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade, fly, slide } from "svelte/transition";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { showListScene } from "../../stores/pano";
  import type { GroupScene } from "@prisma/client";
  import GroupSwiper from "./GroupSwiper.svelte";
  import SimpleBar from 'simplebar'
  import 'simplebar/dist/simplebar.css';
  import { onMount } from "svelte";
  import { clickOutside } from "$lib/utils/clickOutSide";

  export let data: SceneDataType[]
  export let sceneSlug: string | undefined
  export let groups: GroupScene[]
  export let currentScene: SceneDataType

  let listScene: HTMLElement

  let showSceneDemo = false
  let showSceneDemImage = ''
  let groupSelect: string | null = null
  let showGroupScene = false

  $: sceneFilter = groupSelect ? data.filter(v => v.groupId == groupSelect) : data

  const enterSceneTitle = (group: GroupScene) => {
    let firstScene = data.find(v => v.groupId == group.id)

    if (firstScene) {
      showSceneDemImage = `/storage/tiles/${firstScene.id}/front.jpg`
      showSceneDemo = true
    }
  }

  const leaveSceneTitle = () => {
    showSceneDemo = false
  }

  const clickSceneTitle = (group: GroupScene) => {
    if (showGroupScene) {
      groupSelect = group.id
    }
    else {
      let scenes = data.filter(v => v.groupId == group.id)

      if (scenes.length == 1) {
        showSceneDemo = false
        goto(`/${scenes[0].slug}`)
      }
      else {
        groupSelect = group.id
        showGroupScene = true
      }
    }
  }

  const clickGroupScene = (slug: string) => {
    showGroupScene = false
    goto(`${slug}`)
  }

  onMount(() => {
    // new SimpleBar(listScene);
  })
</script>

{#if showSceneDemo || showGroupScene}
  <div transition:fade class="absolute top-0 left-0 w-full h-full bg-gradient-to-r 
    from-black/60 via-transparent to-black/60 z-10">
    {#if showSceneDemo}
      <div class="w-full h-full flex items-center justify-center">
        <div class="w-3/4 max-w-3xl border-4 border-white">
          <img src="{showSceneDemImage}" alt="" class="w-full h-full aspect-[5/3] object-cover" loading="lazy">
        </div>
      </div>
    {/if}
  </div>
{/if}

<div class="absolute top-0 left-0 w-full h-full p-6 pointer-events-none overflow-hidden select-none flex flex-col z-10">
  <div class="md:pl-6 lg:pl-12 mb-12">
    <a href="/" class="block w-20 h-20 md:w-32 md:h-32 pointer-events-auto">
      <img src="/logo.png" alt="logo Bắc Hà" class="w-full h-full object-contain">
    </a>
  </div>
  
  {#if $showListScene}
    <div class="w-full max-w-[280px] relative"
      transition:fly={{x: -280, duration: 300}}
      use:clickOutside on:clickOutside={() => showGroupScene = false}
    >
      {#if showGroupScene}
        <div
          transition:fly={{x: -280, duration: 300}}
          class="w-full h-full pointer-events-auto"
        >
          <div class="flex flex-col text-white divide-y divide-black/20">
            <!-- {#each new Array(10) as item} -->
            {#each sceneFilter as item (item.id)}
              <div class="flex py-2 space-x-2 items-center cursor-pointer pointer-events-auto
                hover:text-teal-300 {sceneSlug == item.slug ? 'text-teal-300' : ''}"
                on:click={() => clickGroupScene(item.slug)}
              >
                <span class="flex-grow" style="text-shadow: rgb(0, 0, 0) 1px 1px 4px;">{item.name}</span>
                <span class="flex-none material-symbols-outlined">
                  chevron_right
                </span>
              </div>
            {:else}
              <div class="py-2">Không có bối cảnh nào</div>
            {/each}
            <!-- {/each} -->
          </div>
        </div>
      {/if}

      <!-- {#if $showListScene} -->
        <div class="w-full h-full absolute top-0 left-0 pointer-events-auto transition-all ease-linear {showGroupScene ? '!left-[300px]' : ''}">
          <!-- <div class="w-full h-full" bind:this={listScene}> -->
          <div class="w-full h-full">
            <div class="flex flex-col text-white"
              on:mouseleave={() => leaveSceneTitle()}
            >
              <!-- {#each new Array(10) as item} -->
              {#each groups as item (item.id)}
                <div class="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.2] pointer-events-auto"
                  on:mouseenter={(e) => enterSceneTitle(item)}
                  on:click={() => clickSceneTitle(item)}
                >
                  <div class="w-1 h-9 bg-white group-hover:bg-sky-600 {currentScene.groupId == item.id ? '!bg-sky-600' : ''}"></div>
                  <span class="group-hover:text-teal-300" style="text-shadow: rgb(0, 0, 0) 1px 1px 4px;">{item.name}</span>
                </div>
              {/each}
              <!-- {/each} -->
            </div>
          </div>
        </div>
      <!-- {/if} -->
    </div>
  {/if}
</div>



<!-- <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden py-8">
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
</div> -->

<style>
 :global(.simplebar-scrollbar::before) {
    background-color: white;
  }
</style>