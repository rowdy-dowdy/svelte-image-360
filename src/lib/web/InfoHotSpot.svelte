<script lang="ts">
  // export let position: "l" | "r" | "t" | "b" = "r"

  let show = false
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 w-12 h-12 -translate-y-1/2 group">
  <div class="relative w-max group">
    <div
      class="info-title { show ? 'show' : ''}"
      on:click={() => show = !show}
    >
      <img src="./img/info.png" alt="" class="w-8 h-8 object-contain">
      <span class="text-white whitespace-nowrap font-semibold capitalize">Tủ giày</span>
    </div>
    <span class="button-close {show ? 'show' : ''}" style=""
      on:click={() => show = false}
    >X</span>
  </div>


</div>

<style lang="postcss">
  .info-title {
    transition: all .3s, border-radius .3s;
    @apply flex items-center space-x-4 w-12 h-12 bg-stone-900/80 rounded-[50%] 
      cursor-pointer group-hover:w-64 group-hover:rounded overflow-hidden px-2;
  }

  .info-title.show {
    @apply !w-64 !rounded-r-none !rounded-l !bg-stone-900/90;
  }

  .button-close {
    transform: rotateY(90deg);
    transform-origin: 0 50% 0;
    transition: all .3s ease-in-out;
    @apply absolute w-12 h-12 top-0 left-full grid place-items-center !ml-0 
      pointer-events-none bg-black text-white rounded-r cursor-pointer;
  }
  .button-close.show {
    transform: rotateY(0deg);
    @apply pointer-events-auto;
  }

  .description {
    transform: rotateX(-89.999deg);
  }
</style>