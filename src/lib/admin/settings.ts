import { page } from '$app/stores';
import { get } from 'svelte/store';

export const setting = (str: string) => {
  return get(page).data?.settings.find((v: any) => v.name == str)?.value || null
}