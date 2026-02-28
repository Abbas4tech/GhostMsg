import type { Message } from "@/model/user.model";

export interface ApiResponse {
  isAcceptingMessage?: boolean;
  message: string;
  messages?: Message[];
  success: boolean;
}
