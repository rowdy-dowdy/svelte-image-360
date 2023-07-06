<script lang="ts">
  import { hold, videoShow } from "../../stores/pano";
  // export let position: "l" | "r" | "t" | "b" = "r"
  export let title: string
  export let video: string
</script>

<div class="absolute top-0 left-0 w-0 h-0 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
    <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 hover:bg-white/70
      text-white grid place-items-center transition-colors hover:text-gray-800"
      on:click|preventDefault|stopPropagation={() => $videoShow = video}  
    >
      <span class="material-symbols-outlined !text-xl md:!text-2xl left-0 top-0">
        video_library
      </span>
    </div>
  </div>
</div>
<style lang="postcss">
</style>