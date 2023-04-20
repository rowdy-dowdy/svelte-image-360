<script lang="ts">
  import {
    onMount
  } from "svelte";
  /** @type {import('@marzipano').Load} */
  //@ts-ignore
  import Marzipano from "marzipano";

  let viewerHTML: HTMLElement | null = null;

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

    var urlPrefix = "./house";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/{z}/{f}/{y}/{x}.png", {
        cubeMapPreviewUrl: urlPrefix + "/preview.png"
      });

    // Create geometry.
    var geometry = new Marzipano.CubeGeometry([{
      "tileSize": 625,
      "size": 625,
      "fall backOnly": true
    },
    {
      "tileSize": 625,
      "size": 625
    },
    {
      "tileSize": 625,
      "size": 1250
    },
    {
      "tileSize": 625,
      "size": 2500
    },
    {
      "tileSize": 625,
      "size": 5000
    }
    ]);

    // Create view.
    var limiter = Marzipano.RectilinearView.limit.traditional(5000, 100 * Math.PI / 180);
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
