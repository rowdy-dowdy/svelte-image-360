<script lang="ts">
  import { hold } from "../../stores/pano";
  export let title: string
  export let image: string
</script>

<div class="absolute top-0 left-0 w-0 h-0 cursor-pointer {$hold ? '!pointer-events-none' : ''}">
  <!-- <div class="hidden absolute top-0 bg-white/50 rounded-full left-0 w-full h-full group-hover:block group-hover:animate-ping"></div> -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
    <div class="relative w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-500 group-hover:w-20 group-hover:h-20 md:group-hover:w-32 md:group-hover:h-32 group shadow-inner">
      <div class="ball bubble !absolute top-0 left-0">
        <img src="/logo2.png" alt="" class="w-full h-full opacity-100 group-hover:opacity-0 transition-all 
          duration-500 rounded-full" loading="lazy">
        <img src={image} alt="" class="absolute top-0 left-0 w-full h-full object-cover rounded-full
          opacity-0 group-hover:opacity-100 transition-all duration-500" loading="lazy">
      </div>
    </div>

    {#if title != ""}
      <div class="title text-sm md:text-base">{title}</div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .title {
    text-shadow: rgb(0, 0, 0) 1px 1px 4px;
    @apply absolute left-1/2 top-full -translate-x-1/2 px-4 py-1 -mt-1 transition-all duration-500 
      rounded whitespace-nowrap text-white group-hover:bg-stone-700 group-hover:mt-2;
  }

  .ball {
    display: inline-block;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    position: relative;
    /* background: radial-gradient(circle at bottom, #81e8f6, #76deef 10%, #055194 80%, #062745 100%);  */
    background: radial-gradient(circle at bottom, #ffffff, #ffffff 10%, #000000 80%, #000000 100%);
  }
  .ball:before {
    content: "";
    position: absolute;
    top: 1%;
    left: 5%;
    width: 90%;
    height: 90%;
    border-radius: 100%;
    background: radial-gradient(circle at top, white, rgba(255, 255, 255, 0) 58%);
    -webkit-filter: blur(5px);
    filter: blur(5px);
    z-index: 2; 
  }
  .ball:after {
    content: "";
    position: absolute;
    display: none;
    top: 5%;
    left: 10%;
    width: 80%;
    height: 80%;
    border-radius: 100%;
    -webkit-filter: blur(1px);
    filter: blur(1px);
    z-index: 2;
    -webkit-transform: rotateZ(-30deg);
    transform: rotateZ(-30deg); 
  }
 
  .ball.bubble {
    background: radial-gradient(circle at 50% 55%, rgba(240, 245, 255, 0.9), rgba(240, 245, 255, 0.9) 40%, rgba(225, 238, 255, 0.8) 60%, rgba(43, 130, 255, 0.4));
    /* -webkit-animation: bubble-anim 2s ease-out infinite;
    animation: bubble-anim 2s ease-out infinite;  */
  }
  .ball.bubble:before {
    -webkit-filter: blur(0);
    filter: blur(0);
    height: 80%;
    width: 40%;
    background: radial-gradient(circle at 130% 130%, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0) 46%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.8) 58%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0) 100%);
    -webkit-transform: translateX(131%) translateY(58%) rotateZ(168deg) rotateX(10deg);
    transform: translateX(131%) translateY(58%) rotateZ(168deg) rotateX(10deg); 
  }
  .ball.bubble:after {
    display: block;
    background: radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 74%, white 80%, white 84%, rgba(255, 255, 255, 0) 100%); 
  }

  .group:hover .ball.bubble {
    -webkit-animation: bubble-anim 1.5s ease-out;
    animation: bubble-anim 1.5s ease-out; 
  }

  @keyframes bubble-anim {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1); }

    20% {
      -webkit-transform: scaleY(0.95) scaleX(1.05);
      transform: scaleY(0.95) scaleX(1.05); }

    48% {
      -webkit-transform: scaleY(1.1) scaleX(0.9);
      transform: scaleY(1.1) scaleX(0.9); }

    68% {
      -webkit-transform: scaleY(0.98) scaleX(1.02);
      transform: scaleY(0.98) scaleX(1.02); }

    80% {
      -webkit-transform: scaleY(1.02) scaleX(0.98);
      transform: scaleY(1.02) scaleX(0.98); }

    97%, 100% {
      -webkit-transform: scale(1);
      transform: scale(1); 
    } 
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