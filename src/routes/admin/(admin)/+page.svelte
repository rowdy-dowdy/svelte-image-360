<script lang="ts">
  import { goto } from "$app/navigation";
  import AdminImage360 from "$lib/admin/AdminImage360.svelte";
  import ModalAddScene from "$lib/admin/ModalAddScene.svelte";
  import { removeAccents } from "$lib/utils/hepler";
  import { Button, Input, Spinner } from "flowbite-svelte";
  import { page } from "$app/stores";
  import Sortable from 'sortablejs';
	import { onMount } from "svelte";
  import { applyAction, enhance } from "$app/forms";
  import { alertStore } from "../../../stores/alert.js";
  import { Scene } from "marzipano";

  export let data

  let search = ''
  $: dataFilter = data.scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0)

  let hiddenAddModal = true

  if (data.scenes.length > 0 ) {
    if (!$page.url.searchParams.get('scene'))
      goto('?scene='+data.scenes[0].id)
  }

  // sort list scene
  let listScene: HTMLElement

  function arrayMove(orig: any, fromIndex: number, toIndex: number) {
    let arr = JSON.parse(JSON.stringify(orig));
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return arr;
  }
	
	$: stages = data.scenes.map(v => v.id)
  $: checkSort = (dataFilter.length == data.scenes.length) && (JSON.stringify(data.scenes.map(v => v.id)) != JSON.stringify(stages))

	onMount(async function() {
		Sortable.create(listScene, {
			group: 'foo',
			animation: 100,
      handle: ".item"
		});
	});
	
	const sort= (e: any)=> {
		let newStages = arrayMove(
			[...stages], 
			e.oldIndex, 
			e.newIndex
		);
		stages= newStages;
	};

  let loadingSaveSort = false

</script>

<div class="w-full h-full flex items-stretch">
  <div class="w-80 flex-none bg-white py-4 border-r flex flex-col space-y-6">
    <div class="hidden relative md:block px-4">
      <div class="flex absolute inset-y-0 left-0 items-center pl-5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 dark:text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
      </div>
      <Input id="search-navbar" class="pl-10" placeholder="Tìm kiếm..." bind:value={search} />
      {#if search != ""}
        <div class="flex absolute inset-y-1 right-5 items-center px-2 cursor-pointer rounded bg-primary-600 hover:bg-primary-500 text-white"
          on:click={() => search = ""}
        >
          <span class="material-symbols-outlined">
            search
          </span>
        </div>
      {/if}
    </div>

    <hr class="mx-4" />

    <div class="flex flex-col space-y-2 overflow-y-auto px-4" bind:this={listScene} on:sort={sort}>
      {#each dataFilter as item, i (i)}
        <a href="?scene={item.id}" class="flex items-center space-x-4 rounded hover:bg-gray-200 px-4 py-2 group
          {$page.url.searchParams.get('scene') == item.id ? '!bg-gray-200' : ''}"
        >
          <span class="flex-none icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z"></path><path d="m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z"></path></svg>
          </span>
          <span>{item.name}</span>
          <span class="flex-none icon item hidden group-hover:block !ml-auto text-teal-500 hover:text-teal-600 
            {dataFilter.length != data.scenes.length ? '!hidden' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 11h-5V6h3l-4-4-4 4h3v5H6V8l-4 4 4 4v-3h5v5H8l4 4 4-4h-3v-5h5v3l4-4-4-4z"></path></svg>
          </span>
        </a>
      {:else}
        <p class="text-center">Không có bối cảnh nào</p>
      {/each}
    </div>

    {#if checkSort}
      <form action="?/sortScene" method="post" class="px-4"
        use:enhance={() => {
          loadingSaveSort = true

          return async ({ result, update }) => {
            loadingSaveSort = false

            if (result.type == "failure") {
              alertStore.addAlert({
                type: "warning",
                title: result?.data?.error || "Có lỗi xảy ra"
              })
            }
            else if (result.type == "success") {
              alertStore.addAlert({
                type: "success",
                title: "Đăng nhập thành công",
              })

              data.scenes = data.scenes.map(v => {
                let i = stages.findIndex(v2 => v2 == v.id)
                
                return {
                  ...v,
                  sort: i
                }
              })
            }
            await applyAction(result)
          };
        }}
      >
        <input type="hidden" name="list" value={JSON.stringify(stages, null, 2)}>
        <Button type="submit" color="green" class="w-full" >
          {#if loadingSaveSort}
            <Spinner color="green" class="mr-3" size="4" />Đang lưu ...
          {:else}
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 21h14a2 2 0 0 0 2-2V8l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zM7 5h4v2h2V5h2v4H7V5zm0 8h10v6H7v-6z"></path></svg>
            </span>
            <span>Lưu vị trí</span>
          {/if}
        </Button>
      </form>
    {/if}

    <Button color="dark" outline on:click={() => hiddenAddModal = false} class="mx-4">
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
      </span>
      <span>Thêm mới bối cảnh</span>
    </Button>

  </div>
  <div class="flex-grow min-w-0 relative">
    {#if data.scenes.length > 0}
      <AdminImage360 data={data.scenes} groups={data.groups} />
    {:else}
      <p class="w-full h-full grid place-items-center">
        Không có bối cảnh nào, hãy tạo bối cảnh mới
      </p>
    {/if}
  </div>
</div>

<ModalAddScene bind:hidden={hiddenAddModal} bind:scenes={data.scenes} bind:groups={data.groups} />