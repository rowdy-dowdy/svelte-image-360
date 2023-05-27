<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade, fly } from "svelte/transition";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { showListScene } from "../../stores/pano";

  export let data: SceneDataType[]
  export let sceneId: string | null

  let showSceneDemo = false
  let showSceneDemImage = ''
  const enterSceneTitle = (e: MouseEvent, id: string) => {
    showSceneDemo = true
    showSceneDemImage = `/storage/tiles/${id}/demo.jpg`
  }

  const leaveSceneTitle = (e: MouseEvent) => {
    showSceneDemo = false
  }

  const clickSceneTitle = (id: string) => {
    goto('/?scene='+id)
    showSceneDemo = false
  }
</script>

{#if showSceneDemo}
  <div transition:fade class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none">
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-3/4 max-w-3xl border-4 border-white">
        <img src="{showSceneDemImage}" alt="" class="w-full h-full">
      </div>
    </div>
  </div>
{/if}

<div class="absolute top-0 left-0 w-full h-full p-6 pointer-events-none overflow-hidden">
  <div class="pl-12">
    <div class="w-32 h-32">
      <img src="/logo.png" alt="logo Bắc Hà" class="w-full h-full object-contain">
    </div>
  </div>
  
  {#if $showListScene}
    <div transition:fly={{x: -200}} class="flex flex-col mt-12 max-w-[280px] text-white"
      on:mouseleave={(e) => leaveSceneTitle(e)}
    >
      {#each data as item (item.id)}
        <div class="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.2] pointer-events-auto"
          on:mouseenter={(e) => enterSceneTitle(e,item.id)}
          on:click={() => clickSceneTitle(item.id)}
        >
          <div class="w-1 h-8 bg-white group-hover:bg-sky-600 {sceneId == item.id ? '!bg-sky-600' : ''}"></div>
          <span class="group-hover:text-teal-300 text-lg" style="text-shadow: rgb(0, 0, 0) 1px 1px 4px;">{item.name}</span>
        </div>
      {/each}
    </div>
    {/if}
</div>