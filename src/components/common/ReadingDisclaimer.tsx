import { Shield } from 'lucide-react'

export function ReadingDisclaimer() {
  return (
    <div
      className="rounded-xl px-4 py-3 sm:px-5 sm:py-4 mt-6"
      style={{
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, rgba(147, 51, 234, 0.06) 100%)',
        border: '1px solid rgba(147, 51, 234, 0.15)',
      }}
    >
      <div className="flex gap-3 items-start">
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(217, 119, 6, 0.1))',
            border: '1px solid rgba(147, 51, 234, 0.25)',
          }}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="space-y-1.5 text-gray-500 text-xs leading-relaxed">
          <p>
            Būrimas runomis atliekamas tik <span className="text-gray-400">registruoto asmens ir tik jam pačiam</span>, dėl savo asmeninių klausimų ir gyvenimo situacijų.
          </p>
          <p>
            Būrimas kitiems asmenims ar trečiųjų asmenų vardu <span className="text-gray-400">nėra leidžiamas</span> ir neatitinka šios praktikos principų.
          </p>
        </div>
      </div>
    </div>
  )
}
