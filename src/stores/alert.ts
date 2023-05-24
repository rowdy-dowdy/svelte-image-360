import { writable } from 'svelte/store';
import { v4 } from 'uuid';

type AlertTypeWithoutId = {
  type: "success" | "error" | "warning"
  title?: string
  description?: string
}

type AlertType = AlertTypeWithoutId & {
  id: string
}

function createAlert() {
	const { subscribe, set, update } = writable<AlertType[]>([]);

	return {
		subscribe,
		addAlert: (alert: AlertTypeWithoutId) => update(n => {
      const uuid = v4();
      if (!alert.title) {
        alert.title = alert.type == "success" ? "Tuyệt vời! Mọi thứ đã hoạt động!"
          : alert.type == "warning" ? "Ôi không! Đã xảy ra sự cố"
          : "Không! Có một lỗi đã xảy ra"
      }

      if (!alert.description) {
        alert.description = alert.type == "success" ? "Yêu cầu của bạn đã hoàn tất thành công"
          : "Thử lại hoặc liên hệ với quản trị viên của chúng tôi"
      }

      setTimeout(() => {
        alertStore.delAlert(uuid)
      }, 5000);

      return [...n, {
        ...alert,
        id: uuid
      }]
    }),
    delAlert: (id: string) => update(n => n.filter(v => v.id != id)),
		reset: () => set([])
	};
}

export const alertStore = createAlert();