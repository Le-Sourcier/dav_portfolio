import { apiClient } from "@/services/api/client";

export interface VisitorOtpVerifyResponse {
  token: string;
}

export const visitorApi = {
  requestOtp: (email: string, name: string) =>
    apiClient.post<null>("/visitor/request-otp", { email, name }),

  verifyOtp: (email: string, code: string, name: string, remember: boolean) =>
    apiClient.post<VisitorOtpVerifyResponse>("/visitor/verify-otp", {
      email,
      code,
      name,
      remember,
    }),
};

export default visitorApi;
