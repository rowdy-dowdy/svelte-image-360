<script lang="ts">
  import { hold } from "../../stores/pano";
  export let title: string
  export let direction = "t"
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 group w-16 h-16 cursor-pointer 
  {direction == "l" ? '-rotate-90' : direction == "r" ? 'rotate-90' : direction == "b" ? 'rotate-180' : ''} 
  {$hold ? '!pointer-events-none' : ''}">
  <div class="hidden absolute top-0 bg-white/50 rounded-full left-0 w-full h-full group-hover:block group-hover:animate-ping"></div>
  <img src="./img/link.png" alt="" class="relative">

  {#if title != ""}
    <div class="title">{title}</div>
  {/if}
</div>

<style lang="postcss">
  .title {
    @apply absolute whitespace-nowrap max-w-xs left-full top-1/2 -translate-y-1/2 p-2 
      rounded bg-white/80 invisible -translate-x-8 transition-all opacity-0
      group-hover:visible group-hover:translate-x-0 group-hover:opacity-100
  }
</style>