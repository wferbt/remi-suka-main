# 1. Используем легкий образ Node.js
FROM node:20-alpine AS builder

# 2. Устанавливаем рабочую папку
WORKDIR /app

# 3. Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm install

# 4. Копируем исходный код и собираем (компилируем TS в JS)
COPY . .
RUN npm run build

# 5. Финальный образ для запуска (Production)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 6. Открываем порт и запускаем
EXPOSE 3000
CMD ["node", "dist/main"]
