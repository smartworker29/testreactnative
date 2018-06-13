export default {
    login: {
        login_button: 'Login', // 'Войти',
        signup_button: 'Sign up', // 'Зарегестрироваться'
    },
    user_profile: {
        title: 'Profile', // 'Профиль',
        instanceName: 'Section', // "Раздел",
        createAgent: 'Create new agent', // "Создание агента",
        updateAgent: 'Update agent', // "Обновление агента",
        sync: 'Sync', // "Синхронизация"
    },
    visits_list: {
        title: 'Reports', // 'Отчёты',
        emptyListMessageTitle: 'No reports yet', // 'Пока нет отчетов',
        emptyListMessageDetail: 'Open "Tasks" tab to begin', // 'Чтобы добавить свой первый отчет откройте вкладку задания',
        newVisit: 'New report', // 'Новый отчёт',
        today: 'Today', // 'Сегодня',
        before: 'Before', // 'Ранее',
        lastSync: 'Last sync at', // 'Последняя синхронизация данных',
        moderation: 'Moderation', // 'Модерация',
        OnModeration: 'On moderation', // "На модерации",
        resultBad: 'Rejected', // 'Не засчитан',
        resultGood: 'OK', // 'Засчитан',
        route: 'Route', // "маршрут"
    },
    visitDetail: {
        title: 'Report', // 'Отчёт',
        agent: 'Agent', // 'Агент',
        shop: 'Store', // 'Магазин',
        photo: 'Photos', // 'Фотографии',
        started_date: 'Date', // 'Дата отчёта',
        offline: 'Not synced yet', // 'не синхронизированно',
        message: 'Report', // 'Отчёт',
        moderationResult: 'Moderation status', // 'Результат модерации',
        moderationDone: 'Moderation passed', // 'Модерация пройдена',
        moderationReject: 'Moderation not passed', // 'Модерация не пройдена',
        moderationComment: 'Moderator comment', // 'Комментарий модератора:',
        visitAccept: 'OK', // 'Засчитан',
        visitReject: 'Rejected', // 'Не засчитан',
        visitResult: 'Visit results', // 'Результаты отчёта'
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
        makePhoto: 'Make Photo', // 'Сделать фото',
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
        emptyPatronymic: 'Enter your last name', // "Введите отчество",
        agentCreation: 'Couldn\'t create an agent, try again', // "Неудалось создать агента, попробуйте ещё раз",
        geoDeny: 'Geolocation is disabled in your phone', // "В телефоне отключенна геолокация",
        createAgent: 'Error while creating agent', // "Ошибка создания агента",
        updateAgent: 'Error while updating agent', // "Ошибка обновления агента"
    },
    pin: {
        enter: 'Enter PIN', // "Введите пин-код",
        enterAgain: 'Enter PIN again', // "Укажите пин-код повторно",
        error: 'Incorrect PIN', // "Неверный пин-код",
        description: 'Having trouble with login?\nSend email at support@inspectorcloud.freshdesk.com', // "Если у вас возникли сложности, то свяжитесь с нами по номеру\n 8 (800) 550-27-78 (звонок беплатный)"
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
