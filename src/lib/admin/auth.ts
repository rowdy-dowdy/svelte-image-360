import { applyAction, deserialize } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { alertStore } from "../../stores/alert";

export const logout = async () => {
  let data: FormData = new FormData()

  const response = await fetch("/admin/login?/logout", {
    method: 'POST',
    body: data
  });
  // /** @type {import('@sveltejs/kit').ActionResult} */
  const result = deserialize(await response.text());

  if (result.type === 'success') {
    await invalidateAll()

    alertStore.addAlert({
      type: 'success'
    })
  }
  else {
    alertStore.addAlert({
      type: 'error'
    })
  }

  applyAction(result)
}