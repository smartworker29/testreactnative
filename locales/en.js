import I18n from "react-native-i18n";

export default {
    login: {
        login_button: "Login",
        signup_button: "Sign Up"
    },
    user_profile: {
        title: "Profile",
        instanceName: "Instance"
    },
    visits_list: {
        title: "Visits",
        emptyListMessage: "Press button «Start visit»",
        newVisit: "New visit",
        today: "Today",
        before: "Before",
        lastSync: "Last data synchronization",
        moderation: "Moderation",
        OnModeration: "Moderation",
        resultBad: "Visit is not counted",
        resultGood: "Visit counted",
        route: "route"
    },
    visitDetail: {
        title: 'Visit',
        agent: 'Agent',
        shop: 'Shop',
        photo: "Photos",
        started_date: 'Date of visit',
        offline: `don't sync`,
        message: 'detail',
        moderationResult: "Moderation result",
        moderationDone: "Moderation passed",
        moderationReject: "Moderation not passed",
        moderationComment: "Moderation comment:",
        visitAccept: "Visit counted",
        visitReject: "Visit not counted",
        visitResult: "Visits result"
    },
    CreateVisit: {
        title: "Start visit",
        photo: 'Photos',
        createAction: 'Start',
        backAction: 'back',
        label: "Trade point ID ",
        description: "To start a new visit, enter the store ID below"
    },
    settings: {
        title: "Settings",
        surname: "Second Name",
        name: "First Name",
        patronymic: "Patronymic Name",
        path_number: "Path Number",
        contact_number: "Contact Number",
        build: 'Build version'

    },
    photo: {
        title: 'Photo',
        reship: 'Reship',
        makePhoto: 'Make photo',
        noPhotoTitle: "No photos yet",
        expiredVisit: "The visit is over",
        noPhotoDescription: "To take your first picture, click the button below",
        noPhotoExpiredVisit: "To take photos, start a new visit",
        send: 'Send',
        back: 'Back',
        cancel: 'Cancel',
        ok: 'Ok',
        sync: 'Syncing in progress',
        allowAccess: "Allow access to the camera"
    },
    error: {
        emptyName: "Enter name",
        emptySurname: "Enter surname",
        emptyPathNumber: "Enter path number",
        emptyPatronymic: "Enter patronymic",
        agentCreation: "Failed to create agent, try again"
    },
    pin: {
        enter: "Enter pin code",
        enterAgain: "Re-enter the PIN",
        error: "Invalid pin code",
        description: "If you have any problem, please contact us at 8 (800) 550-27-78 (call free)",
    }


}