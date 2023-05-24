export const load = async () => {
  await new Promise(res => setTimeout(_ => res(1), 1000))
  return {}
}