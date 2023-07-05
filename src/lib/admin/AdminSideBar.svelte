<script>
  import { Dropdown, DropdownItem } from "flowbite-svelte";
  import { page } from "$app/stores";
  import { logout } from "./auth";
  /** @type {import('../../routes/admin/(admin)/$types').LayoutData["user"]} */
  export let user
</script>

<div class="h-full flex bg-white">
  <div class="p-4 border-r flex flex-col space-y-6">
    <a href="/admin" class="block w-10 h-10 rounded overflow-hidden">
      <img src="/logo.png" alt="logo" class="w-full h-full object-contain">
    </a>

    <div class="!mt-7"></div>

    <a href="/admin" class="icon w-10 h-10 rounded-xl p-1.5 hover:bg-gray-200 border-2 border-transparent 
      {$page.url.pathname == "/admin" ? '!border-gray-800' : ''}"
    >
      <span class="material-symbols-outlined icon-xl">
        database
      </span>
    </a>

    <a href="/admin/categories" class="icon w-10 h-10 rounded-xl p-1.5 hover:bg-gray-200 border-2 border-transparent 
      {$page.url.pathname == "/admin/categories" ? '!border-gray-800' : ''}"
    >
      <span class="material-symbols-outlined icon-xl">
        category
      </span>
    </a>

    <!-- <a href="/admin/logs" class="icon w-10 h-10 rounded-xl p-1.5 hover:bg-gray-200 border-2 border-transparent 
      {$page.url.pathname == "/admin/logs" ? '!border-gray-800' : ''}"
    >
      <span class="material-symbols-outlined">
        earthquake
      </span>
    </a> -->

    <a href="/admin/settings" class="icon w-10 h-10 rounded-xl p-1.5 hover:bg-gray-200 border-2 border-transparent 
      {$page.url.pathname == "/admin/settings" ? '!border-gray-800' : ''}"
    >
      <span class="material-symbols-outlined icon-xl">
        settings
      </span>
    </a>

    <div class="!mt-auto">
      <div id="userImage" class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 select-none cursor-pointer">
        <img src="{user.image}" alt="logo" class="w-full h-full object-contain">
      </div>
      <Dropdown placement="top-start" triggeredBy="#userImage">
        <DropdownItem href="/admin">Bảng điều khiển</DropdownItem>
        <DropdownItem href="/admin/logs">Nhật ký</DropdownItem>
        <DropdownItem href="/admin/settings">Cài đặt</DropdownItem>
        <DropdownItem slot="footer"
          on:click={logout}
        >Đăng xuất</DropdownItem>
      </Dropdown>
    </div>
  </div>
</div>