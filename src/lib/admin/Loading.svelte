<script lang="ts">
  import { navigating } from "$app/stores";
  import type { Navigation } from "@sveltejs/kit";

  let lineProcess: HTMLElement | null = null
  $: watchRoute($navigating)

  let timer: undefined | ReturnType<typeof setTimeout> = undefined
  let timerEnd: undefined | ReturnType<typeof setTimeout> = undefined
    
  const watchRoute = (navigating: Navigation | null) => {
    // console.log(navigating)
    clearTimeout(timer)
    if (!navigating) {
      clearTimeout(timerEnd)
      if (!lineProcess) return
      if (lineProcess.clientWidth != 0) {
        lineProcess.style.width = '100%'
        lineProcess.style.transition = 'all .1s'
        timerEnd = setTimeout(() => {
          if (!lineProcess) return
  
          lineProcess.style.width = '0'
          lineProcess.style.transition = null as any
        }, 100);
      }
    }
    else {
      if (!lineProcess) return
      lineProcess.style.transition = null as any
      lineProcess.style.width = '0'
      timer = setTimeout(() => {
        if (!lineProcess) return
          if (navigating) {
            // lineProcess.style.width = '0'
            lineProcess.style.transition = 'all 2s'
            lineProcess.style.width = '70%'
            // setTimeout(() => {
            // }, 0);
          }
      }, 300);
    }
  }
</script>

<div class="line">
  <div bind:this={lineProcess} class="line-process"></div>
</div>

<style>
  .line {
    @apply fixed w-full h-0.5 top-0 left-0 z-50;
  }
  .line .line-process {
    @apply absolute w-0 h-full bg-primary-600 ease-in-out;
  }
</style>