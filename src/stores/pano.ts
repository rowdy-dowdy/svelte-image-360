import { writable } from 'svelte/store';

export const hold = writable(false)

export const allowedPlayAduio = writable(false)

export const showListScene = writable(true)

export const videoShow = writable<string | null>(null)