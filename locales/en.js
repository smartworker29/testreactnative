export default {
    login: {
        login_button: 'Login',
        signup_button: 'Sign up'
    },
    user_profile: {
        title: 'Profile',
        instanceName: "Section",
        createAgent: "Create new agent",
        updateAgent: "Update agent",
        sync: "Sync"
    },
    visits_list: {
        title: 'Reports',
        emptyListMessageTitle: 'No reports yet',
        emptyListMessageDetail: 'Open "Tasks" tab to begin',
        newVisit: 'New report',
        today: 'Today',
        before: 'Before',
        lastSync: 'Last sync at',
        moderation: 'Moderation',
        OnModeration: "On moderation",
        resultBad: 'Rejected',
        resultGood: 'OK',
        route: "Route"
    },
    visitDetail: {
        title: 'Report',
        agent: 'Agent',
        shop: 'Store',
        photo: 'Photos',
        started_date: 'Date',
        offline: 'Not synced yet',
        message: 'Report',
        moderationResult: 'Moderation status',
        moderationDone: 'Moderation passed',
        moderationReject: 'Moderation not passed',
        moderationComment: 'Moderator comment',
        visitAccept: 'OK',
        visitReject: 'Rejected',
        visitResult: 'Visit results',
        shopId: "ID торговой точки",
        pathId: "Номер маршрута",
        feedback: "Пожаловаться"
    },
    overScreen: {
        notInstall: "У вас не установленны",
        install: "Установите сервисы",
        needUpdate: "Необходимо обновите сервисы",
        update: "Обновить сервисы",
        offService: "У вас отключены сервисы",
        geoOff: "У вас отключенна геолокация.",
        startGeoInSettings: "Включите её в настройках.",
        goToSettings: "Перейти в настройки",
        onService: "Включите сервисы"
    },
    CreateVisit: {
        title: 'New report', // 'Новый отчёт',
        photo: 'Photos', // 'Фотографии',
        createAction: 'Start', // 'Начать',
        backAction: 'Back', // 'назвд',
        label: 'Store ID', // 'ID  Торговой точки',
        description: 'Specify store ID to begin', // 'Чтобы начать новый отчёт, укажите ниже ID магазина',
        getGeo: 'Updating geolocation', // "Получение геопозиции",
        okGeo: 'Geolocation updated', // "Геопозиция полученна",
        createVisit: 'Creating report', // "Создание отчёта"
    },
    settings: {
        title: 'Settings', // 'Настройки',
        surname: 'Surname', // 'Фамилия',
        name: 'Name', // 'Имя',
        patronymic: 'Last Name', // 'Отчество',
        path_number: 'Route ID', // 'Номер маршрута',
        contact_number: 'Contact Tel. Number', // 'Контактный номер',
        build: 'Build version', // 'Версия сборки'
    },
    photo: {
        title: 'Photo', // 'Фото',
        reship: 'Remake', // 'Переснять',
        makePhoto: 'Take Photo', // 'Сделать фото',
        noPhotoTitle: 'No photos yet', // 'Пока нет фотографий',
        expiredVisit: 'Visit completed', // "Отчёт завершен",
        noPhotoDescription: 'Tap a button below to capture your first photo', // 'Чтобы сделать свой первый снимок нажмите кнопку ниже',
        noPhotoExpiredVisit: 'Create another visit to capture another photo', // "Чтобы сделать фотографии начните новый отчёт",
        send: 'Send', // 'Отправить',
        back: 'Back', // 'Завершить',
        cancel: 'Cancel', // 'Отмена',
        ok: 'OK', // 'Готово',
        sync: 'Sync in progress', // 'Идет синхронизация',
        allowAccess: 'Please allow access to your camera', // "Разрешите доступ к камере"
    },
    error: {
        attention: 'Attention', // "Внимание",
        emptyName: 'Enter your name', // "Введите имя",
        emptySurname: 'Enter your surname', // "Введите фамилию",
        emptyPathNumber: 'Enter your route ID', // "Введите Номер маршрута",
        emptyPatronymic: 'Enter your middle name', // "Введите отчество",
        agentCreation: 'Couldn\'t create an agent, try again', // "Неудалось создать агента, попробуйте ещё раз",
        geoDeny: 'Geolocation is disabled in your phone', // "В телефоне отключенна геолокация",
        createAgent: 'Error while creating agent', // "Ошибка создания агента",
        updateAgent: 'Error while updating agent', // "Ошибка обновления агента"
        geoPlayService: "Установите Google Play сервисы",
        geoTimeout: "Истекло время получения геопозиции"
    },
    shops: {
        shops: "Магазины",
        favorite: "Избранные",
        nearest: "Ближайшие",
        enterId: "Ввести ID"
    },
    alerts: {
        haveUpdate: "Доступно обновление",
        updateQuestion: "Обновить до новой версии?",
        mustUpdate: "Пожалуйста, обновите приложение. Обновления повышают стабильность работы и добавляют новые функции.",
        yes: "Да",
        no: "Нет",
        enterIdShop: "Введите ID магазина",
        changeRoute: "Изменение маршрута",
        cancel: "Отмена",
        change: "Изменить",
        accept: "Принять"
    },
    pin: {
        enter: "Enter PIN",
        enterAgain: "Enter PIN again",
        error: "Incorrect PIN",
        oldVersion: "Версия программы устарела",
        firstLoad: "Идет загрузка начальных данных",
        description: "Having trouble with login?\nSend email at support@inspectorcloud.freshdesk.com'"
    },
    task: {
        title: 'Tasks', // "Задачи",
        instruction: 'Instruction', // "Подробная инструкция",
    },
    tasks: {
        emptyTitle: 'No tasks yet', // "Пока нет заданий",
        emptyDescription: 'We will notify you upon receiving new tasks', // "Мы уведомим вас при поступлении новых заданий"
    },
    tabBar: {
        tasks: 'Tasks', // "Задания",
        results: 'Results', // "Результат ",
        reports: 'Reports', // "Отчёты",
        profile: 'Profile', // "Профиль"
    },
    sync: {
        title: 'Sync status', // "Состояние"
    },
    reports: {
        underNum: 'Accepted reports', // "Успешно засчитанных отчетов",
        unassigned: 'Rejected reports', // "Незасчитанных отчетов",
        moderationPass: 'Moderation passed', // "Модерация пройдена",
        moderationUnPass: 'Moderation not passed', // "Модерация не пройдена",
        onModeration: 'On moderation', // "На модерации"
    },
    preview: {
        title: 'Preview', // "Предпросмотр",
        remove: 'Delete photo', // "Удаление фото"
    },
    feedback: {
        support: 'Support', // "Служба поддержки",
        title: 'Complaint', // "Жалоба",
        send: 'Send', // "Отправить",
        answer: 'Reply', // "Ответ на жалобу",
        request: 'Send', // "Отправка жалобы",
        success: 'Complaint sent!', // "Жалоба успешно отправлена",
        error: 'Complaint not sent', // "Жалоба не отправлена",
        describe: 'Describe the situation', // "Опишите ситуацию"
    }
}
