<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Editor from '@tinymce/tinymce-svelte';

  let clazz = ''
	export { clazz as class }

  export let id: string
  export let name: string
  export let required: boolean = false
  export let placeholder: string = ''
  export let defaultValue: any = ''
  export let value: string = ''

  export let details: {
    slugify: boolean
  } | undefined = undefined

</script>

<label for={id} class={`custom block rounded bg-gray-200 focus-within:bg-gray-300 select-none ${clazz}`}>
  <p class="text-sm font-semibold mb-1 flex items-center space-x-2 px-3 py-2">
    <span class="material-symbols-outlined">
      edit_note
    </span>
    <span>{name}</span>
  </p>

  <Editor
    scriptSrc={'/js/tinymce/tinymce.min.js'}
    bind:value={value}
    conf={{
      height: 300,
      min_height: 300,
      menubar: false,
      "plugins": [
        "advlist","autolink", "autoresize",
        "lists","link","image","charmap","preview","anchor","searchreplace","visualblocks",
        "fullscreen","insertdatetime","media","table","help","wordcount", "code", "codesample"
      ],
      toolbar: "styles | alignleft aligncenter alignright | bold italic forecolor backcolor | bullist numlist | link image table codesample | code fullscreen ",
      content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px }`,
      images_upload_url: '/api/admin/images/upload-tinymce'
    }}
  />
  
</label>

<style>
  .custom :global(.tox-tinymce) { border-radius: 5px }
  .custom :global(.tox-statusbar__branding) {
    display: none
  }
  .custom :global(.tox-editor-header) {
    padding: 4px 2px !important;
  }
  .custom :global(.tox-toolbar__group) {
    padding: 0px 2px !important;
  }
  .custom :global(.tox-toolbar__group > *) {
    margin: 0 !important;
  }
  .custom :global(.tox-toolbar__primary > * + *) {
    border-left: 1px solid #ccc !important;
  }
</style>