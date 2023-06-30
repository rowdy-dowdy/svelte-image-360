<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button, Modal, Spinner } from "flowbite-svelte";
  import { alertStore } from "../../stores/alert";
  export let popupDeleteHotspot = false
  export let valueDeleteHotspot: {
    id: string
    type: 'link' | 'info'
  } | null = null

  let loading = false

  const handleSubmit = async (e: Event) => {
    if (loading) return
    loading = true

    let data: FormData = new FormData(e.target as HTMLFormElement)
    data.append('id', valueDeleteHotspot?.id || "")
    data.append('type', valueDeleteHotspot?.type || "")

    const response = await fetch("/admin?/deleteHotspot", {
      method: 'POST',
      body: data
    });
    // /** @type {import('@sveltejs/kit').ActionResult} */
    const result = deserialize(await response.text());

    if (result.type === 'success') {
      await invalidateAll()

      alertStore.addAlert({
        type: 'success'
      })
    }
    else {
      alertStore.addAlert({
        type: 'error'
      })
    }

    applyAction(result)

    loading = false
    popupDeleteHotspot = false
  }

</script>
<Modal id="popupDeleteHotspot" bind:open={popupDeleteHotspot} size="xs" outsideclose={true}>
  <form method="post" on:submit|preventDefault={handleSubmit}>
    <div class="text-center">
      <svg
        aria-hidden="true"
        class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
        Bạn có chắc chắc chắn muốn xóa bỏ liên kết điểm nóng này?
      </h3>
      <Button type="submit" color="red" class="mr-2">
        {#if loading}
          <Spinner class="mr-3" size="4" />Đang xóa ...
        {:else}
          Xóa bỏ
        {/if}
      </Button>
      <Button color="alternative" on:click={() => popupDeleteHotspot = false}>Hủy bỏ</Button>
    </div>
  </form>
</Modal>