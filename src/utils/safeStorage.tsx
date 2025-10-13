// ★修正: Resultはそのまま利用
export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

// ★追加: フォールバック用のメモリ領域（ページライフタイム）
const memoryLocal = new Map<string, string>();
const memorySession = new Map<string, string>();

//sessionStorage を安全に取得し、使えればそのオブジェクトを返し、使えなければ（未対応・アクセス拒否など）null を返す
const getSession = (): Storage | null => {
  if (typeof window === "undefined") return null; //window オブジェクトが存在しない（SSR環境など）場合は null を返す
  if (!("sessionStorage" in window)) return null; //window に sessionStorage が存在しない場合は null
  try {
    return window.sessionStorage; //sessionStorage にアクセスして、そのオブジェクトを返す
  } catch {
    return null; //sessionStorage へのアクセスが失敗した場合
  }
};

//localStorage を安全に取得し、使えるならそのオブジェクトを返し、使えなければ null を返す
const getLocal = (): Storage | null => {
  if (typeof window === "undefined") return null;
  if (!("localStorage" in window)) return null;
  try {
    return window.localStorage; //localStorage にアクセスして、そのオブジェクトを返す
  } catch {
    return null;
  }
};

//Localで、使えない環境（ブロック/SSRなど）は メモリ(Map) にフォールバック
export const safeLocal = {
  get(key: string): Result<string | null> {
    try {
      const s = getLocal(); //getLocal() を呼び出して、localStorage を安全に取得
      if (!s) return { ok: true, value: memoryLocal.get(key) ?? null }; //localStorage が使えない場合メモリにフォールバック
      return { ok: true, value: s.getItem(key) }; //localStorage から指定された key の値を取得
    } catch (e) {
      return { ok: false, error: e as Error }; //getItem の呼び出しで例外が発生した場合
    }
  },

  set(key: string, val: string): Result<void> {
    try {
      const s = getLocal(); //getLocal() を呼び出して、localStorage を安全に取得
      if (!s) {
        memoryLocal.set(key, val); //localStorage が使えない場合,メモリ memoryLocal にデータを保存
        return { ok: true, value: undefined }; //メモリへの保存が成功した場合
      }
      s.setItem(key, val); //localStorage に指定された key と val を保存
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e as Error }; //setItem 実行中にエラーが発生した場合
    }
  },

  remove(key: string): Result<void> {
    try {
      const s = getLocal();
      if (!s) {
        memoryLocal.delete(key); // ★フォールバック
        return { ok: true, value: undefined };
      }
      s.removeItem(key);
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },
};

// ===================== safeSession =====================
export const safeSession = {
  get(key: string): Result<string | null> {
    try {
      const s = getSession(); // ★修正
      if (!s) return { ok: true, value: memorySession.get(key) ?? null }; // ★フォールバック
      return { ok: true, value: s.getItem(key) };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },

  set(key: string, val: string): Result<void> {
    try {
      const s = getSession();
      if (!s) {
        memorySession.set(key, val); // ★フォールバック
        return { ok: true, value: undefined };
      }
      s.setItem(key, val);
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },

  remove(key: string): Result<void> {
    try {
      const s = getSession();
      if (!s) {
        memorySession.delete(key); // ★フォールバック
        return { ok: true, value: undefined };
      }
      s.removeItem(key);
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },
};

// ===================== safeCookie =====================
type CookieOptions = {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
};

export const safeCookie = {
  get(name: string): Result<string | null> {
    try {
      if (typeof document === "undefined") return { ok: true, value: null }; // SSR対策 ★追加
      const match = document.cookie.match(
        // ★微調整: セパレータをより堅牢に（; + 任意空白）。既存でもOKならそのままで可
        new RegExp(
          "(^|;\\s*)" +
            name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1") +
            "=([^;]+)"
        )
      );
      return { ok: true, value: match ? decodeURIComponent(match[2]) : null };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },

  set(name: string, value: string, opts: CookieOptions = {}): Result<void> {
    try {
      if (typeof document === "undefined")
        return { ok: true, value: undefined }; // SSR対策 ★追加
      const { days, path = "/", domain, secure, sameSite = "Lax" } = opts;
      let cookie = `${name}=${encodeURIComponent(
        value
      )}; Path=${path}; SameSite=${sameSite}`;
      if (typeof days === "number") {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        cookie += `; Expires=${d.toUTCString()}`;
      }
      if (domain) cookie += `; Domain=${domain}`;
      if (secure || sameSite === "None") cookie += `; Secure`; // SameSite=None requires Secure
      document.cookie = cookie; // ※ ポリシーにより静かに失敗することあり
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e as Error };
    }
  },

  remove(name: string, opts: Omit<CookieOptions, "days"> = {}): Result<void> {
    return this.set(name, "", { ...opts, days: -1 });
  },
};
