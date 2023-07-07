<script lang="ts">
  import { hold } from "../../stores/pano";

  // export let position: "l" | "r" | "t" | "b" = "r"
  export let title: string
  export let description: string

  let show = false
  let hover = false
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 w-10 h-10 -translate-y-1/2 group {$hold ? '!pointer-events-none' : ''}">
  <div class="relative w-max"
    on:mouseover={() => hover = true}
    on:mouseleave={() => hover = false}
  >
    <div
      class="info-title { show ? 'show' : ''} { hover ? 'hover' : ''}"
      on:click={() => show = !show}
    >
      <div class="flex-none w-h-6 h-6 object-contain grid place-items-center">
        <span class="material-symbols-outlined">
          info_i
        </span>
      </div>
      <span class="whitespace-nowrap font-semibold capitalize">{title}</span>
    </div>
    <span class="button-close {show ? 'show' : ''}" style=""
      on:click={() => show = false}
    >X</span>
  </div>
  
  <div class="description {show ? 'show' : ''} whitespace-pre-wrap">
    {description || 'Không có mô tả'}
  </div>

</div>

<style lang="postcss">
  .info-title {
    transition: all .3s ease-in-out .3s, border-radius .3s ease-in-out .3s;
    @apply flex items-center space-x-4 w-10 h-10 bg-stone-900/80 rounded-[50%] 
      cursor-pointer overflow-hidden px-2 text-white;
  }

  .info-title.hover {
    transition: all .3s, border-radius .3s;
    @apply w-64 rounded;
  }

  .info-title.show {
    @apply !w-64 !rounded-none !rounded-tl !bg-black/70;
  }

  .button-close {
    transform: perspective(200px) rotateY(90deg);
    transform-origin: 0 50% 0;
    transition: all .3s ease-in-out .3s;
    @apply absolute w-12 h-12 top-0 invisible left-full grid place-items-center !ml-0 
      pointer-events-none bg-black/80 text-white rounded-tr cursor-pointer
      hover:bg-white/70 hover:text-gray-800;
  }
  .button-close.show {
    transform: perspective(200px) rotateY(0deg);
    transition: all .3s ease-in-out;
    @apply pointer-events-auto visible;
  }

  .description {
    transform: perspective(200px) rotateX(-89.999deg);
    transform-origin: 50% 0 0;
    transition: all .3s ease-in-out;
    @apply w-[19rem] p-4 bg-black/70 invisible text-white overflow-y-auto pointer-events-none h-64 border-t border-black/70;
  }
  .description.show {
    transform: perspective(200px) rotateX(0);
    transition: all .3s ease-in-out .3s;
    @apply pointer-events-auto visible;
  }
</style>