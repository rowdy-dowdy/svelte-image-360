<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
	import { alertStore } from "../../../stores/alert";
  import { Input, Label, Helper, Checkbox, Button, Spinner, A } from 'flowbite-svelte';

  let loading = false
</script>

<div class="w-full h-[1px] min-h-screen flex items-stretch">
  <div class="w-full flex min-h-full h-max">
    <div class="flex w-full items-stretch overflow-x-hidden">
      <div class="hidden md:flex w-5/12 items-center justify-center bg-gray-50 px-8 py-8">
        <img src="/images/bg-auth.png" alt="auth login" class="w-full" loading="lazy"/>
      </div>
    
      <div class="w-full px-8 md:w-7/12 md:px-20 py-8 bg-white">
        <div class="flex h-full w-full flex-col justify-between space-y-8">
          <div class="my-auto">
            <h3 class="text-2xl uppercase">LOGIN</h3>
            <h5 class="mt-4 text-4xl font-semibold">Welcome Back</h5>
            <p class="mt-4 text-gray-600">Please enter your account details</p>
        
            <form
              class="mt-10 max-w-xl"
              method="post"
              action="?/login"
              use:enhance={({ form, data, action, cancel }) => {
                loading = true

                return async ({ result, update }) => {
                  loading = false

                  if (result.type == "failure") {
                    alertStore.addAlert({
                      type: "warning",
                      title: result?.data?.error || "Có lỗi xảy ra"
                    })
                  }
                  else if (result.type == "redirect") {
                    alertStore.addAlert({
                      type: "success",
                      title: "Đăng nhập thành công",
                    })
                  }
                  await applyAction(result)
                };
              }}
            >
              <Label class="space-y-2 mb-4">
                <span>Email</span>
                <Input type="email" placeholder="name@gmail.com" name="email" required >
                  <svg slot="left" aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                </Input>
              </Label>

              <Label class="space-y-2 mb-4">
                <span>Password</span>
                <Input type="password" name="password" required >
                  <span slot="left" class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3 1.641 0 3-1.358 3-3 0-1.641-1.359-3-3-3z"></path><path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z"></path></svg>
                  </span>
                </Input>
              </Label>

              <Checkbox class="mb-4" name="remember">Remenber me.</Checkbox>

              <Button type="submit">
                {#if loading}
                  <Spinner class="mr-3" size="4" />Loading ...
                {:else}
                  <span>Continue</span>
                {/if}
              </Button>
            </form>
        
            <p class="!mt-12 text-gray-600">This site is protected by reCaptcha v3 and the Google</p>
            <p class="!mt-2 text-gray-600">
              <A href="#" class="underline">Privacy Policy</A>
              <span> and </span>
              <A href="#" class="underline">Teams of Use</A>
            </p>
          </div>
        
          <div class="flex items-center space-x-8">
            <A href="#" class="hover:underline">Teams Of Use</A>
            <A href="#" class="hover:underline">Privacy Policy</A>
            <A href="#" class="hover:underline">Cookie Policy</A>
            <A href="#" class="hover:underline">Status Page</A>
            <A href="#" class="hover:underline">Contact us</A>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>