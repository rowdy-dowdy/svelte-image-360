<script lang="ts">
  import { hold } from "../../stores/pano";
  export let title: string
  export let image: string = 'https://photo-resize-zmp3.zmdcdn.me/w600_r300x169_jpeg/thumb_video/9/c/9c2cfa5cbfeae42275cad35bc50790e9_1513848418.jpg'
  export let direction: "t" | "tr" | "r" | "br" | "b" | "bl" | "l" | "tl" = "t"
</script>

<div class="absolute top-0 left-0 w-0 h-0 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <!-- <div class="hidden absolute top-0 bg-white/50 rounded-full left-0 w-full h-full group-hover:block group-hover:animate-ping"></div> -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="relative w-20 h-20 rounded-full transition-all duration-500 hover:w-32 hover:h-32 group shadow-inner">
      <img src="/logo.png" alt="" class="w-full h-full opacity-100 group-hover:opacity-0 transition-all duration-500">
      <img src={image} alt="" class="absolute top-0 left-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full">
      <div class="absolute top-0 left-0 w-full h-full rounded-full"
        style="box-shadow: rgb(255 255 255 / 0.25) 1px 1px 17px 4px inset, rgba(0, 0, 0, 0.25) 1px 1px 6px 3px"
      ></div>
    </div>
  </div>

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



<!-- <script lang="ts">
  import { hold } from "../../stores/pano";
  export let title: string
  export let direction: "t" | "tr" | "r" | "br" | "b" | "bl" | "l" | "tl" = "t"
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 group w-16 h-16 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <div class="hidden absolute top-0 bg-white/50 rounded-full left-0 w-full h-full group-hover:block group-hover:animate-ping"></div>
  <img src="./img/link.png" alt="" class="relative 
    {direction == "tr" ? 'rotate-45' : direction == "r" ? 'rotate-90' : direction == "br" 
    ? 'rotate-[135deg]' : direction == "b" ? 'rotate-180' : direction == "bl" ? 'rotate-[-135deg]'
    : direction == "l" ? '-rotate-90' : direction == "tl" ? '-rotate-45' : ''}"
  >

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
</style> -->