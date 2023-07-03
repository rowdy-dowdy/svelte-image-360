<script lang="ts">
  import Alert from "$lib/admin/Alert.svelte";
  import Loading from "$lib/admin/Loading.svelte";
  import "../app.css";
</script>

<slot/>
<Loading />
<Alert />

<svelte:head>
  <title>Du lịch Bắc Hà | Live 360</title>
  <meta name="description" content="Du lịch Bắc Hà">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>