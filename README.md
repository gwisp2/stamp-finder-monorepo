# Stamp Finder
## Что это?
Это веб-приложение, позволяющее производить поиск по почтовым маркам. Проблема существующих каталогов марок в том, что в них не реализован поиск по номиналу,
что является необходимой фишкой, если марки хочется использовать по назначению, но при этом хочется выбрать красивые марки и купить в салоне Коллекционер.
В этом веб-приложении имеется поиск по разным параметрам, в том числе по наличию марок в магазине, по году выпуска и по номиналу.

## Где посмотреть
http://sf.gwisp.dev

## Как запустить
1. [Запуск фронтенда](./frontend/README.md)
2. [Запуск инструментов/бэкенда](./tools/README.md). Утилита sfwatch скачает данные марок, уменьшит и преобразует картинки в лёгковесные webp и поскрейпит сайт русмарки на предмет наличия марок. Фронтенд можно использовать и напрямую на данных из репозитория с марками, без сжатия картинок и прочего, так что инструменты можно не трогать, если нужно покопаться только в коде фронтенда.
