<script>
  import ModalAddPlace from "$lib/admin/ModalAddPlace.svelte";
import { removeAccents } from "$lib/utils/hepler";


  import { Button, Input } from "flowbite-svelte";

  const list = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z"></path><path d="m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z"></path></svg>`,
      name: 'Địa điểm',
      path: 'place'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z"></path><path d="m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z"></path></svg>`,
      name: 'Địa điểm',
      path: 'place'
    }
  ]

  let search = ''
  $: dataFilter = list.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0)

  let hiddenAddModal = true

</script>
<div class="h-full flex items-stretch">
  <div class="flex-none bg-white p-4 border-r flex flex-col space-y-6">
    <div class="hidden relative md:block">
      <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 dark:text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
      </div>
      <Input id="search-navbar" class="pl-10" placeholder="Search..." bind:value={search} />
      <div class="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
      </div>
    </div>

    <hr />

    <div class="flex flex-col space-y-2">
      {#each dataFilter as item, i (i)}
        <a href="{item.path}" class="flex items-center space-x-4 rounded hover:bg-gray-200 px-4 py-2">
          <span class="icon">
            {@html item.icon}
          </span>
          <span>{item.name}</span>
        </a>
      {:else}
        <p class="text-center">No records found.</p>
      {/each}
    </div>

    <Button color="dark" outline on:click={() => hiddenAddModal = false}>
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
      </span>
      <span>Thêm mới địa điểm</span>
    </Button>

  </div>
  <div class="flex-grow min-w-0"></div>
</div>

<ModalAddPlace bind:hidden={hiddenAddModal} />