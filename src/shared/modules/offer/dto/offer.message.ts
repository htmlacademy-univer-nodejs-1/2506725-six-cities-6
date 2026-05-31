export const OfferValidationMessage = {
  name: {
    invalidFormat: 'Заголовок должен быть строкой',
    minLength: 'В заголовке предложения должно быть не менее 10 символов',
    maxLength: 'В заголовке предложения должно быть не более 100 символов',
  },
  description: {
    invalidFormat: 'Описание должно быть строкой',
    minLength: 'В описании предложения должно быть не менее 20 символов',
    maxLength: 'В описании предложения должно быть не более 1024 символов',
  },
  date: {
    invalidFormat: 'Дата создания предложения должна быть валидным ISO значением'
  },
  city: {
    invalidType: 'Город должен быть одним из вариантов: Paris, Cologne, Brussels, Amsterdam, Hamburg, Dusseldorf'
  },
  preview: {
    invalidFormat: 'Превью должно быть строкой'
  },
  images: {
    invalidFormat: 'Картинки должны быть массивом строк'
  },
  isPremium: {
    invalidFormat: 'Поле isPremium должно иметь булевый тип',
  },
  rating: {
    invalidFormat: 'Рейтинг должен быть числом',
    min: 'Минимальное значение рейтинга -- 1',
    max: 'Максимальное значение рейтинга -- 5',
  },
  type: {
    invalidType: 'Тип предложения должен быть одним из вариантов: apartment, house, room or hotel'
  },
  price: {
    invalidFormat: 'Цена должна быть числом',
    min: 'Минимальная цена -- 100',
    max: 'Максимальная цена -- 100.000'
  },
  rooms: {
    invalidFormat: 'Поле rooms должно быть числом',
    min: 'Минимальное число комнат -- 1',
    max: 'Максимальное число комнат -- 8',
  },
  guests: {
    invalidFormat: 'Поле guests должно быть числом',
    min: 'Минимальное число гостей -- 1',
    max: 'Максимальное число гостей -- 10',
  },
  features: {
    invalidFormat: 'Доп. услуги должны быть массивом строк',
    invalidId: 'Доп. услуги должны содержать валидные OfferFeatureEnum значения'
  },
  authorId: {
    invalidId: 'userId должен быть валидным MongoDB индексом'
  },
  coordinates: {
    invalidFormat: 'Координаты должны быть массивом',
    arraySize: 'Координаты должны представлять из себя ровно 2 числа',
  }
} as const;
