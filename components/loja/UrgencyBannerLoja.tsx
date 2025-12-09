"use client"

export default function UrgencyBannerLoja() {
  return (
    <>
      <div className="relative w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 py-1.5 shadow-md overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="inline-block text-white text-xs md:text-sm font-bold mx-4 flex items-center gap-2">
            ⚡ Oferta por tempo limitado! Preços reduzidos HOJE — aproveite antes que acabe! ⚡
            ⚡ Oferta por tempo limitado! Preços reduzidos HOJE — aproveite antes que acabe! ⚡
            ⚡ Oferta por tempo limitado! Preços reduzidos HOJE — aproveite antes que acabe! ⚡
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </>
  )
}
