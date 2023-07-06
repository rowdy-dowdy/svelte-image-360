<script lang="ts">
  import { fade } from "svelte/transition";
  import { videoShow } from "../../stores/pano";
</script>

{#if $videoShow != null}
  <div class="absolute w-full h-full top-0 left-0 p-8 md:py-20 bg-black/30"
    on:click|preventDefault={() => $videoShow = null}
  >
    <div transition:fade class="w-full h-full md:w-auto md:h-auto md:aspect-[16/9] max-h-full mx-auto bg-black rounded overflow-hidden">
      <iframe class="w-full h-full" src="https://www.youtube.com/embed/{$videoShow}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
  </div>
{/if}