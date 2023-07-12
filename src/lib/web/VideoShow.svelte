<script lang="ts">
  import { fade } from "svelte/transition";
  import { videoShow } from "../../stores/pano";
</script>

<div class="absolute w-full h-full top-0 left-0 p-8 md:py-20 bg-black/30 z-10 {$videoShow == null ? 'invisible opacity-0' : ''}"
  on:click|preventDefault={() => $videoShow = null}
>
  <div class="w-full h-full md:w-auto md:h-auto md:aspect-[16/9] max-h-full mx-auto bg-black rounded overflow-hidden">
    <iframe class="w-full h-full" src="https://www.youtube.com/embed/{$videoShow}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</div>