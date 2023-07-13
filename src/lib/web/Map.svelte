<script lang="ts">
  import { fly } from "svelte/transition";

  let showMap = true

  const data = [
    { id: 1, name: "Iphone 4", percent: 60},
    { id: 2, name: "Iphone 5", percent: 50},
    { id: 3, name: "Iphone 6", percent: 40},
    { id: 4, name: "Iphone 7", percent: 30},
    { id: 5, name: "Iphone 8", percent: 20},
    { id: 6, name: "Iphone x", percent: 10}
  ]

  const size = data.length
  const rotate = 360 / size
  const skewY = 90 - rotate
</script>

<div class="absolute right-2 top-2 z-10 ">
  <div class="icon relative z-10 border-2 border-white"
    on:click={() => showMap = !showMap}
  >
    <span class="material-symbols-outlined">
      {showMap ? 'location_on' : 'location_off'}
    </span>
  </div>

  {#if showMap}
    <div id="map" class="absolute top-2 right-2 w-72 h-60 rounded bg-sky-600"
      transition:fly={{x: 50, y: -50}}
    >
    <svg height="200" width="200" viewBox="0 0 20 20">
      <!-- <circle r="10" cx="10" cy="10" fill="white" /> -->
      <circle r="5" cx="10" cy="10" fill="transparent"
              stroke="tomato"
              stroke-width="10"
              stroke-dasharray="calc(15 * 31.4 / 100) 31.4"
              transform="rotate(-90) translate(-20)" />
    </svg>
    </div>
  {/if}
</div>

<style lang="postcss">
  .icon {
    @apply w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-700 hover:bg-sky-600 text-white 
      flex items-center justify-center cursor-pointer pointer-events-auto select-none;
  }

  .icon .material-symbols-outlined {
    @apply !text-xl sm:!text-2xl;
  }

  #vision {
    position: absolute;
    width: 200px;
    height: 200px;
    clip-path: polygon(0% 0%, 10% 0%, 100% 50%, 10% 100%, 0% 100%);
    background-color: red;
    opacity: 0.5;
    transform: rotate(-90deg);
    transition: transform 0.3s ease-in-out;
  }

  #map:hover #vision {
    transform: rotate(-45deg)
  }
</style>