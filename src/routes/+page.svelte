<script lang="ts">
  import { onMount } from "svelte";
  /** @type {import('@marzipano').Load} */
  //@ts-ignore
  import Marzipano from "marzipano";

  let viewerHTML : HTMLElement | null = null;
  
  onMount(() => {
    /// Create viewer.
    var viewer = new Marzipano.Viewer(document.getElementById('pano'));

    // Create source.
    // var source = Marzipano.ImageUrlSource.fromString(
    //   "tiles/example1/{f}.jpg"
    // );

    // var source = Marzipano.ImageUrlSource.fromString("tiles/{z}/{f}/{y}/{x}.jpg", {
    //   cubeMapPreviewUrl: "tiles/preview.jpg"
    // });

    var urlPrefix = "//www.marzipano.net/media";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + "oriente-station" + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + "oriente-station" + "/preview.jpg" });

    // Create geometry.
    var geometry = new Marzipano.CubeGeometry([ {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }]);

    // Create view.
    var limiter = Marzipano.RectilinearView.limit.traditional(4096, 100*Math.PI/180);
    var view = new Marzipano.RectilinearView(null, limiter);

    // Create scene.
    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    // Display scene.
    scene.switchTo();
  });
</script>

<div id="pano" bind:this={viewerHTML} class="w-full h-screen" />