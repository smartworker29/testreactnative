**Получение пинов**
Поллинг 7 сек, Таймаут - **7** сек

**Получение статистики**
Поллинг 7 сек, Таймаут - **7** сек

**Получения списка задач**
Поллинг 10 сек, Таймаут - **10** сек

**Обновление списка отчетов**
Поллинг 7 сек, Таймаут - **60** сек

Поллинг проверки необходимости синхронизации отчётов **2** сек
Получение информации об отчёте, таймаут - **7** сек
Создание отчёта, таймаут - **5** сек

Поллинг проверки необходимости синхронизации фото **2** сек
Загрузка фото на сервер, таймаут максимальный

Отправка сообщения в службу поддержки, таймаут - **10** сек
Запрос на удаление изображения на сервер, таймаут - **10** сек
Обновление информации о агенте, таймаут - **5** сек
Создание агента, таймаут - **10** сек
Обновление device info у агента, таймаут - **15** сек


# How to install appcenter.ms

* As we use Gitlab so we have to mirror our repo to Github or Bitbucket (because Microsoft doesn't work with Gitlab)
https://about.gitlab.com/2016/05/10/feature-highlight-push-to-remote-repository/

https://gitlab.inspector-cloud.com/ic/mobile-app/settings/repository

* Add new app and connect your mirror github repo from https://appcenter.ms/orgs/Inspector-Cloud/applications

* Setting the build: 
  * If it's an Android build: to sign builds upload a keystore file through appcenter UI or use automatic gradle signing as it's established already
  * If it's an iOS build, we need 2 different app builds for limited distribution and for App Store, so to sign builds: 
    1. create a distribution cert through https://developer.apple.com/account/ios/certificate/distribution
    2. create an Ad Hoc provision profile for limited distibution through https://developer.apple.com/account/ios/profile/ and connect previously created distribution cert; NOTE: for Ad Hoc provisioning you have to test devices UDIDs through https://developer.apple.com/account/ios/device/iphone (https://www.apple-iphone.ru/iphone-ipad-guides/Kak-uznat-udid-iphone/)

    3. create an App Store provision profile also and connect previosly created discribution cert

* ... it should build and sign builds
