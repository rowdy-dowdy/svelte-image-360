<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button, Checkbox, Dropdown, DropdownDivider, DropdownItem, Fileupload, FloatingLabelInput, Helper, Input, Label, Modal, Search, Select, Spinner, TabItem, Tabs, Textarea } from "flowbite-svelte";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { removeAccents } from "$lib/utils/hepler";
  import { page } from "$app/stores";
  import { alertStore } from "../../stores/alert";
  import type { InfoHotspots, LinkHotspots } from "@prisma/client";
  import LinkHotspot from "$lib/web/LinkHotspot.svelte";

  export let showFormModalEdit: boolean = true
  export let valueEditHotspot: {
    type: 'info' | "link"
    value: LinkHotspots | InfoHotspots
  } | null = null
  // export let coordinatesAdd: { yaw: number, pitch: number }
  export let scenes: SceneDataType[]

  let loading = false

  const handleSubmit = async (e: Event) => {
    if (loading) return
    loading = true

    let data: FormData = new FormData(e.target as HTMLFormElement)

    const response = await fetch("/admin?/editHotspot", {
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
    showFormModalEdit = false
  }

  let directions = [
    { value: 't', name: 'Trên' },
    { value: 'tr', name: 'Trên phải' },
    { value: 'r', name: 'Phải' },
    { value: 'br', name: 'Dưới phải' },
    { value: 'b', name: 'Dưới' },
    { value: 'bl', name: 'Dưới trái' },
    { value: 'l', name: 'Trái' },
    { value: 'tl', name: 'Trên trái' },
  ]

  let selectedDirection = directions[0].value
  let selectSceneOpen = false
  let target = ''

  let search = ''
  $: dataFilter = scenes ? scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0) : []

  const selectScene = (id: string) => {
    target = id
    selectSceneOpen = false
  }

  $: getNameScene = scenes.find(v => v.id == target)?.name || "Chưa chọn"

  // info
  let types = [
    { value: '1', name: 'Loại 1' },
    { value: '2', name: 'Loại 2' },
  ]

  let selectTypes = types[0].value
  let title = ''
  let description = ''
  let imageUrl = ''

  const onChangeImage = (e: Event) => {

  }

  // first
  $: if (valueEditHotspot) {
    if (valueEditHotspot.type == "link") {
      target = (valueEditHotspot.value as LinkHotspots).target
      selectedDirection = (valueEditHotspot.value as LinkHotspots).direction
    }
    else {
      selectTypes = (valueEditHotspot.value as InfoHotspots).type || ''
      title = (valueEditHotspot.value as InfoHotspots).title || ''
      description = (valueEditHotspot.value as InfoHotspots).description || ''
      imageUrl = (valueEditHotspot.value as InfoHotspots).image || ''
    }
  }

</script>

<Modal id="form-modal" bind:open={showFormModalEdit} size="sm" autoclose={false} class="w-full">
  <form class="flex flex-col" method="post" on:submit|preventDefault={handleSubmit}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Chỉnh sửa điểm nóng</h3>
    <input type="hidden" name="id" value={valueEditHotspot?.value.id}>
    {#if valueEditHotspot?.type == "link"}
      <div >
        <input type="hidden" value="link" name="hotspotType">
        <div class="flex flex-col gap-4">
          <!-- <FloatingLabelInput
            style="filled"
            disabled
            type="text"
            value={JSON.stringify(coordinatesAdd)}
            label="Tọa độ"
          /> -->

          <Label class="text-sm font-medium block text-gray-900">
            Chọn bối cảnh
            <input name="target" class="sr-only" value={target} required>
            <div class="block w-full h-10 mt-2 rounded-md border-gray-300 p-2 bg-gray-200 cursor-pointer"
              on:click|preventDefault|stopPropagation={() => selectSceneOpen = !selectSceneOpen}
            >
              {getNameScene}
            </div>
            <Dropdown bind:open={selectSceneOpen} class="w-[30rem] overflow-y-auto px-3 pb-3 text-sm max-h-44" placement="bottom">
              <div slot="header" class="p-3">
                <Search size="md" bind:value={search} />
              </div>
              <ul class="mt-2">
                {#each dataFilter as item, i (i)}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer {target == item.id ? '!bg-sky-600 !text-white' : ''}"
                    on:click={() => selectScene(item.id)}
                  >{item.name}</li>
                {/each}
              </ul>
            </Dropdown>
          </Label>

          <Label
            >Hướng
            <Select name="direction" class="mt-2" items={directions} bind:value={selectedDirection} />
          </Label>

          <Button type="submit">
            {#if loading}
              <Spinner class="mr-3" size="4" />Đang lưu ...
            {:else}
              <span>Thêm mới</span>
            {/if}
          </Button>
        </div>
      </div>
    {:else}
      <div>
        <input type="hidden" value="info" name="hotspotType">
        <div class="flex flex-col space-y-6">
          <!-- <FloatingLabelInput
            style="filled"
            disabled
            type="text"
            value={JSON.stringify(coordinatesAdd)}
            label="Tọa độ"
          /> -->

          <Label
            >Loại
            <Select name="type" class="mt-2" items={types} bind:value={selectTypes} />
          </Label>

          {#if selectTypes == "1"}
            <div>
              <Label for="title" class="mb-2">Tiêu đề</Label>
              <Input type="text" id="tile" name="title" placeholder="Tiêu đề" bind:value={title} required />
            </div>
            <div>
              <Label for="description" class="mb-2">Nội dung</Label>
              <Textarea id="description" placeholder="Nội dung" rows="4" bind:value={description} name="description" />
            </div>
          {:else if selectTypes == "2"}
            <div>
              <Label for="title" class="mb-2">Tiêu đề</Label>
              <Input type="text" id="title" name="title" placeholder="Tiêu đề" bind:value={title} required />
            </div>
            <div>
              <Label for="image" class="pb-2">Ảnh</Label>
              <Fileupload id="image" name="image" class="mb-2" on:change={(e) => onChangeImage(e)} />
              <Helper>PNG, JPG or GIF.</Helper>
            </div>
          {/if}

          <Button type="submit">
            {#if loading}
              <Spinner class="mr-3" size="4" />Đang lưu ...
            {:else}
              <span>Thêm mới</span>
            {/if}
          </Button>
        </div>
      </div>
    {/if}
  </form>
</Modal>