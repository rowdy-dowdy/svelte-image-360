type Session = {
  adminId: String | null;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      session: Session
    }
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
