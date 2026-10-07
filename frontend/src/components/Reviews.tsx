'use client'

import { motion } from 'framer-motion'

const reviews = [
  {
    name: 'Александр Петров',
    company: 'ООО "СтройКомплекс"',
    text: 'Отличное качество продукции и профессиональный подход. Освещение превзошло все ожидания. Работаем с Led VL уже второй год, и каждый раз получаем именно то, что нужно.',
    rating: 5,
  },
  {
    name: 'Мария Иванова',
    company: 'Частный заказчик',
    text: 'Очень довольна покупкой. Светильники идеально вписались в интерьер, качество на высшем уровне. Отдельное спасибо за консультацию по выбору.',
    rating: 5,
  },
  {
    name: 'Дмитрий Соколов',
    company: 'Ресторан "Восток"',
    text: 'Профессиональная консультация и быстрая доставка. Освещение создало нужную атмосферу в зале. Гости отмечают уютную обстановку.',
    rating: 5,
  },
]

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function Reviews() {
  return (
    <section className="py-32 bg-gradient-to-b from-white via-background-main to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(0,0,0,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.05) 0%, transparent 50%)'
        }} />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Отзывы
          </h2>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
            Что говорят наши клиенты о качестве и сервисе
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 group relative overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-900/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-start gap-5 mb-8 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-text-primary to-gray-700 flex items-center justify-center text-white font-montserrat font-bold text-2xl flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  {getInitials(review.name)}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-montserrat font-semibold text-text-primary text-xl mb-1">
                    {review.name}
                  </p>
                  <p className="text-sm text-text-muted font-montserrat">{review.company}</p>
                </div>
              </div>
              
              <div className="relative z-10">
                <svg
                  className="absolute -top-3 -left-3 w-10 h-10 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-text-muted leading-relaxed text-base relative z-10 pl-8 text-[15px]">
                  {review.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

