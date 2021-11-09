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


let main_url = window.origin + "/atameken/api";

if (Cons.getCurrentPage().code === "project_bastau") {


    // 1 api все апишки пока так сделай я пока док почитаю ok
    const checkRegistration = async function () {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": main_url + "/checkRegistration",
                    "method": "GET",
                    "timeout": 0
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

    const checkIIN = async function (iin) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": main_url + "/checkIIN",
                    "method": "GET",
                    "timeout": 0,
                    "data": JSON.stringify({
                        "iin": iin + "",
                        "project_id": "3",
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

    const getRegistrationStatus = async function (cato_id, participant_id) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": main_url + "/getRegistrationStatus?cato_id=" + cato_id + "&participant_id=" + participant_id,
                    "method": "GET",
                    "timeout": 0
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


    const createApplInfo = function () {
        applInfo = {
            "id": 0,
            "user": {
                "iin": "010101010101",
                "phone": "+77771112233",
                "password": "pass123",
                "first_name": "Alex",
                "last_name": "Alex",
                "patronymic": "Alexp",
                "gender": "1",
                "region_id": 0,
                "district_id": 0
            },
            "company": {
                "company_type_id": "unknown",
                "name": "test",
                "bin": "1324685416521"
            },
            "lang_id": 0,
            "disability": 0,
            "job_status_id": 0,
            "category": 0,
            "participant_set": true,
            "reapply": true
        };

        return applInfo;
    }

    const newApplicant = async function (applInfo) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": main_url + "/newApplicant",
                    "method": "POST",
                    "timeout": 0,
                    "data": JSON.stringify(applInfo)
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

    function runFiresUpp(label) {
        showMessage(label, 'info');
        fire({
            type: 'set_hidden',
            hidden: true
        }, 'button_submit_application');

        fire({
            type: 'change_label',
            text: localizedText(label, label, label, label),
        }, 'label-certificate')

        fire({
            type: 'set_hidden',
            hidden: false
        }, 'label-certificate');
    }

    if (!Cons.getAppStore().certificate_present.certificate) {
        checkRegistration().then(async function (registrationIsOpen) { // проверяем открыта ли регистрация
            if (registrationIsOpen['success']) {

                // checkIIN(iin).then(async function (participantInfo) { // проверяем есть ли участник с таким ИИН
                //     if (participantInfo['success']) { // тут хер пойми что делать
                //         // продолжить
                //     }
                //     else {

                //     }
                // });

            } else { // регистрация закрыта поэтому, выводим сообщение Регистрация закрыта
                runFiresUpp("Регистрация закрыта");
            }
        });
    } else {
        runFiresUpp("Сертификат уже имеется");
    }
}






