<script lang="ts">
  import { hold } from "../../stores/pano";
  import Anim from "./Anim.svelte";
  export let title: string
</script>

<div class="absolute top-0 left-0 w-0 h-0 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <!-- <div class="hidden absolute top-0 bg-white/50 rounded-full left-0 w-full h-full group-hover:block group-hover:animate-ping"></div> -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
    <div class="relative w-24 h-24 md:w-28 md:h-24 group overflow-hidden">
      <div class="absolute w-[200%] top-[60%] left-[68%] -translate-x-1/2 -translate-y-1/2">
        <Anim src="/lotties/helicopter.json" />
      </div>
    </div>

    {#if title != ""}
      <div class="title">{title}</div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .title {
    /* text-shadow: rgb(0, 0, 0) 1px 1px 4px; */
    @apply opacity-0 absolute left-1/2 bottom-1/2 -translate-x-1/2 px-4 py-1 transition-all duration-500 rounded whitespace-nowrap text-white group-hover:bg-stone-700 group-hover:bottom-[calc(100%+1rem)] group-hover:opacity-100;
  }
</style>