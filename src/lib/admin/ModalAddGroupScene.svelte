<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, deserialize, enhance } from '$app/forms';
  import { Drawer, Button, CloseButton, Label, Fileupload, Helper, Input, Progressbar, Textarea } from 'flowbite-svelte'
  import { sineIn } from 'svelte/easing';
  import { invalidateAll } from '$app/navigation';
  import { alertStore } from '../../stores/alert';
  import slugify from "slugify";
  import type { SceneDataType } from '../../routes/admin/(admin)/+page.server';
  import type { GroupScene } from '@prisma/client';

  export let hidden = true
  export let editValue: GroupScene | undefined

  let transitionParamsRight = {
    x: 320,
    duration: 300,
    easing: sineIn
  }
  
  let name = ''

  $: name = editValue?.name || ""

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

      hidden = true
    }
    else {
      alertStore.addAlert({
        type: 'error'
      })
    }
    loading = false
  }

  const handelDelete = async () => {
    if (loading) return

    loading = true

    let data: FormData = new FormData()
    data.append('id', editValue?.id || "")

    const response = await fetch(`?/delete`, {
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

      hidden = true
    }
    else {
      alertStore.addAlert({
        type: 'error'
      })
    }
    loading = false
  }

</script>

<Drawer activateClickOutside={false} class="w-[600px] px-6" placement='right' transitionType="fly" transitionParams={transitionParamsRight} bind:hidden={hidden} id='sidebar6'>
  <form action="?/addEdit" method="post" enctype="multipart/form-data" 
    class="w-full min-h-full flex flex-col {loading ? 'overflow-hidden !h-full' : ''}"
    on:submit|preventDefault={handleSubmit}>
    <div class='flex-none flex items-center'>
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <span class="material-symbols-outlined">
          category
        </span>
        <span class="ml-2">{editValue ? 'Sửa' : 'Thêm'} danh mục bối cảnh mới</span>
      </h5>
      <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>
    </div>
    
    <div class="flex-grow min-h-0 py-6 border-y mb-6">
      <input type="hidden" name="editId" value="{editValue?.id || ''}">
      <div class="">
        <Label for="name" class="mb-2">Tên danh mục</Label>
        <Input type="text" id="name" name="name" placeholder="Vd: Khu đua ngựa" required bind:value={name} />
      </div>
    </div>
    
    <div class="!mt-auto flex-none flex">
      {#if editValue}
        <button class="text-sm text-red-600" on:click|preventDefault={handelDelete}>Delete</button>
      {/if}
      <div class="!ml-auto"></div>
      <Button color="none" class="px-12" on:click={() => hidden = true}>Hủy bỏ</Button>
      <Button type="submit" class="px-12">{editValue ? 'Lưu' : 'Tạo mới'}</Button>
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