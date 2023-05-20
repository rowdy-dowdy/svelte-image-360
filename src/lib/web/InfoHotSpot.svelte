<script lang="ts">
  // export let position: "l" | "r" | "t" | "b" = "r"
  export let title: string
  export let description: string

  let show = false
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 w-12 h-12 -translate-y-1/2 group">
  <div class="relative w-max group">
    <div
      class="info-title { show ? 'show' : ''}"
      on:click={() => show = !show}
    >
      <img src="./img/info.png" alt="" class="w-8 h-8 object-contain">
      <span class="text-white whitespace-nowrap font-semibold capitalize">{title}</span>
    </div>
    <span class="button-close {show ? 'show' : ''}" style=""
      on:click={() => show = false}
    >X</span>
  </div>
  
  <div class="description {show ? 'show' : ''}">
    {description}
  </div>

</div>

<style lang="postcss">
  .info-title {
    transition: all .3s, border-radius .3s;
    @apply flex items-center space-x-4 w-12 h-12 bg-stone-900/80 rounded-[50%] 
      cursor-pointer group-hover:w-64 group-hover:rounded overflow-hidden px-2;
  }

  .info-title.show {
    @apply !w-64 !rounded-none !rounded-tl !bg-stone-900/90;
  }

  .button-close {
    transform: perspective(200px) rotateY(90deg);
    transform-origin: 0 50% 0;
    transition: all .3s ease-in-out .3s;
    @apply absolute w-12 h-12 top-0 invisible left-full grid place-items-center !ml-0 
      pointer-events-none bg-black text-white rounded-r cursor-pointer;
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
    @apply w-[19rem] p-4 bg-black/90 invisible text-white overflow-y-auto pointer-events-none h-64;
  }
  .description.show {
    transform: perspective(200px) rotateX(0);
    transition: all .3s ease-in-out .3s;
    @apply pointer-events-auto visible;
  }
</style>