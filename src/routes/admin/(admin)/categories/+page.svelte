<script lang="ts">
  import { page } from "$app/stores";
  import ModalAddGroupScene from "$lib/admin/ModalAddGroupScene.svelte";
  import { removeAccents } from "$lib/utils/hepler.js";
  import type { GroupScene } from "@prisma/client";
  import { Button, Checkbox, Dropdown, DropdownItem, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toggle } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import moment from 'moment'

  export let data

  let search = ''
  $: dataFilter = data.groups.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0)

  let hiddenAddModal = true
  let recordEdit: GroupScene | undefined = undefined

  let columns: {
    id: string,
    name: string,
    show: boolean,
    width: 'auto' | string,
  }[] = [
    { id: "id", name: "id", show: true, width: '1px'},
    { id: "name", name: "name", show: true, width: 'auto'},
    { id: "sort", name: "sort", show: true, width: 'auto'},
    { id: "createdAt", name: "createdAt", show: true, width: '1px'},
    { id: "updatedAt", name: "updatedAt", show: true, width: '1px'}
  ]

	const openAddEditRecord = (e: Event, row?: GroupScene) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return

    recordEdit = row
    hiddenAddModal = false
  }

</script>

<div class='w-full h-full p-6 overflow-y-auto flex flex-col space-y-8'>
  <section class="flex items-center space-x-4">
    <div class="text-xl">
      <span class='text-gray-500'>Bộ sưu tập</span> <span class='px-3 select-none'>/</span>
      <span>Danh mục bối cảnh</span>
    </div>

    <span class="icon p-2 w-10 h-10 rounded-full hover:bg-gray-200 cursor-pointer">
      <span class="material-symbols-outlined">cached</span>
    </span>

    <div class='!ml-auto'></div>

    <Button on:click={openAddEditRecord}>
      <span class="material-symbols-outlined">add</span>
      <span>&nbsp;New Records</span>
    </Button>
  </section>

  <section class='flex items-center space-x-4'>
    <form class="w-full h-12 rounded-full bg-gray-200 px-4 flex items-center space-x-3">
      <span class="material-symbols-outlined">search</span>
      <input type="text" class='flex-grow min-w-0 border-none !ring-0 bg-transparent p-0' placeholder='Search ...' bind:value={search} />
      {#if search != ""}
        <div transition:slide={{axis: 'x'}} class="flex-none flex">
          <Button size="xs" color="yellow" type="submit">Search</Button>
          <Button size="xs" color="none" on:click={() => search = ""}>Clear</Button>
        </div>
      {/if}
    </form>
  </section>

  <section class="w-full custom-table">
    <Table hoverable={true} striped={true} divClass="relative border border-gray-300 rounded-lg">
      <TableHead>
        <TableHeadCell class="w-0 pr-0">
          <Checkbox />
        </TableHeadCell>
        {#each columns.slice().filter(v => v.show) as item}
          <TableHeadCell width={item.width}>{item.name}</TableHeadCell>
        {/each}
        <TableHeadCell class="w-0">
          <button class="p-1 rounded hover:bg-gray-200">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
          <Dropdown placement="bottom-end">
            {#each columns.slice().filter(v => v.name != "id") as item}
              <DropdownItem>
                <Toggle color="green" bind:checked={item.show}>{item.name}</Toggle>
              </DropdownItem>
            {/each}
          </Dropdown>
        </TableHeadCell>
      </TableHead>
      <TableBody tableBodyClass="divide-y">
        {#each dataFilter as item (item.id)}
          <TableBodyRow on:click={(e) => openAddEditRecord(e, item)} class="cursor-pointer">
            <TableBodyCell class="w-0 pr-0">
              <Checkbox />
            </TableBodyCell>
            {#each columns.slice().filter(v => v.show) as column (`${item.id}-${column.id}`)}
              <TableBodyCell tdClass="px-6 py-4 font-normal text-gray-900 dark:text-white">
                {#if column.name == "id"}
                  <div class="whitespace-normal min-w-[300px]">{item[column.name]}</div>
                {:else if column.name == "name"}
                  <div>{item[column.name]}</div>
                {:else if column.name == "sort"}
                  <div>{item[column.name]}</div>
                {:else if column.name == "createdAt" || column.name == "updatedAt"}
                  {@const date = moment(item[column.name])}
                  <div class="whitespace-nowrap text-center">
                    <p class="text-sm">{date.format('YYYY-MM-DD')}</p>
                    <p class='text-gray-500 text-xs'>{date.format('HH:mm:ss')}</p>
                  </div>
                {/if}
              </TableBodyCell>
            {/each}
            <TableBodyCell tdClass="px-6 py-4 font-normal text-gray-900 dark:text-white">
              <span class="material-symbols-outlined">arrow_right_alt</span>
            </TableBodyCell>
          </TableBodyRow>
        {:else}
          <TableBodyRow>
            <TableBodyCell colspan={columns.length + 2}>
              <div class="flex flex-col items-center space-y-4">
                <span>There are no records</span>
                <Button size="xs" on:click={(e) => {
                  e.stopPropagation()
                  openAddEditRecord(e)
                }}>
                  <span class="material-symbols-outlined">add</span>
                  <span>&nbsp;New Records</span>
                </Button>
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
        <!-- <TableBodyRow>
          <TableBodyCell colspan={columns.length + 2}>
            <section class="flex items-center justify-between space-x-4">
              <span class="text-gray-500">Showing 
                <span class="text-primary-900">
                  {(data.page - 1) * data.perPage + (data.data.length > 0 ? 1 : 0)} - 
                  {(data.page - 1) * data.perPage + data.data.length}</span> of 
                <span>{data.count}</span>
              </span>
              <span class="!ml-auto text-gray-500 flex items-center space-x-2">
                <span>Rows per page</span>
                <Select size="sm" items={rowsPerPage}  value={data.perPage} placeholder="" 
                  on:change={(e) => changePerPage(e)} />
              </span>
              <Pagination {pages} on:previous={() => changePage("previous")} on:next={() => changePage("next")} />
            </section>
          </TableBodyCell>
        </TableBodyRow> -->
      </TableBody>
    </Table>
  </section>
</div>

<ModalAddGroupScene bind:hidden={hiddenAddModal} bind:editValue={recordEdit} />

<style>
  .custom-table :global(table) {
    /* table-layout: fixed; */
    /* border-collapse: separate; */
    min-width: 100%;
  }
</style>
