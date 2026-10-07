import type { Metadata } from 'next'
import ContactUs from '@/components/ContactUs'

export const metadata: Metadata = {
  title: 'Контакты — Led VL',
  description: 'Свяжитесь с нами',
}

// Раньше здесь лежала форма без обработчика: отправка перезагружала страницу
// с query-параметрами. Рабочая форма из ContactUs уходит в WhatsApp.
export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-background-main pt-16">
      <ContactUs />
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto card p-8">
          <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">Магазин на vl.ru</h2>
          <p className="text-text-muted">
            Каталог продавца также доступен на городской площадке:{' '}
            <a
              href="https://www.vl.ru/ledvl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary underline underline-offset-4"
            >
              www.vl.ru/ledvl
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
