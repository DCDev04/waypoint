// features/workflows/components/search-highlight.tsx

type Props = {
  text: string
  query?: string
}

export function SearchHighlight({ text, query }: Props) {
  if (!query?.trim()) return <>{text}</>

  const regex = new RegExp(`(${query.trim()})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200 px-0.5 text-yellow-900"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
