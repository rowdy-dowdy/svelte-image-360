<script lang="ts">
  import Alert from "$lib/admin/Alert.svelte";
import Loading from "$lib/admin/Loading.svelte";
  import "../app.css";
</script>

<slot/>
<Loading />
<Alert />