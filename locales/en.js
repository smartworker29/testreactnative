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
        shopId: "Shop ID",
        pathId: "Route ID",
        feedback: "Support", // "Пожаловаться"
    },
    overScreen: {
        notInstall: "Not installed", // "У вас не установленны",
        install: "Please, install services", // "Установите сервисы",
        needUpdate: "Update is required", // "Необходимо обновите сервисы",
        update: "Update now", // "Обновить сервисы",
        offService: "You have services disabled", // "У вас отключены сервисы",
        geoOff: "Your geolocation is offline", // "У вас отключенна геолокация.",
        startGeoInSettings: "Please, enable geolocation in settings", // "Включите её в настройках.",
        goToSettings: "Settings", // "Перейти в настройки",
        onService: "Enable services", // "Включите сервисы"
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
        emptyName: 'Enter your Second Name', // "Введите имя",
        emptySurname: 'Enter your First Name', // "Введите фамилию",
        emptyPathNumber: 'Enter your route ID', // "Введите Номер маршрута",
        emptyPatronymic: 'Enter your middle name', // "Введите отчество",
        agentCreation: 'Couldn\'t create an agent, try again', // "Неудалось создать агента, попробуйте ещё раз",
        geoDeny: 'Geolocation is disabled in your phone', // "В телефоне отключенна геолокация",
        createAgent: 'Error while creating agent', // "Ошибка создания агента",
        updateAgent: 'Error while updating agent', // "Ошибка обновления агента"
        geoPlayService: "Please, install Google Play services", // "Установите Google Play сервисы",
        geoTimeout: "Geolocation timeout", // "Истекло время получения геопозиции"
    },
    shops: {
        shops: "Shops", // "Магазины",
        favorite: "Favorite", // "Избранные",
        nearest: "Nearest", // "Ближайшие",
        enterId: "Enter ID", // "Ввести ID"
        tasks: "Заданий",
        m: "m",
        km: "km",
        notFoundById: "Магазин не найден по ID",
        checkId: "Пожалуйста, проверьте правильность введенной информации и нажмите «Продолжить» для продолжения визита или «Отмена» для возврата к списку магазинов.",
        continue: "Продолжить",
        geoDeny: "Чтобы увидеть ближайшиее магазины включите геолокацию",
        noShops: "Не удалось получить список ближайших магазинов. Попробуйте еще раз через какой-то время или введите ID магазина для начала визита."
    },
    alerts: {
        haveUpdate: "Update is available", // "Доступно обновление",
        updateQuestion: "Update to the latest version", // "Обновить до новой версии?",
        mustUpdate: "Please update the app. Updates increase stability and introduce new features!", // "Пожалуйста, обновите приложение. Обновления повышают стабильность работы и добавляют новые функции.",
        yes: "Yes", // "Да",
        no: "No", // "Нет",
        enterIdShop: "Enter Shop ID", // "Введите ID магазина",
        changeRoute: "Change Route", // "Изменение маршрута",
        cancel: "Cancel", // "Отмена",
        change: "Change", // "Изменить",
        accept: "Accept", // "Принять",
        idLength: "Length can not be more than 20 characters",
        enter: "Enter"
    },
    pin: {
        enter: "Enter PIN",
        enterAgain: "Enter PIN again",
        error: "Incorrect PIN",
        oldVersion: "App is outdated", // "Версия программы устарела",
        firstLoad: "Preloading", // "Идет загрузка начальных данных",
        description: "Having trouble with login?\nSend email at",
        descriptionAddress: "support@inspectorcloud.freshdesk.com"
    },
    task: {
        title: 'Tasks', // "Задачи",
        instruction: 'Instruction', // "Подробная инструкция",
    },
    tasks: {
        emptyTitle: 'No tasks yet', // "Пока нет заданий",
        emptyDescription: 'We will notify you upon receiving new tasks', // "Мы уведомим вас при поступлении новых заданий",
        shopPoint: "Торговая точка"
    },
    arCamera: {
        captureStarted: "AR-камера определяет плоскость полки, подождите, пожалуйста",
        captureSuccess: "Найдена плоскость полки, прикоснитесь к экрану для начала съемки."
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
        remove: 'Delete photo?', // "Удаление фото"
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
    },
    profile: {
        route: "Route",
        email: "E-mail",
        position: "Position",
        region: "Region",
        phone: "Phone"
    },
    questions: {
        questionnaire: "Questionnaire",
        text: "In this task you need to fill out a questionnaire, please click the button below",
        answerButton: "Answer the questions",
        saveToServer: "Save answers to server",
        savingToServer: "Saving answers...",
        saveAnswersButton: "Save answers",
        haveRequireQuestions: "Questions remained",
        requireText: "Please answer the required questions (marked with an asterisk)",
        ok: "Ok"
    }
}
