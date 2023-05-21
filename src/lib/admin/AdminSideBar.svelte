<script>

  import { Dropdown, DropdownItem } from "flowbite-svelte";

</script>
<div class="h-full flex bg-white">
  <div class="p-4 border-r flex flex-col space-x-4">
    <a href="/admin" class="block w-10 h-10 rounded overflow-hidden">
      <img src="./logo.png" alt="logo" class="w-full h-full object-contain">
    </a>

    <div class="!mt-auto">
      <div id="userImage">
        fsadfsdf
      </div>
      <Dropdown placement="top-start" triggeredBy="#userImage">
        <DropdownItem>Dashboard</DropdownItem>
        <DropdownItem>Settings</DropdownItem>
        <DropdownItem>Earnings</DropdownItem>
        <DropdownItem slot="footer">Sign out</DropdownItem>
      </Dropdown>
    </div>
  </div>
</div>