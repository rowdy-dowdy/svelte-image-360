<script lang="ts">
  import '@lottiefiles/lottie-player'
  export let src: string
</script>

<lottie-player
  id="firstLottie"               
  src={src}
  autoplay
  loop
/>

<style lang="postcss">
  lottie-player {
    @apply pointer-events-auto;
  }
</style>
