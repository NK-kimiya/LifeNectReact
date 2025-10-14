import { Dispatch, SetStateAction } from "react";

export const handleApiError = (
  error: any,
  setError: Dispatch<SetStateAction<string>>,
  defaultMessage: string
): void => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        setError("入力が不正です。");
        break;
      case 401:
        setError(
          "トークンが無効です、ログインしてください。または、ログアウトして再度ログインして下さい。"
        );

        break;
      case 500:
        setError("サーバーエラーが発生しました。");
        break;
      default:
        setError(defaultMessage);
        break;
    }
  } else {
    setError("ネットワークエラーが発生しました。");
  }
};
