<script lang="ts">
  import { hold } from "../../stores/pano";

  // export let position: "l" | "r" | "t" | "b" = "r"
  export let title: string

  let show = false
  let hover = false
</script>

<div class="absolute top-0 left-0 w-0 h-0 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
    <div class="absolute w-0.5 h-20 bg-white/90 left-1/2 -translate-x-1/2 bottom-1/2"></div>
    <div class="absolute w-60 max-w-xs bg-teal-600/70 left-1/2 -translate-x-1/2 
      bottom-[86px] px-4 py-3 text-white rounded-xl border-2 border-sky-500 flex justify-center">
      {title}
    </div>
    <div class="relative w-3 h-3 rounded-full bg-sky-500"></div>

    <!-- <div class="title">{title}</div> -->
    <!-- fasdfas
    <fieldset>df</fieldset> -->
  </div>
</div>

<style lang="postcss">

</style>