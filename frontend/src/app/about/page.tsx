import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'О нас — Led VL',
  description: 'Информация о компании Led VL',
}

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">О нас</h1>
          <div className="card p-8 space-y-6">
            <p className="text-lg leading-relaxed">
              Led VL — это компания, специализирующаяся на продаже премиальных осветительных приборов
              во Владивостоке и Приморском крае.
            </p>
            <p className="text-lg leading-relaxed">
              Мы предлагаем широкий ассортимент LED-светильников, солнечных светильников и другого
              осветительного оборудования для дома и бизнеса.
            </p>
            <p className="text-lg leading-relaxed">
              Наша миссия — обеспечить наших клиентов качественным освещением по доступным ценам
              с гарантией и профессиональным сервисом.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

