let currentUserID = '';
let main_url = window.origin + "/atameken/api";

const loadAsfData = uuid => {
    return new Promise(async resolve => {
        try {
            rest.synergyGet(`api/asforms/data/${uuid}`, res => resolve(res));
        } catch (e) {
            resolve(null);
        }
    });
};

const searchInRegistry = (url) => {
    return new Promise(async resolve => {
        try {
            rest.synergyGet(url, res => res.count > 0 ? resolve(res.data[0].dataUUID) : resolve(null));
        } catch (e) {
            console.log(e);
            resolve(null);
        }
    });
};

const getUserCardUUID = () => {
    let settings = Cons.getAppStore().portal_settings;
    let url = 'api/registry/data_ext?loadData=false';
    if (settings && settings.listbox_arm_inspector) {
        url += '&registryCode=registry_inspector';
        url += `&field=entity_userid&condition=CONTAINS&key=${AS.OPTIONS.currentUser.userid}`;
    } else {
        url += '&registryCode=registry_user_profile';
        url += `&field=entity_user_uuid&condition=CONTAINS&key=${AS.OPTIONS.currentUser.userid}`;
    }
    return searchInRegistry(url);
};

if (Cons.getCurrentPage().code === 'personal_area_profile') {

    const getPersonalFormUUID = async function (userID) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/registry/data_ext?field=userID&condition=TEXT_EQUALS&value=" + userID+"&registryCode=reg_personal_card&loadData=false",
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": ("Basic " + btoa("1" + ":" + "1"))
                    }
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve([]);
            }
        });
    };

    const getPersonalFormData = async function (dataUUID) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/asforms/data/" + dataUUID,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": ("Basic " + btoa("1" + ":" + "1"))
                    }
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve([]);
            }
        });
    };

    const getRegistrationStatus = async function (iin) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": main_url + "/checkIIN",
                    "method": "GET",
                    "timeout": 0,
                    "data": JSON.stringify({
                        "iin": iin + "",
                        "project_id": "3"
                    })
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve([]);
            }
        });
    };

    const mergeInfoToPersonalData = async function (data) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/asforms/data/merge",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Authorization": ("Basic " + btoa("1" + ":" + "1")),
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(data)
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve(false);
            }
        });
    };

    const getUserCertificate = async function (iin) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": "https://api-academy.atameken.kz/api/public/get-user-certificates?iin=" + iin,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Bearer ?%&awSE%5U%hK25F"
                    }
                }).done(function (response, statusText, xhr) {
                    response.status = xhr.status;
                    resolve(response);
                }).fail(function (response, statusText, xhr) {
                    resolve(xhr);
                });
            } catch (e) {
                console.error(e);
                let arr = [];
                arr.status = 406;
                resolve(arr);
            }
        });
    };

    fire({
        type: 'set_hidden',
        hidden: true
    }, 'formPlayer-5');

    getPersonalFormUUID(AS.OPTIONS.currentUser.userid).then(async function (userData) {
        console.log();
        if (userData.data.length && userData.data[0].dataUUID) {
            let userPersonalUUID = userData.data[0].dataUUID;
            getPersonalFormData(userPersonalUUID).then(function (formData) {

                let bin = formData.data.filter(x => x.id == 'bin')[0];
                if (bin && bin.value) {
                    getUserCertificate(bin.value).then(function (res) {

                        let certificate_present = res.status ? true : false;

                        let array_of_components_codes = [{
                            "id": "textbox_status",
                            "type": "textbox",
                            "value": certificate_present ? "Обучение Бастау Бизнес пройдено" : "Обучение Бастау Бизнес не пройдено",
                            "key": certificate_present ? "Обучение Бастау Бизнес пройдено" : "Обучение Бастау Бизнес не пройдено"
                        }, {
                            "id": "listbox_learn_bb_status",
                            "type": "listbox",
                            "value": certificate_present ? "Обучение пройдено" : "Обучение не пройдено",
                            "key": certificate_present ? '1' : "2"
                        }];

                        Cons.setAppStore({
                            certificate_present: {
                                certificate: certificate_present,
                                data: res,
                                iin: bin.value,
                                userCard: userPersonalUUID,
                                userID: AS.OPTIONS.currentUser.userid
                            }
                        });

                        let userData = { "uuid": userPersonalUUID };
                        userData.data = array_of_components_codes;

                        mergeInfoToPersonalData(userData).then(function (info) {
                            fire({
                                type: 'show_form_data',
                                dataId: userPersonalUUID,
                            }, 'formPlayer-5');

                            fire({
                                type: 'set_form_editable',
                                editable: false,
                            }, 'formPlayer-5');

                            fire({
                                type: 'set_hidden',
                                hidden: false
                            }, 'formPlayer-5');
                        });
                    });
                } else {
                    showMessage('Не найден ИИН для проверки сертификата', 'error');
                }
            });
        }
    });

}


const authPageHandler = () => {
    addListener('auth_success', 'auth', authed => {
        const moduleID = 'customers';
        const {login, password} = authed.creds;

        AS.OPTIONS.login = login;
        AS.OPTIONS.password = password;

        AS.FORMS.ApiUtils.simpleAsyncGet('rest/api/person/generate_auth_key?moduleID=' + moduleID)
            .then(access_token => {
                authed.data.person.access_token = access_token.key;

                AS.OPTIONS.login = '$key';
                AS.OPTIONS.password = access_token.key;

                authed.creds.login = AS.OPTIONS.login;
                authed.creds.password = AS.OPTIONS.password;
            });
    });
};

pageHandler('auth', authPageHandler);
