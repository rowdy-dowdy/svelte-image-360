<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button, Label, Modal, TabItem, Tabs, Input, Select, Fileupload, Helper } from "flowbite-svelte";
  import { alertStore } from "../../../../stores/alert";
  export let data
  let isGroupSettingsOpen = false

  $: groupSettings = data.groupSettings
  $: groupSettingActive = groupSettings.length > 0 ? groupSettings[0] : null

  let isSettingsOpen = false
</script>

<div class="w-full h-full p-6 overflow-y-auto flex flex-col space-y-6">
  <section class="flex items-center space-x-4">
    <div class="text-xl">
      <span class="text-gray-500">Settings</span>
      <span class="px-3 select-none">/</span>
      <span>Application</span>
    </div>

    <div class="!ml-auto" />
    <Button outline on:click={() => isSettingsOpen = true}>
      <span class="material-symbols-outlined">add</span>
      <span>&nbsp;New Settings</span>
    </Button>
    <Button on:click={() => isGroupSettingsOpen = true}>
      <span class="material-symbols-outlined">add</span>
      <span>&nbsp;New Group Settings</span>
    </Button>
  </section>

  <section class="w-full">
    <div class="flex flex-wrap space-x-2 font-semibold text-gray-500 text-sm">
      {#each groupSettings as item}
        <button
          class="p-4 hover:bg-gray-200 rounded-t-lg {groupSettingActive?.id == item.id ? 'text-primary-700 bg-gray-200' : ''}"
          on:click={() => groupSettingActive = item}
        >{item.name}</button
        >
      {/each}
    </div>
    <div class="h-px bg-gray-200 dark:bg-gray-700" />

    <div class="mt-4">
      <div class="w-full bg-white rounded-lg p-6 shadow-sm border">
        <form action="?/saveSettings" class="flex flex-col space-y-4" method="post"
          use:enhance={({ formElement, formData, action, cancel, submitter }) => {

            return async ({ result, update }) => {
              if (result.type === 'success') {
                alertStore.addAlert({
                  type: "success",
                })
                let temp = groupSettingActive
                await invalidateAll();
                groupSettingActive = temp
              }
              else {
                alertStore.addAlert({
                  type: "error",
                  title: result?.data?.error || "Có lỗi xảy ra"
                })
              }
            };
          }}
        >
          <div class="flex flex-wrap -mx-2">
            {#if groupSettingActive}
              {#each groupSettingActive.settings as item}
                {#if item.field == "text"}
                  <div class="px-2 mb-4" style="width: {item.details?.width / 12 * 100}%">
                    <Label for="{item.name}" class="mb-2 capitalize">{item.name}</Label>
                    <Input type="text" id="{item.name}" name="{item.name}" placeholder="{item.name}"  />
                  </div>
                {:else if item.field == "image"}
                  <div class="px-2 mb-4" style="width: {item.details?.width / 12 * 100}%">
                    {#if item.value}
                      <div class="w-40 h-40 rounded border border-gray-900 overflow-hidden mb-2">
                        <img src="{item.value}" alt="" class="w-full h-full object-cover" loading="lazy">
                      </div>
                    {/if}
                    <Label for="{item.name}" class="mb-2 capitalize">{item.name}</Label>
                    <Input type="file" id="{item.name}" name="{item.name}" placeholder="{item.name}"  />
                  </div>
                {:else if item.field == "audio"}
                  <div class="px-2 mb-4" style="width: {item.details?.width / 12 * 100}%">
                    {#if item.value}
                      <div class="flex mb-4 space-x-4 items-center">
                        <audio controls>
                          <source src="{item.value}" type="audio/mpeg">
                        </audio>
                      </div>
                    {/if}
                    <Label for="{item.name}" class="mb-2 capitalize">{item.name}</Label>
                    <Fileupload id="{item.name}" accept=".mp3,audio/*" name="{item.name}" placeholder="{item.name}" />
                    <Helper class="mt-1">MP3, audio.</Helper>
                  </div>
                {/if} 
              {:else}
                <div class="w-full flex flex-col justify-center items-center px-2 mb-4">
                  <p class="p-4 text-center">There are no  Settings</p>
                  <Button outline size="sm" on:click={() => isSettingsOpen = true}>
                    <span class="material-symbols-outlined">add</span>
                    New Settings
                  </Button>
                </div>
              {/each}
            {:else}
              <div class="w-full flex flex-col justify-center items-center px-2 mb-4">
                <p class="p-4 text-center">There are no  Settings</p>
                <Button outline size="sm" on:click={() => isSettingsOpen = true}>
                  <span class="material-symbols-outlined">add</span>
                  New Settings
                </Button>
              </div>
            {/if}
          </div>
          <div class="flex justify-end">
            <Button type="submit">Save changed</Button>
          </div>
        </form>
      </div>
    </div>
  </section>
</div>

<Modal title="Add New Group Settings" bind:open={isGroupSettingsOpen} autoclose outsideclose>
  <form action="?/createGroup" method="post" 
    use:enhance={({ formElement, formData, action, cancel, submitter }) => {

      return async ({ result, update }) => {
        if (result.type === 'success') {
          alertStore.addAlert({
            type: "success",
          })
          isGroupSettingsOpen = false
          await invalidateAll();
        }
        else {
          alertStore.addAlert({
            type: "error",
            title: result?.data?.error || "Có lỗi xảy ra"
          })
        }
      };
    }} 
    class="grid gap-6"
  >
    <div>
      <Label for="name" class="mb-2">Name</Label>
      <Input type="text" id="name" name="name" placeholder="name" required  />
    </div>
    <div>
      <input type="submit" value="save" class="bg-sky-600 hover:bg-sky-500 rounded text-white px-6 py-2 cursor-pointer">
    </div>
  </form>
</Modal>

<Modal title="Add New Settings" bind:open={isSettingsOpen} autoclose outsideclose>
  <form action="?/createSetting" method="post" 
    use:enhance={({ formElement, formData, action, cancel, submitter }) => {

      return async ({ result, update }) => {
        if (result.type === 'success') {
          alertStore.addAlert({
            type: "success",
          })
          isSettingsOpen = false
          await invalidateAll();
        }
        else {
          alertStore.addAlert({
            type: "error",
            title: result?.data?.error || "Có lỗi xảy ra"
          })
        }
      };
    }} 
    class="grid gap-6 w-[500px]"
  >
    <input type="hidden" name="groupId" value={groupSettingActive?.id}>
    <div>
      <Label for="name" class="mb-2">Name</Label>
      <Input type="text" id="name" name="name" placeholder="name" required  />
    </div>
    <div>
      <Label>Select an option
        <Select class="mt-2" items={[{value:"text", name: "text"}, 
          {value:"image", name: "image"}, 
          {value:"audio", name: "audio"}]} name="field" value="text" />
      </Label>
    </div>
    <div>
      <Label for="width" class="mb-2">Width 1 - 12</Label>
      <Input type="number" id="width" name="width" placeholder="eg. 1 - 12" required  value="6" />
    </div>
    <div>
      <input type="submit" value="save" class="bg-sky-600 hover:bg-sky-500 rounded text-white px-6 py-2 cursor-pointer">
    </div>
  </form>
</Modal>