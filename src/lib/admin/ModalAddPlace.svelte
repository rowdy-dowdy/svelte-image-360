<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, deserialize, enhance } from '$app/forms';
  import { Drawer, Button, CloseButton, Label, Fileupload, Helper, Input, Progressbar } from 'flowbite-svelte'
  import { sineIn } from 'svelte/easing';
  import workerConvertURL from './convert?worker';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  export let hidden = true

  let transitionParamsRight = {
    x: 320,
    duration: 300,
    easing: sineIn
  }

  let loading = false
  let step = 0

  $: getPercent = () => {
    if (step >= 6) return 100

    return Math.round((step / 6) * 100)
  }

  const facePositions = {
    pz: {x: 1, y: 1, name: 'b'},
    nz: {x: 3, y: 1, name: 'f'},
    px: {x: 2, y: 1, name: 'l'},
    nx: {x: 0, y: 1, name: 'r'},
    py: {x: 1, y: 0, name: 'u'},
    ny: {x: 1, y: 2, name: 'd'}
  }

  let canvas: HTMLCanvasElement

  function getDataURL(imgData: ImageData, name: string): Promise<File> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvas.width = imgData.width
    canvas.height = imgData.height
    ctx?.putImageData(imgData, 0, 0)
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(new File([blob!], name)), 'image/jpeg', 0.92);
    })
  }

  let imageFaces: {name: string, file: File}[] = []

  const getWorkerData = async ({data: imageData}: {data : ImageData}) => {
    let faceOptions = Object.entries(facePositions)[imageFaces.length]

    let position = faceOptions[1]
    let temp = await getDataURL(imageData, position.name+'.jpg')
    imageFaces.push({name: position.name, file: temp })
    step += 1

    if (imageFaces.length == 6) {
      // console.log(imageFaces)
      sendRequestForm()
    }
    else {
      worker?.postMessage(optionsFaces[imageFaces.length])
    }
  }

  let worker: Worker | null = null
  let optionsFaces : {
    data: ImageData;
    face: string;
    rotation: number;
    interpolation: string;
  }[] = []

  const renderFacesImages = async (file: any) => {
    if (!browser) return

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const img = new Image();

    img.src = URL.createObjectURL(file);

    img.addEventListener('load', async () => {
      const { width, height } = img;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);

      const dataImage = ctx.getImageData(0, 0, width, height)
  
      for (let [faceName, position] of Object.entries(facePositions)) {
        const options = {
          data: dataImage,
          face: faceName,
          rotation: Math.PI * 180 / 180,
          interpolation: "lanczos",
        }
        optionsFaces.push(options)
      }
      worker?.postMessage(optionsFaces[0])
    })
  }

  let name: string = ''
  let files: FileList

  async function handleSubmit(event: Event) {
    if (loading || files.length < 0) return

    loading = true
    imageFaces = []
    
    renderFacesImages(files[0])
  }

  const sendRequestForm = async () => {
    let data: FormData = new FormData()
    data.append('name', name)
    imageFaces.forEach(v => {
      data.append(v.name, v.file)
    })

    const response = await fetch("?/split", {
      method: 'POST',
      body: data
    });
    /** @type {import('@sveltejs/kit').ActionResult} */
    const result = deserialize(await response.text());

    if (result.type === 'success') {
      await invalidateAll()

      console.log({result})
    }

    applyAction(result)

    loading = false
  }

  onMount(() => {
    worker = new workerConvertURL()
    worker.onmessage = getWorkerData
  })

</script>

<Drawer class="w-[700px] px-6" placement='right' transitionType="fly" transitionParams={transitionParamsRight} bind:hidden={hidden} id='sidebar6'>
  <form action="?/split" method="post" enctype="multipart/form-data" 
    class="w-full h-full flex flex-col"
    on:submit|preventDefault={handleSubmit}>
    <div class='flex-none flex items-center'>
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z"></path><path d="m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z"></path></svg>
        </span>
        <span class="ml-2">Thêm địa điểm mới</span>
      </h5>
      <CloseButton on:click={() => (hidden = true)} class='mb-4 dark:text-white'/>
    </div>
    
    <div class="flex-grow min-h-0 py-6 border-y mb-6">
      <div class="">
        <Label for="name" class="mb-2">Tiêu đề</Label>
        <Input type="text" id="name" name="name" placeholder="Vd: Văn phòng KennaTech tầng 2" required bind:value={name} />
      </div>
      <div class="mt-6">
        <Label for="image" class="pb-2">Tải lên ảnh</Label>
        <Fileupload id="image" class="mb-2" name="image" required bind:files={files} />
        <Helper>PNG, JPG (Tỷ lệ khung hình 2:1).</Helper>
      </div>
    </div>
    <div class="!mt-auto flex-none flex justify-end">
      <Button color="none" class="px-12" on:click={() => hidden = true}>Cancel</Button>
      <Button type="submit" class="px-12">Create</Button>
    </div>
  </form>

  {#if loading}
    <div class="fixed w-full h-full top-0 left-0"></div>
    <div class="absolute w-full h-full top-0 left-0 bg-white/80 grid place-items-center">
      {#if step < 6}
        <div class="w-full px-6">
          <div class="flex justify-between mb-1">
            <span class="text-base font-medium text-blue-700 dark:text-white">Đang chuẩn bị ...</span>
            <span class="text-sm font-medium text-blue-700 dark:text-white">{getPercent()}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style="width: {getPercent()}%"></div>
          </div>
        </div>
      {:else}
        <span class="icon w-16 h-16 animate-spin">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
        </span>
      {/if}
    </div>
  {/if}
</Drawer>