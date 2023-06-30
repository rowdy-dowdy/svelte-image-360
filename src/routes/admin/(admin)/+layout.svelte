<script>
  import AdminSideBar from "$lib/admin/AdminSideBar.svelte";
  export let data
</script>
<div class="w-full h-screen flex bg-gray-100">
  <div class="flex-none h-full">
    <AdminSideBar user={data.user} />
  </div>
  <div class="flex-grow min-w-0 h-full">
    <slot />
  </div>
</div>