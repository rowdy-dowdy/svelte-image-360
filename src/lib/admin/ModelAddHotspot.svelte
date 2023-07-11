<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button, Checkbox, Dropdown, DropdownDivider, DropdownItem, Fileupload, FloatingLabelInput, Helper, Input, Label, Modal, Search, Select, Spinner, TabItem, Tabs, Textarea } from "flowbite-svelte";
  import type { SceneDataType } from "../../routes/admin/(admin)/+page.server";
  import { removeAccents } from "$lib/utils/hepler";
  import { page } from "$app/stores";
  import { alertStore } from "../../stores/alert";
  import RichText from "./form-field/RichText.svelte";

  export let sceneId: string | null
  export let showFormModalAdd: boolean
  export let coordinatesAdd: { yaw: number, pitch: number }
  export let scenes: SceneDataType[]

  let description: string = ''
  let loading = false

  const handleSubmit = async (e: Event) => {
    if (loading) return
    loading = true

    let data: FormData = new FormData(e.target as HTMLFormElement)
    data.append('yaw', coordinatesAdd.yaw.toString())
    data.append('pitch', coordinatesAdd.pitch.toString())
    data.append('sceneId', sceneId || "0")
    data.append('description', description)

    const response = await fetch("/admin?/createHotspot", {
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
        type: 'error',
        //@ts-ignore
        description: result?.data?.error
      })
    }

    applyAction(result)

    loading = false
    showFormModalAdd = false
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

  let typesLink = [
    { value: '1', name: 'Cơ bản' },
    { value: '2', name: 'Trên cao' },
    { value: '3', name: 'Mặt đất' },
    { value: '4', name: 'Cơ bản 2' },
  ]

  let selectTypesLink = typesLink[0].value

  // info
  let types = [
    { value: '1', name: 'Cơ bản' },
    { value: '2', name: 'Video' },
  ]

  let selectTypes = types[0].value

</script>

<Modal id="form-modal" bind:open={showFormModalAdd} size="md" autoclose={false} class="w-full">
  <form class="flex flex-col" method="post" on:submit|preventDefault={handleSubmit}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Thêm mới điểm nóng</h3>
    <Tabs style="underline" >
      <TabItem open>
        <div slot="title" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.465 11.293c1.133-1.133 3.109-1.133 4.242 0l.707.707 1.414-1.414-.707-.707c-.943-.944-2.199-1.465-3.535-1.465s-2.592.521-3.535 1.465L4.929 12a5.008 5.008 0 0 0 0 7.071 4.983 4.983 0 0 0 3.535 1.462A4.982 4.982 0 0 0 12 19.071l.707-.707-1.414-1.414-.707.707a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l2.122-2.121z"></path><path d="m12 4.929-.707.707 1.414 1.414.707-.707a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.122 2.121c-1.133 1.133-3.109 1.133-4.242 0L10.586 12l-1.414 1.414.707.707c.943.944 2.199 1.465 3.535 1.465s2.592-.521 3.535-1.465L19.071 12a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0z"></path></svg>
          Liên kết
        </div>
        
        <input type="hidden" value="link" name="hotspotType">
        <div class="flex flex-col gap-4">
          <FloatingLabelInput
            style="filled"
            disabled
            type="text"
            value={JSON.stringify(coordinatesAdd)}
            label="Tọa độ"
          />

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
            >Loại
            <Select name="type" class="mt-2" items={typesLink} bind:value={selectTypesLink} />
          </Label>

          <!-- <Label
            >Hướng
            <Select name="direction" class="mt-2" items={directions} bind:value={selectedDirection} />
          </Label> -->

          <Button type="submit">
            {#if loading}
              <Spinner class="mr-3" size="4" />Đang lưu ...
            {:else}
              <span>Thêm mới</span>
            {/if}
          </Button>
        </div>
      </TabItem>

      <TabItem>
        <div slot="title" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg>
          Thông tin
        </div>
        
        <input type="hidden" value="info" name="hotspotType">
        <div class="flex flex-col gap-4">
          <FloatingLabelInput
            style="filled"
            disabled
            type="text"
            value={JSON.stringify(coordinatesAdd)}
            label="Tọa độ"
          />

          <Label
            >Loại
            <Select name="type" class="mt-2" items={types} bind:value={selectTypes} />
          </Label>

          <div>
            <Label for="title" class="mb-2">Tiêu đề</Label>
            <Input type="text" id="tile" name="title" placeholder="Tiêu đề" required />
          </div>

          {#if selectTypes == "1"}
            <RichText id="description" name="Nội dung" bind:value={description} />
          {:else if selectTypes == "2"}
            <div>
              <Label for="video" class="pb-2">Video</Label>
              <Input type="text" id="video" name="video" placeholder="eg. NrkWdRHKfZE" required />
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
      </TabItem>
    </Tabs>
  </form>
</Modal>