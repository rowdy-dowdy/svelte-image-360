<script lang="ts">
  import { hold } from "../../stores/pano";
  // export let position: "l" | "r" | "t" | "b" = "r"
  export let title: string
  export let description: string
  let show = false
</script>

<div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 {$hold ? '!pointer-events-none' : ''}">
  <div class="info-title {show ? 'show' : ''}" on:click={() => show = !show}>
    <div class="flex-none w-12 h-12 grid place-items-center">
      <img src="./img/info.png" alt="" class="w-8 h-8 object-contain" loading="lazy">
    </div>

    <div class="flex-grow min-h-0 bg-white w-full p-2 flex flex-col space-y-1">
      <div class="flex-grow min-h-0">
        <img src="https://enic.vn/wp-content/uploads/2022/06/ava-tu-T03-1-600x600.jpeg" alt="" loading="lazy"
        class="w-full h-full object-cover rounded">
      </div>
      <p class="flex-none font-semibold capitalize text-center">{title}</p>
    </div>
  </div>
</div>

<style lang="postcss">
  .info-title {
    transition: all .3s ease-in-out .3s, border-radius .3s ease-in-out .3s;
    @apply flex flex-col items-center w-12 h-12 bg-sky-900/80 rounded-[50%] 
      cursor-pointer overflow-hidden;
  }
  .info-title:hover {
    transition: all .3s, border-radius .3s ;
    @apply w-52 h-56 rounded;
  }

  .info-title.show {
    transition: all .3s, border-radius .3s ;
    @apply w-52 h-56 rounded !bg-sky-900;
  }
</style>