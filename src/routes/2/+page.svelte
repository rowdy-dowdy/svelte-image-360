<script lang="ts">
  import { Viewer, utils } from "@photo-sphere-viewer/core";
  import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
  import { GalleryPlugin } from "@photo-sphere-viewer/gallery-plugin";
  import { onMount } from "svelte";

  let viewerHTML: HTMLElement | null;
  const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";

  const animatedValues = {
    pitch: { start: -Math.PI / 2, end: 0.2 },
    yaw: { start: Math.PI, end: 0 },
    zoom: { start: 0, end: 50 },
    fisheye: { start: 2, end: 0 },
  };

  onMount(() => {
    const viewer = new Viewer({
      // container: viewerHTML,
      container: "viewer",
      panorama: baseUrl + "sphere.jpg",
      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.start,
      fisheye: animatedValues.fisheye.start,
      // navbar: [
      //   "autorotate",
      //   "zoom",
      //   {
      //     title: "Rerun animation",
      //     content: "🔄",
      //     onClick: intro,
      //   },
      //   "caption",
      //   "fullscreen",
      // ],
      plugins: [
        [
          AutorotatePlugin,
          {
            autostartDelay: null,
            autostartOnIdle: false,
            autorotatePitch: animatedValues.pitch.end,
          },
        ],
        [
          GalleryPlugin,
          {
            visibleOnLoad: true,
          },
        ],
      ],
    });

    const autorotate = viewer.getPlugin(AutorotatePlugin) as any;

    viewer.addEventListener("ready", intro, { once: true });

    function intro() {
      autorotate.stop();

      new utils.Animation({
        properties: animatedValues,
        duration: 2500,
        easing: "inOutQuad",
        onTick: (properties) => {
          viewer.setOption("fisheye", properties.fisheye);
          viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
          viewer.zoom(properties.zoom);
        },
      }).then(() => {
        autorotate.start();
      });
    }

    const gallery = viewer.getPlugin(GalleryPlugin) as any;

    gallery.setItems([
      {
        id: "sphere",
        panorama: baseUrl + "sphere.jpg",
        thumbnail: baseUrl + "sphere-small.jpg",
        options: {
          caption: "Parc national du Mercantour <b>&copy; Damien Sorel</b>",
        },
      },
      {
        id: "sphere-test",
        panorama: baseUrl + "sphere-test.jpg",
        name: "Test sphere",
      },
      {
        id: "key-biscayne",
        panorama: baseUrl + "tour/key-biscayne-1.jpg",
        thumbnail: baseUrl + "tour/key-biscayne-1-thumb.jpg",
        name: "Key Biscayne",
        options: {
          caption: "Cape Florida Light, Key Biscayne <b>&copy; Pixexid</b>",
        },
      },
    ]);
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.css"
  />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/gallery-plugin@5/index.css">
</svelte:head>

<div id="viewer" bind:this={viewerHTML} class="w-full h-screen" />
