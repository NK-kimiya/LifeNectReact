export default function Test() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-[10vh]">
        <h1>LifeNect</h1>
      </header>
      <div className="h-[90vh]">
        <div className="container mx-auto flex h-full">
          <div className="flex-[2] h-full">
            <div className="flex flex-col h-full">
              <div className="flex-[9] overflow-y-auto">
                <div className="p-4">
                  <p className="w-4/5 rounded-lg bg-gray-100 p-4">
                    うつ病の人が、どのように就職をしているのかを知りたいです。
                  </p>
                  <div className="w-4/5 mx-auto mt-4">
                    {aiError && (
                      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {aiError}
                      </p>
                    )}

                    {aiResponse?.answer && (
                      <div
                        className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
                        dangerouslySetInnerHTML={{ __html: aiResponse.answer }}
                      />
                    )}

                    {aiResponse?.mode === "safety_only" && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                        <p className="font-bold text-red-700">
                          {aiResponse.primary_support.title}
                        </p>

                        <a
                          href={aiResponse.primary_support.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block font-bold text-blue-600 underline"
                        >
                          {aiResponse.primary_support.name}
                        </a>

                        {aiResponse.other_supports?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {aiResponse.other_supports.map((support) => (
                              <a
                                key={support.url}
                                href={support.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-blue-600 underline"
                              >
                                {support.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-[1] relative">
                <form className="absolute bottom-0 w-full">
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="mt-6 min-h-36 w-full rounded-lg border border-slate-300 p-3"
                  />
                  <button
                    type="button"
                    onClick={handleSendAiMessage}
                    disabled={isSendingAiMessage}
                    className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white disabled:bg-slate-400"
                  >
                    {isSendingAiMessage ? "送信中..." : "送信"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="flex-[1] overflow-y-auto bg-gray-100 p-2">
            {aiResponse && !isSafetyResponse && references.length === 0 && (
              <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                参考にした投稿は見つかりませんでした。
              </p>
            )}
            {!isSafetyResponse && references.length > 0 ? (
              <div className="mt-6 grid gap-4">
                <h2 className="text-base font-bold text-slate-900">
                  参考にした投稿
                </h2>

                {references.map((reference) => {
                  const boardPost = reference.board_post;

                  return (
                    <Link
                      key={boardPost.id}
                      href={`/posts/${boardPost.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {boardPost.title}
                          </h3>

                          {boardPost.comment && (
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                              {boardPost.comment}
                            </p>
                          )}

                          {boardPost.image_url && (
                            <div className="relative mt-3 h-56 w-full overflow-hidden rounded-lg bg-slate-100">
                              <Image
                                src={boardPost.image_url}
                                alt={boardPost.title ?? "投稿画像"}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <UserAvatar
                              avatarUrl={boardPost.user?.avatar_url}
                              name={boardPost.user?.nickname}
                              size="sm"
                            />
                            <span>
                              {boardPost.user?.nickname ?? "匿名ユーザー"}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 text-xs text-slate-500">
                          {boardPost.created_at
                            ? new Date(boardPost.created_at).toLocaleDateString(
                                "ja-JP",
                              )
                            : ""}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
