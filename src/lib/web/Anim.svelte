<script lang="ts">
  import '@lottiefiles/lottie-player'
  import { create } from '@lottiefiles/lottie-interactivity'
  import postcss from 'postcss';

  // function handleLoad(event: Event) {
  //   create({
  //     mode: 'scroll',
  //     player: '#firstLottie',
  //     actions: [
  //       {
  //         visibility: [0, 1],
  //         type: 'seek',
  //         frames: [0, 100],
  //       },
  //     ],
  //   });
  // }
</script>

<lottie-player
  id="firstLottie"               
  src="https://assets2.lottiefiles.com/packages/lf20_i9mxcD.json"
  style="width:400px; height: 400px;"
  autoplay
  loop
/>

<style lang="postcss">
  lottie-player {
    @apply pointer-events-auto;
  }
</style>
