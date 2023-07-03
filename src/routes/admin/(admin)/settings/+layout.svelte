<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from 'flowbite-svelte';

  export let data
</script>

<div class="w-full h-full flex">
  <div class="flex-none">
    <div class='w-60 h-full bg-white border-r px-4 py-6 flex flex-col space-y-2'>
      <p class="text-sm font-semibold pb-2">System</p>

      <a href="/admin/settings" class="flex items-center space-x-2 rounded hover:bg-gray-200 p-2 cursor-pointer
        {$page.url.pathname == `/admin/settings` ? 'bg-gray-200' : ''}">
        <span class="material-symbols-outlined">house</span>
        <span>Application</span>
      </a>
      <a href="/admin/settings/files" class="flex items-center space-x-2 rounded hover:bg-gray-200 p-2 cursor-pointer
        {$page.url.pathname == `/admin/settings/files` ? 'bg-gray-200' : ''}">
        <span class="material-symbols-outlined">storage</span>
        <span>Files storage</span>
      </a>

      <p class="text-sm font-semibold pb-2 pt-4">Authentication</p>
      <a href="/admin/settings/roles" class="flex items-center space-x-2 rounded hover:bg-gray-200 p-2 cursor-pointer
        {$page.url.pathname == `/admin/settings/roles` ? 'bg-gray-200' : ''}">
        <span class="material-symbols-outlined">admin_panel_settings</span>
        <span>Roles</span>
      </a>
      <a href="/admin/settings/admins" class="flex items-center space-x-2 rounded hover:bg-gray-200 p-2 cursor-pointer
        {$page.url.pathname == `/admin/settings/admins` ? 'bg-gray-200' : ''}">
        <span class="material-symbols-outlined">supervisor_account</span>
        <span>Admins</span>
      </a>
    </div>
  </div>
  <div class="flex-grow min-w-0">
    <slot/>
  </div>
</div>