# Stamp finder scripts
### Что это?
Скрипты для обновления [данных](https://github.com/gwisp2/russian-stamps) для [Stamp Finder](https://github.com/gwisp2/stamp-finder).

### Как их установить?
> ./setup.py install

### Как использовать?
> sfs -h

На данный момент есть четыре команды:
1. Обновление информации о наличии марок в магазине на https://rusmarka.ru.
> sfs update-present-field
2. Обновление ссылок на изображения в stamps.json: полезно, если Вы добавили новый файл с изображением марки, и автоматически хотите задать путь к нему в stamps.json.
> sfs update-image-field
3. Сжатие изображения марок до нужного размера. 
> sfs resize-images
4. Обновление категорий
> sfs update-cats