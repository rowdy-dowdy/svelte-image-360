<script lang="ts">
  import { onMount } from "svelte";
  import Container from "../../lib/admin/components/container.svelte";
  import { formatBytes } from "../../lib/admin/utils/hepler";
  //@ts-ignore
  import Prism from 'prismjs';
  import { applyAction, enhance } from "$app/forms";
  import { clickOutside } from "$lib/utils/clickOutSide";

  export let form;

  let range = 3

  type FaceType = {
    path: string,
    name: string,
    preview?: string
    file?: File,
    position?: {
      w: number,
      h: number
    }
  }

  let faces: FaceType[] = [
    {
      path: "b",
      name: "Mặt sau (Back) (pz)",
      preview: undefined,
      file: undefined
    },
    {
      path: "d",
      name: "Mặt dưới (Down) (ny)",
      preview: undefined,
      file: undefined
    },
    {
      path: "f",
      name: "Mặt trước (Front) (nz)",
      preview: undefined,
      file: undefined
    },
    {
      path: "l",
      name: "Mặt trái (left) (px)",
      preview: undefined,
      file: undefined
    },
    {
      path: "r",
      name: "Mặt phải (Right) (nx)",
      preview: undefined,
      file: undefined
    },
    {
      path: "u",
      name: "Mặt trên (up) (py)",
      preview: undefined,
      file: undefined
    }
  ]
  
  const createUrlPreview = (event: Event, path: string) => {
    let faceIndex = faces.findIndex(v => v.path == path)

    if (faceIndex < 0) return

    if (faces[faceIndex].preview) {
      URL.revokeObjectURL(faces[faceIndex].preview!)
    }

    let file = ((event.target as HTMLInputElement).files as FileList)[0]

    faces[faceIndex].preview =  URL.createObjectURL(file)
    faces[faceIndex].file = file
  }

  const getSize = (face: FaceType) => {
    if (face.position) {
      return ` - ${face.position.w} x ${face.position.h}`
    }
  }

  const loadImagePreview = (e: any, path: any) => {
    let faceIndex = faces.findIndex(v => v.path == path)

    if (faceIndex < 0) return

    faces[faceIndex].position = {
      w: (e.target as HTMLImageElement).naturalWidth,
      h: (e.target as HTMLImageElement).naturalHeight
    }
  }

  let showGuide = false
  let loading = false
  let error = ""

  const checkFaceImages = () => {
    return true
    error = ""
    let isSuccess = true

    let position = faces[0].position
    
    for(let i = 0; i < faces.length; i++) {
      if (faces[i].position?.w != faces[i].position?.h) {
        error = "Hình ảnh các mặt phải là hình vuông"
        return false
      }
      if (faces[i].position?.w != position?.w || faces[i].position?.h != position?.h) {
        error = "Kích thước các hình ảnh không giống nhau"
        return false
      }
    }
    return true
  }

  const copyCode = () => {
    if (!document) return

    const copyText = document.getElementById("myCode")?.textContent;
    const textArea = document.createElement('textarea');
    textArea.textContent = copyText || "";
    document.body.append(textArea);
    textArea.select();
    // document.execCommand("copy");
    navigator.clipboard.writeText(textArea.value);
  }
</script>

<svelte:head>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css" rel="stylesheet" />
</svelte:head>

<div class="w-full py-8">
  <Container>
    <h1 class="text-3xl text-center">Tạo ảnh Marzipano</h1>
    <div class="mt-8"></div>

    {#if form?.success}
      <div class="mb-6 border border-green-500 p-4 rounded bg-green-200">Thành công</div>
    {/if}

    {#if form?.error}
      <div class="mb-6 border border-red-500 p-4 rounded bg-red-200">{form?.error}</div>
    {/if}

    <form action="?/split" method="post" enctype="multipart/form-data"
      use:enhance={({ form, data, action, cancel, submitter }) => {
        loading = true
        if (!checkFaceImages()) {
          loading = false
          cancel()
        }

        return async ({ result, update }) => {
          await applyAction(result);
          loading = false
        };
      }}
    >
      <div class="mb-6 flex justify-between items-center space-x-4">
        <div>
          <label class="" for="user_avatar">Nhập tên thư mục</label>
          <input type="text" class="form-input px-4 py-1 rounded-full" name="name" placeholder="VD: oriente-station" required>
        </div>
      </div>

      <div class="mb-6">
        <label for="user_avatar">Các mặt ảnh</label>
        <p class="mb-2 text-sm text-gray-500">Nên sử dụng các ảnh có dung lượng thấp. Các ảnh phải có pixel bằng nhau (Tối thiểu 2048x2048)</p>
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
          {#each faces as face}
            <div class="relative">
              <label for="{face.path}" class="border rounded cursor-pointer !flex flex-col items-center justify-center relative aspect-square">
                {#if face.preview}
                  <img src="{face.preview}" alt="" class="w-full h-full" on:load="{(e) => loadImagePreview(e, face.path)}">
                  <div class="absolute left-0 bottom-0 right-0 p-2 pt-8 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white">
                    {formatBytes(face.file?.size || 0)} {getSize(face)}
                  </div>
                {:else}
                  <span class="icon text-gray-700 w-14 h-14 my-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 5h13v7h2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h8v-2H4V5z"></path><path d="m8 11-3 4h11l-4-6-3 4z"></path><path d="M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3z"></path></svg>
                  </span>
                {/if}
              </label>
              <p class="mt-1 text-sm text-gray-500 text-center">{face.name}</p>
              <input class="sr-only absolute top-1/2 left-1/2 -translate-x-1/2 - translate-y-1/2" type="file" name="{face.path}" 
                id="{face.path}" 
                on:change={(e) => createUrlPreview(e, face.path)}
                accept="image/png, image/jpg, image/jpeg"
                required
              >
            </div>
          {/each}
        </div>
        {#if error}
          <p class="mt-1 text-sm text-red-500">{error}</p>
        {/if}
        
      </div>

      <div class="mb-6">
        <label class="" for="user_avatar">Create image preview</label>
        <div class="flex items-center space-x-2">
          <input type="checkbox" class="form-checkbox" name="preview" checked>
          <p class="mt-1 text-sm text-gray-500">Ảnh xem trước với kích thước nhỏ</p>
        </div>
      </div>

      {#if faces[0].position}
        {@const zoom = Math.max(Math.floor(Math.log2(faces[0].position.w) - 8),3)}
        <div class="mb-6">
          <label class="" for="user_avatar">Create zoom image</label>
          <p class="mb-1 text-sm text-gray-500">Kích thước <b>2048</b> phù hợp <b>3x</b>, <b>4096</b> = <b>4x</b>, <b>8192</b> = <b>5x</b></p>
          <div class="flex items-center space-x-2">
            {#each new Array(zoom) as item,key}
              <input type="checkbox" class="form-checkbox" name="zooms[]" checked value="{key+1}">
              <p>zoom {key+1}x</p>
            {/each}
          </div>
        </div>
      {/if}

      <div class="mb-6 mt-12 flex justify-between">
        <button class="px-4 py-2 bg-green-500 text-white rounded-full" 
          on:click|preventDefault={() => showGuide = !showGuide}>Hướng dẫn</button>
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-full">Tải xuống</button>
      </div>

      {#if form?.zip}
        <div class="mb-6 bg-gray-100 rounded border-2 border-dashed border-gray-400 
          p-4 relative cursor-pointer hover:border-blue-300 group">
          <div class="flex flex-col items-center justify-center space-y-2">
            <img src="/folder.png" alt="" class="w-10">
            <p class="text-gray-600">{form?.zip.split('--')[1]}</p>
          </div>
          <a href="api/zip/{form?.zip}" target="_blank" class="absolute top-0 left-0 w-full h-full bg-white/90 hidden flex-col 
            items-center justify-center space-y-2 text-gray-700 group-hover:flex">
            <span class="icon w-10 h-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 8zM4 19h16v2H4z"></path></svg>
            </span>
            <span>Download</span>
          </a>
        </div>
      {/if}
      
      {#if form?.jsText}
        <div class="relative bg-gray-200 rounded">
          <pre id="myCode">
            <div>
              {@html Prism.highlight(form?.jsText, Prism.languages["javascript"])}
            </div>
          </pre>
          <button class="absolute right-4 top-4 icon w-8 h-8 text-gray-800 hover:text-gray-500 cursor-pointer"
            on:click|preventDefault={copyCode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z"></path></svg>
          </button>
        </div>
      {/if}
    </form>
  </Container>
</div>

{#if showGuide}
  <div class="fixed top-0 left-0 bottom-0 right-0 bg-black/30">
    <div class="w-full max-w-5xl mx-auto min-h-screen flex flex-col">
      <div class="flex-1"></div>
      <div class="flex-none px-8 py-12 bg-white rounded content" 
        use:clickOutside on:clickOutside={() => showGuide = false}>
        <h3 class="text-3xl">Hướng dẫn</h3>
        <p class="font-semibold">1. Tạo ảnh cubebox</p>
        <p>Nếu đang sử dụng ảnh panorama thì truy cập 
          <a href="https://jaxry.github.io/panorama-to-cubemap/">https://jaxry.github.io/panorama-to-cubemap/</a> để tạo
          6 ảnh cubebox
        </p>
        <p class="font-semibold">2. Nén ảnh</p>
        <p>Truy cập liên kết
          <a href="https://shrinkme.app/?s=e">https://shrinkme.app/?s=e</a> để giảm dung lượng ảnh
        </p>
      </div>
      <div class="flex-1"></div>
    </div>
  </div>
{/if}

{#if loading}
  <div class="fixed top-0 left-0 bottom-0 right-0 bg-black/50 grid place-items-center">
    <span class="icon w-20 h-20 text-white animate-spin">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
    </span>
  </div>
{/if}

<style lang="postcss">
  .content p {
    @apply mt-2;
  }

  .content a {
    @apply text-blue-500 hover:text-blue-400;
  }
</style>