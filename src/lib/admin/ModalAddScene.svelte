<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, deserialize, enhance } from '$app/forms';
  import { Drawer, Button, CloseButton, Label, Fileupload, Helper, Input, Progressbar, Textarea, Select } from 'flowbite-svelte'
  import { sineIn } from 'svelte/easing';
  import { invalidateAll } from '$app/navigation';
  import { alertStore } from '../../stores/alert';
  import slugify from "slugify";
  import type { SceneDataType } from '../../routes/admin/(admin)/+page.server';
  import type { GroupScene } from '@prisma/client';

  export let hidden = true
  export let scenes: SceneDataType[]
  export let groups: GroupScene[]

  $: groupsList = [{
    value: null, name: 'Tất cả'
  },...groups.map(v => ({
    value: v.id,
    name: v.name
  }))]

  let groupSelect: string | undefined

  let transitionParamsRight = {
    x: 320,
    duration: 300,
    easing: sineIn
  }

  let name = ''
  $: slug = slugify(name, {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: false,     // strip special characters except replacement, defaults to `false`
    locale: 'vi',      // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  })

  let loading = false

  const handleSubmit = async (e: Event) => {
    if (loading) return

    loading = true

    let data: FormData = new FormData(e.target as HTMLFormElement)
    // data.append('name', name)

    const response = await fetch((e.target as HTMLFormElement).action, {
      method: 'POST',
      body: data
    });
    /** @type {import('@sveltejs/kit').ActionResult} */
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
        description: result?.data?.error
      })
    }

    applyAction(result)

    hidden = true
    loading = false
  }

</script>

<Drawer activateClickOutside={false} class="w-[700px] px-6" placement='right' transitionType="fly" transitionParams={transitionParamsRight} bind:hidden={hidden} id='sidebar6'>
  <form action="?/addScene" method="post" enctype="multipart/form-data" 
    class="w-full min-h-full flex flex-col {loading ? 'overflow-hidden !h-full' : ''}"
    on:submit|preventDefault={handleSubmit}>
    <div class='flex-none flex items-center'>
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z"></path><path d="m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z"></path></svg>
        </span>
        <span class="ml-2">Thêm địa điểm mới</span>
      </h5>
      <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>
    </div>
    
    <div class="flex-grow min-h-0 py-6 border-y mb-6">
      <input type="hidden" name="sort" value={scenes.length}>
      <div class="">
        <Label for="name" class="mb-2">Tiêu đề <span class="text-red-500">(*)</span></Label>
        <Input type="text" id="name" name="name" placeholder="Vd: Bán đảo Bắc Hà" required bind:value={name} />
      </div>
      <div class="mt-6">
        <Label for="slug" class="mb-2">Slug <span class="text-red-500">(*)</span></Label>
        <Input type="text" id="slug" name="slug" required bind:value={slug} />
      </div>
      <div class="mt-6">
        <Label for="image" class="pb-2">Tải lên ảnh <span class="text-red-500">(*)</span></Label>
        <Fileupload accept="image/*" id="image" class="mb-2" name="image" required />
        <Helper>PNG, JPG (Tỷ lệ khung hình 2:1).</Helper>
      </div>
      <div class="mt-6">
        <Label for="audio" class="pb-2">Âm thanh</Label>
        <Fileupload accept=".mp3,audio/*" id="audio" class="mb-2" name="audio" />
        <Helper>MP3, audio.</Helper>
      </div>
      <div class="mt-6">
        <Label for="groupId" class="mb-2">Danh mục</Label>
        <Select class="mt-2" name="groupId" items={groupsList} bind:value={groupSelect} />
      </div>
      <div class="mt-6">
        <Label for="description" class="mb-2">Nội dung</Label>
        <Textarea id="description" placeholder="Nội dung" rows="10" name="description" />
      </div>
    </div>
    
    <div class="!mt-auto flex-none flex justify-end">
      <Button color="none" class="px-12" on:click={() => hidden = true}>Hủy bỏ</Button>
      <Button type="submit" class="px-12">Tạo mới</Button>
    </div>
  </form>

  {#if loading}
    <!-- <div class="fixed w-full h-full top-0 left-0"></div> -->
    <div class="absolute w-full h-full top-0 left-0 bg-white/80 grid place-items-center">
      <span class="icon w-16 h-16 animate-spin">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
      </span>
    </div>
  {/if}
</Drawer>