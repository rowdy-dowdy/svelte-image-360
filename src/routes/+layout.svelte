<script lang="ts">
  import Alert from "$lib/admin/Alert.svelte";
  import Loading from "$lib/admin/Loading.svelte";
  import "../app.css";
</script>

<svelte:head>
  <title>Du lịch Bắc Hà | Live 360</title>
  <meta name="description" content="Du lịch Bắc Hà">
</svelte:head>

<slot/>
<Loading />
<Alert />