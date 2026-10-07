import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Реквизиты и гарантии — Led VL',
  description: 'Реквизиты компании Led VL',
}

export default function RequisitesPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Реквизиты и гарантии</h1>
          <div className="card p-8 space-y-8">
            <section>
              <h2 className="font-serif text-2xl font-bold mb-4">Реквизиты</h2>
              <div className="space-y-2 text-text-muted">
                <p><strong className="text-text-primary">ИП:</strong> Телялькова Анна Яковлевна</p>
                <p><strong className="text-text-primary">ИНН:</strong> 253711730102</p>
                <p><strong className="text-text-primary">ОГРНИП:</strong> 323253600107241</p>
                <p><strong className="text-text-primary">ОКПО:</strong> 2028588241</p>
                <p><strong className="text-text-primary">ОКАТО:</strong> 05401367000</p>
                <p><strong className="text-text-primary">ОКТМО:</strong> 05701000001</p>
                <p><strong className="text-text-primary">ОКОПФ:</strong> 50102</p>
                <p><strong className="text-text-primary">ОКОГУ:</strong> 4210015</p>
                <p><strong className="text-text-primary">ОКФС:</strong> 16</p>
              </div>
            </section>
            <section>
              <h2 className="font-serif text-2xl font-bold mb-4">Гарантии</h2>
              <p className="text-text-muted leading-relaxed">
                На всю продукцию предоставляется официальная гарантия производителя. Срок гарантии
                указан в документации к каждому товару. При возникновении проблем в течение гарантийного
                срока мы обеспечиваем полное сервисное обслуживание и замену товара при необходимости.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

