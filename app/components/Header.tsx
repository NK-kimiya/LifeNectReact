import Link from "next/link";
export default function Header() {
  return (
    <>
      <header className=" mx-auto flex justify-between border-b border-orange-300 mb-3 px-10 ">
        <h1 className="text-4xl font-bold text-slate-900">LifeNect</h1>

        <nav className="">
          <ul className="flex justify-end p-3">
            <li>
              <p>
                <Link href="/" className="p-2 hover:text-orange-500 text-sm">
                  ログアウト
                </Link>
              </p>
            </li>
            <li>
              <p>
                <Link
                  href="/profile"
                  className="p-2 hover:text-orange-500 text-sm"
                >
                  マイページ
                </Link>
              </p>
            </li>
            <li>
              <a></a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
