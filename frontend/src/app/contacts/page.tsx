import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакты — Led VL',
  description: 'Свяжитесь с нами',
}

export default function ContactsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Контакты</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <h2 className="font-serif text-2xl font-bold mb-6">Свяжитесь с нами</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <a href="https://wa.me/79146872720" className="text-accent-soft hover:text-accent-soft-alt">
                    +7 914 687-27-20
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Сайт</h3>
                  <a href="https://www.vl.ru/ledvl" className="text-accent-soft hover:text-accent-soft-alt">
                    www.vl.ru/ledvl
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">География</h3>
                  <p className="text-text-muted">Владивосток и Приморский край</p>
                </div>
              </div>
            </div>
            <div className="card p-8">
              <h2 className="font-serif text-2xl font-bold mb-6">Форма обратной связи</h2>
              <form className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Имя</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Телефон</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Сообщение</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Отправить
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

