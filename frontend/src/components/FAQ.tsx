'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    question: 'Какая гарантия на продукцию?',
    answer: 'Мы предоставляем официальную гарантию на всю продукцию от производителя. Срок гарантии зависит от типа товара и составляет от 1 до 5 лет. Все детали гарантийного обслуживания указаны в гарантийном талоне.',
  },
  {
    question: 'Как быстро осуществляется доставка?',
    answer: 'Доставка по Владивостоку осуществляется в течение 1-2 рабочих дней. По Приморскому краю - от 2 до 5 рабочих дней в зависимости от удаленности населенного пункта. Возможна срочная доставка за дополнительную плату.',
  },
  {
    question: 'Есть ли скидки для оптовых покупателей?',
    answer: 'Да, мы предоставляем специальные условия для оптовых покупателей. Размер скидки зависит от объема заказа. Для постоянных клиентов действуют дополнительные программы лояльности.',
  },
  {
    question: 'Можно ли вернуть товар?',
    answer: 'В соответствии с законодательством РФ, вы можете вернуть товар надлежащего качества в течение 14 дней с момента покупки при условии сохранения товарного вида и упаковки.',
  },
  {
    question: 'Оказываете ли вы услуги по установке?',
    answer: 'Да, мы предоставляем услуги по установке и монтажу осветительного оборудования. Наши специалисты имеют большой опыт работы и используют профессиональное оборудование.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
            Ответы на популярные вопросы о нашей продукции и услугах
          </p>
        </motion.div>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-montserrat font-medium text-text-primary pr-4 text-lg">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-text-muted transition-transform flex-shrink-0 group-hover:text-text-primary ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                      <p className="text-text-muted leading-relaxed text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

