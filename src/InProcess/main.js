let main_url = window.origin + "/atameken/api";

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

const updateUserCard = (iin) => {
    return new Promise(resolve => {
        fetch(`../CRTR/user/update/${iin}`)
            .then(response => response.json())
            .then(res => resolve(res));
    });
}

const createDocRCC = (registryCode, asfData, sendToActivation = false) => {
    return new Promise(async resolve => {
        try {
            let settings = {
                url: `${window.location.origin}/Synergy/rest/api/registry/create_doc_rcc`,
                method: "POST",
                headers: {
                    "Authorization": "Basic " + btoa("1" + ":" + "1"),
                    "Content-Type": "application/json; charset=utf-8"
                },
                data: JSON.stringify({
                    registryCode: registryCode,
                    data: asfData,
                    sendToActivation: sendToActivation
                }),
            };
            $.ajax(settings).done(response => {
                if (response.errorCode == 0) {
                    resolve(response);
                } else {
                    console.log(response);
                    resolve(null);
                }
            }).fail(err => {
                console.error(err);
                resolve(null);
            });
        } catch (e) {
            console.log(e);
            resolve(null);
        }
    });
}

if (Cons.getCurrentPage().code === 'registration' || Cons.getCurrentPage().code === "request_training") {
    let registration_info;
    let ecp_info = [];

    let phone = "";
    let email = "";
    if (Cons.getCurrentPage().code === 'registration') {
        fire({
            type: 'set_hidden',
            hidden: true
        }, 'button-register');

        $("#phone").mask("+7 (999) 999 9999");
    }
    const getKeyInfoCallButton = $("#getKeyInfoCall");

    let webSocket = new WebSocket('wss://127.0.0.1:13579/');
    let callback = null;

    AS.SERVICES.showWaitWindow = () => Cons.showLoader();
    AS.SERVICES.hideWaitWindow = () => Cons.hideLoader();

    const openDialog = function () {
        if (confirm("Ошибка при подключении к NCALayer. Запустите NCALayer и нажмите ОК") === true) {
            location.reload();
        }
    };

    const unblockScreen = function () {
        AS.SERVICES.hideWaitWindow();
    };

    webSocket.onopen = function (event) {
        console.log("Connection opened");
    };

    webSocket.onclose = function (event) {
        if (event.wasClean) {
            console.log('connection has been closed');
        } else {
            console.log('Connection error');
            openDialog();
        }
        console.log('Code: ' + event.code + ' Reason: ' + event.reason);
    };

    webSocket.onmessage = function (event) {
        let result = JSON.parse(event.data);

        if (result != null) {
            let rw = {
                code: result['code'],
                message: result['message'],
                responseObject: result['responseObject'],
                getResult: function () {
                    return this.result;
                },
                getMessage: function () {
                    return this.message;
                },
                getResponseObject: function () {
                    return this.responseObject;
                },
                getCode: function () {
                    return this.code;
                }
            };
            if (callback != null) {
                getKeyInfoBack(rw);
            }
        }
        console.log(event);
    };

    const getKeyInfo = function (storageName, callBack) {
        let getKeyInfo = {
            "module": "kz.gov.pki.knca.commonUtils",
            "method": "getKeyInfo",
            "args": [storageName]
        };
        callback = callBack;
        webSocket.send(JSON.stringify(getKeyInfo));
    };

    // удаляем событие клика
    getKeyInfoCallButton.off('click');
    // вешаем событие клика на выбрать сертификат
    getKeyInfoCallButton.on('click', e => {
        getKeyInfoCallButton.text("Выбрать сертификат");
        getKeyInfoCallButton.css({"background": "var(--orange)"});
        fire({
            type: 'set_hidden',
            hidden: true
        }, 'button-register');

        if (baseParamsChecker())
            getKeyInfoCall();
    });

    const getKeyInfoCall = function () {
        blockScreen();
        let selectedStorage = "PKCS12";
        getKeyInfo(selectedStorage, "getKeyInfoBack");
    };

    const getKeyInfoBack = function (result) {
        let pass = true;
        if (Cons.getCurrentPage().code === "request_training")
            pass = false;
        unblockScreen();
        setRegistrationInfo(pass);
        if (result['code'] === "500") {
            alert(result['message']);
        } else if (result['code'] === "200") {
            let res = result['responseObject'];
            if (res['subjectDn']) {
                let subjectDn = res['subjectDn'].split(",");
                for (let i = 0; i < subjectDn.length; i++) {
                    let key_value = subjectDn[i].split("=");
                    if (key_value[0] && key_value[1]) {
                        ecp_info[key_value[0]] = key_value[1];
                    }
                }
                if (pass)
                    getKeyInfoCallButton.text(subjectDn[0].split("=")[1]);
                else
                    $("#button-ecp-sign").text(subjectDn[0].split("=")[1]);
            }
            getDateResponse({
                "certNotBefore": res['certNotAfter'],
                "certNotAfter": res['certNotBefore']
            }).then(function (checker) {
                if (!checker) {
                    showMessage('Сертификат недействителен (не пройдена проверка срока действия сертификата). Выберите действительный сертификат ЭЦП', 'error');
                    return;
                }
                getOCSPResponse({
                    "cert_string": res['pem']
                }).then(function (result) {

                    if (result && result.response === "GOOD") {
                        if (!pass) {
                            showMessage('ЭЦП валидно', 'success');

                            if (ecp_info.SERIALNUMBER.substr(3) != $(".current_iin").attr("cur_iin")) {
                                $("#button-ecp-sign").text("Подписать");
                                showMessage("Эцп из подписи отличается от эцп в Заявке ", 'error');
                                return
                            }

                            fire({
                                type: 'set_form_editable',
                                editable: false,
                            }, 'formPlayer-1');
                            fire({
                                type: 'set_hidden',
                                hidden: false
                            }, 'button-send-it');
                            return;
                        }

                        fire({
                            type: 'set_hidden',
                            hidden: false
                        }, 'button-register');

                        phone = $('#phone').length ? $('#phone').val() : "no phone";
                        email = $('#email').length ? $('#email').val() : "no mail";

                        $("#button-register").off('click');
                        $("#button-register").on('click', e => {
                            createUser().then(function (res) {
                                let userID = res.userID;
                                if (res.errorCode == '0') {
                                    showMessage("Регистрация успешна", "success");
                                    addUserToGroup("CRTR", userID).then(function () {

                                        let asfData = [];
                                        let fio = [formatName(ecp_info.SURNAME), formatName(ecp_info.CN.split(" ")[1])].join(' ').trim();
                                        asfData.push({
                                            id: "iin",
                                            type: "textbox",
                                            value: ecp_info.SERIALNUMBER.substr(3)
                                        });
                                        asfData.push({
                                            id: "bin",
                                            type: "textbox",
                                            value: ecp_info.SERIALNUMBER.substr(3)
                                        });
                                        asfData.push({id: "entity_user", type: "entity", value: fio, key: userID});

                                        createDocRCC('reg_personal_card', asfData, true).then(res => {
                                            console.log('Результат создания записи в реестре ЛК', res);
                                            let resUUID = res.dataID;
                                            //заполнение данных ЛК с сервисов Минтруда
                                            updatePersonalCard(ecp_info.SERIALNUMBER.substr(3), userID, resUUID).then(function () {
                                                updateUserCard(ecp_info.SERIALNUMBER.substr(3)).then(res => {
                                                    getAuth().then(function (user_info) {
                                                        if (user_info && user_info.access == "true") {
                                                            let event = {
                                                                type: 'goto_page',
                                                                pageCode: 'auth',
                                                                pageParams: []
                                                            };

                                                            Cons.setAppStore({
                                                                currentUser: {
                                                                    ...user_info,
                                                                }
                                                            });

                                                            fire(event, 'button-register')
                                                        } else
                                                            showMessage("Access denied", "info");
                                                    });
                                                });
                                            });
                                        });

                                    });
                                } else
                                    showMessage(JSON.stringify(res), 'info');
                            });
                        });
                        showMessage('ЭЦП валидно', 'success');
                    } else if (result.response === "REVOKED") {
                        showMessage('Сертификат недействителен (сертификат отозван, время + ' + result.time + ', причина ' + result.reason + '). Выберите действительный сертификат ЭЦП', 'error');
                    } else if (result.response === "UNKNOWN") {
                        showMessage('Сертификат недействителен (Неизвестная причина со стороны нуц рк). Выберите действительный сертификат ЭЦП', 'error');
                    } else {
                        showMessage('Ошибка проверки', 'error');
                    }
                });
            });
        }
    };

    const blockScreen = function () {
        AS.SERVICES.showWaitWindow();
    };

    const phoneValidator = (input) => {
        input.text = $("#" + input.code).val();
        if (emptyValidator(input)) {
            let regex = /^\+7[ ]?\(([0-9]{3})\)\)?[ ]?([0-9]{3})[ ]?([0-9]{4})$/;
            if (input && regex.test(input.text)) {
                fire({
                    type: 'input_highlight',
                    error: false
                }, input.code);
                return true;
            } else {
                fire({
                    type: 'input_highlight',
                    error: true
                }, input.code);
                return false;
            }
        }
        return false;
    };

    const updatePersonalCard = async function (bin, userID, resUUID) {
        let lang = $("#localeSelector").length ? $("#localeSelector").val() : "ru";
        console.log(resUUID);
        getStatGovData(bin, "ru").then(function (response) {
            if (response && response.success === true && response.obj) {
                setPersonalData(userID, response, false, resUUID);
            } else {
                setPersonalData(userID, {"success": false, "obj": {}}, true, resUUID);
                showMessage('Stat gov не вернул информации по данномму БИН(ИИН)', 'info');
            }
        });
    };

    function reverseString(str) {
        return str.split("").reverse().join(""); // "olleh"
    }

    const getDateBirth = function (iin) {
        // 950815300523
        let resp = {"id": "date_birth", "type": "date"};
        let year = "2000";
        let month = iin.substring(2, 4);
        let day = iin.substring(4, 6);
        //value: "08.09.2021", key: "2021-09-08 00:00:00"
        if (parseInt(iin.substring(0, 2)) > 50) {
            year = 19 + iin.substring(0, 2);
        } else {
            year = 20 + iin.substring(0, 2);
        }
        resp.value = day + "." + month + "." + year;
        resp.key = year + "-" + month + "-" + day + " 00:00:00";
        return resp;
    }

    function formatName(res) {
        if (res)
            return res.charAt(0).toUpperCase() + res.toLowerCase().substr(1);
        return "";
    }

    const setPersonalData = function (userID, response, compForm, resUUID) {
        // getPersonalFormUUID(userID).then(function (userCards) {
        //     if (userCards && userCards[0] && userCards[0]["data-uuid"]) {

        let userData = {"uuid": resUUID};

        let array_of_values = [
            formatName(ecp_info.SURNAME), formatName(ecp_info.CN.split(" ")[1]), formatName(ecp_info.G),
            phone, email,
            ecp_info.SERIALNUMBER.substr(3) ? ecp_info.SERIALNUMBER.substr(3) : "", response.obj.name ? response.obj.name : "", "",
            response.obj.okedCode ? response.obj.okedCode : "", response.obj.krpName ? response.obj.krpName : "",
            response.obj.katoAddress ? response.obj.katoAddress : "", response.obj.fio ? response.obj.fio : "",
            ecp_info.SERIALNUMBER.substr(3) ? ecp_info.SERIALNUMBER.substr(3) : "", response.obj.okedName ? response.obj.okedName : "", userID,];

        let array_of_components_codes = [
            {"id": "surname", "type": "textbox"}, {
                "id": "family_name",
                "type": "textbox"
            }, {"id": "patronymic", "type": "textbox"},
            {"id": "phone", "type": "textbox"}, {"id": "email", "type": "textbox"},
            {"id": "bin", "type": "textbox"}, {"id": "name_org", "type": "textbox"}, {
                "id": "registerDate",
                "type": "date"
            },
            {"id": "okedCode", "type": "textbox"}, {"id": "krpName", "type": "textbox"},
            {"id": "katoAddress", "type": "textbox"}, {"id": "fio", "type": "textbox"},
            {"id": "iin", "type": "textbox"}, {"id": "okedName_textbox", "type": "textbox"},
            {"id": "userID", "type": "textbox"}, {"id": "name_org", "type": "textbox"}];
        for (let i = 0; i < array_of_components_codes.length; i++) {
            array_of_components_codes[i].value = array_of_values[i];
            array_of_components_codes[i].key = array_of_values[i];
        }

        array_of_components_codes.push(getDateBirth(ecp_info.SERIALNUMBER.substr(3)));
        array_of_components_codes.push({
            id: "radio_status",
            type: "radio",
            value: compForm ? "1" : "2",
            key: compForm ? "ФЛ" : "ЮЛ"
        })
        userData.data = array_of_components_codes;

        mergeInfoToPersonalData(userData).then(function (info) {
            console.log(info);
        });
        // } else {
        //     console.log(userCards);
        //     showMessage('Личная карточка пользователя не найдена', 'error');
        // }
        // });
    }

    const emptyValidator = (input) => {
        input.text = $("#" + input.code).val();
        if (input && input.text && input.text !== '') {
            fire({
                type: 'input_highlight',
                error: false
            }, input.code);
            return true;
        } else {
            fire({
                type: 'input_highlight',
                error: true
            }, input.code);
            return false;
        }
    };

    const emailValidator = (input) => {
        input.text = $("#" + input.code).val();
        if (emptyValidator(input)) {
            let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (input && regex.test(input.text)) {
                fire({
                    type: 'input_highlight',
                    error: false
                }, input.code);
                return true;
            } else {
                fire({
                    type: 'input_highlight',
                    error: true
                }, input.code);
                return false;
            }
        }
        return false;
    };

    // Выполняем действие только при нажатии на кнопку register

    const baseParamsChecker = function () {
        let email = getCompByCode('email');
        let phone = getCompByCode('phone');
        let passwordConfirm = getCompByCode('passwordConfirm');
        let password = getCompByCode('password');

        let success = emptyValidator(password) &
            emptyValidator(passwordConfirm) &
            emailValidator(email) &
            phoneValidator(phone);

        if (!success) {
            //отображаем сообщение с типом “ошибка”
            showMessage('Не все поля формы регистрации были заполнены', 'error');
            return false;
        }

        registration_info = {
            "password": password.text,
            "email": email.text,
            "passwordConfirm": passwordConfirm.text,
            "phone": phone.text
        };
        return true;
    };

    function setRegistrationInfo(pass) {
        if (pass) {
            let email = $('#email');
            let phone = $('#phone');
            let passwordConfirm = $('#passwordConfirm');
            let password = $('#password');

            email.val(registration_info.email);
            phone.val(registration_info.phone);
            passwordConfirm.val(registration_info.passwordConfirm);
            password.val(registration_info.password);
        }
    }

    const getAuth = async function () {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/person/auth",
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": ("Basic " + btoa($('#email').val() + ":" + $('#password').val()))
                    }
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

    const getOCSPResponse = async function (cert) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/ncalayer/api/ocsp/check",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(cert)
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

    const createUser = async function () {
        return new Promise(async function (resolve) {
            $.ajax({
                "url": window.origin + "/Synergy/rest/api/filecabinet/user/save",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic MTox",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                "data": {
                    // "firstname": registration_info.CN.split(" ")[1],
                    "firstname": ecp_info.CN.split(" ")[1],
                    "lastname": ecp_info.SURNAME,
                    "patronymic": ecp_info.G,
                    "pointersCode": ecp_info.SERIALNUMBER,
                    "login": $('#email').val(),
                    "password": $('#password').val()
                }
            }).done(function (response) {
                resolve(response);
            });
        });
    };


    const getDateResponse = async function (date) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/ncalayer/api/date/check",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(date)
                }).done(function (response) {
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve(false);
            }
        });
    };

    const addUserToGroup = async function (groupCode, userId) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/storage/groups/add_user?groupCode=" + groupCode + "&userID=" + userId,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Basic MTox",
                    }
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve({"success": false, "obj": {}});
            }
        });
    };

    const getStatGovData = async function (bin, lang) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/statgov/rest/api/juridical?bin=" + bin + "&lang=" + lang,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": ("Basic " + btoa($('#email').val() + ":" + $('#password').val()))
                    }
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                }).fail(function (response, statusText, xhr) {
                    resolve({"success": false, "obj": {}});
                });
            } catch (e) {
                console.error(e);
                resolve({"success": false, "obj": {}});
            }
        });
    };

    const getPersonalFormUUID = async function (userID) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": window.origin + "/Synergy/rest/api/personalrecord/forms/" + userID,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        //"Authorization": ("Basic " + btoa($('#email').val() + ":" + $('#password').val()))
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

    const checkBastauGroups = async function (catoId) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": "https://api-academy.atameken.kz/api/public/get-registration-status?cato_id=" + catoId,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Basic PyUmYXdTRSU1VSVoSzI1Rjo3VWptOFVoYg=="
                    },
                }).done(function (response, statusText, xhr) {
                    console.log(response, statusText, xhr);
                    resolve(response);
                }).fail(function (response, statusText, xhr) {
                    console.log(response, statusText, xhr);
                    if (response.status == 422) {
                        showMessage('Нет свободных групп в текущем регионе', 'error');
                    } else if (response.status == 406) {
                        showMessage('Участник не отклонен и не исключен', 'error');
                    } else if (response.status == 404) {
                        showMessage('Участника нет в базе', 'error');
                    } else if (response.status == 403) {
                        showMessage('Регион заблокирован из админки', 'error');
                    }
                    resolve({"success": false, "message": {}});
                });
            } catch (e) {
                console.error(e);
                resolve([]);
            }
        })
    }

    const checkIIN = async function (iin,) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": "https://api-academy.atameken.kz/api/public/participant/check-iin",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Bearer ?%&awSE%5U%hK25F",
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify({
                        "iin": iin,
                        "project_id": "3",
                        "current_project_id": "3",
                        "from_welcome": true
                    }),
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                }).fail(function (response, statusText, xhr) {
                    resolve(xhr);
                });
            } catch (e) {
                console.error(e);
                resolve([]);
            }
        });
    }

    const newApplicant = async function (applInfo) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": "https://api-academy.atameken.kz/api/public/new-application",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Bearer ?%&awSE%5U%hK25F",
                        "Content-Type": "application/json"
                    },
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

    const getApplicationInfo = function (formData) {
        let iin = formData.data.filter(x => x.id == 'iin')[0];
        let bin = formData.data.filter(x => x.id == 'bin')[0];
        let company_name = formData.data.filter(x => x.id == 'name')[0];
        let phone = formData.data.filter(x => x.id == 'phone')[0];
        let email = formData.data.filter(x => x.id == 'email')[0];
        let textbox_address = formData.data.filter(x => x.id == 'katoAddress')[0];
        let surname = formData.data.filter(x => x.id == 'surname')[0];
        let family_name = formData.data.filter(x => x.id == 'family_name')[0];
        let patronymic = formData.data.filter(x => x.id == 'patronymic')[0];

        let gender = (parseInt(iin.value.substring(6, 7)) - 2) == 1 ? "M" : "Ж";

        return {
            "user": {
                "iin": iin.value,
                "phone": phone.value ? phone.value.replace(/[^0-9]/g, '') : "",
                "email": email.value,
                "password": $(".atamekenPassword").attr("password"),
                "first_name": family_name.value,
                "last_name": surname.value,
                "patronymic": patronymic.value,
                "gender": gender,
                "region_id": $(".atamekenRegion").attr("region"),
                "district_id": $(".atamekenDistrict").attr("district"),
                "arta_id": AS.OPTIONS.currentUser.userid
            },
            "company": {
                "company_type_id": "unknown",
                "name": company_name.value,
                "bin": bin.value
            },
            "lang_id": 0,
            "disability": 0,
            "job_status_id": 0,
            "category": 0,
            "participant_set": false,
            "reapply": false
        };
    }

    const getCatoId = function () {
        let cato_id = $(".atamekenRegion").attr("region");

        if (cato_id == '71' || cato_id == '75' || cato_id == '79') {
            return cato_id;
        }

        cato_id = $(".atamekenDistrict").attr("district");

        return cato_id;
    }

    let personal_uuid = Cons.getAppStore().certificate_present.userCard;
    let password = "";
    if (Cons.getCurrentPage().code === "request_training") {
        console.log(Cons);
        $("#button-ecp-sign").off();
        $("#button-ecp-sign").click(function () {

            getKeyInfoCallButton.text("Подписать");

            fire({
                type: 'set_form_editable',
                editable: true,
            }, 'formPlayer-1');

            fire({
                type: 'set_hidden',
                hidden: true
            }, 'button-send-it');

            fire({
                type: 'validate_form_data',
                callback: async errors => {
                    if (errors.length) {
                        if (errors[0].hasOwnProperty('errorMessage')) {
                            console.error(errors[0].errorMessage, errors);
                            showMessage(errors[0].errorMessage, 'error');
                        } else {
                            console.error('Заполните обязательные поля!', errors);
                            showMessage('Заполните обязательные поля!', 'error');
                        }

                        return;
                    }
                    console.log("password " + $("input.atamekenPassword").val());
                    password = $("input.atamekenPassword").val();
                    getKeyInfoCall();
                }
            }, 'formPlayer-1');
        });

        $("#button-send-it").off();
        $("#button-send-it").click(function () {
            fire({
                type: 'validate_form_data',
                callback: async errors => {
                    if (errors.length) {
                        if (errors[0].hasOwnProperty('errorMessage')) {
                            console.error(errors[0].errorMessage, errors);
                            showMessage(errors[0].errorMessage, 'error');
                        } else {
                            console.error('Заполните обязательные поля!', errors);
                            showMessage('Заполните обязательные поля!', 'error');
                        }
                        return;
                    }
                    fire({
                        type: 'create_form_data',
                        registryCode: 'reg_zayavlenie_na_obuch',
                        activate: true,
                        success: (dataId, documentId) => {
                            showMessage('Заявка успешно создана в системе Synergy!', 'success');


                            getPersonalFormData(personal_uuid).then(function (formData) {
                                let applInfo = getApplicationInfo(formData);
                                checkIIN(applInfo.user.iin).then(function (iinData) {
                                    if (iinData.success && iinData.participant) {   // Атамекен вернул инфу по данному пользователю
                                        showMessage('Заявка по данному пользователю уже подана', 'info');
                                    } else {                                        // Атамекен не вернул инфу по данному пользователю
                                        showMessage('Участника по данному ИИН нет', 'info');

                                        checkBastauGroups(getCatoId()).then(function (groupsData) {
                                            if (groupsData.success) {
                                                // TODO
                                                newApplicant(applInfo).then(function (res) {
                                                    console.log(res);
                                                    showMessage('Заявка успешно создана в Атамекене', 'success');
                                                });
                                            } else
                                                console.log("123");
                                        });
                                    }
                                });
                            });
                        },
                        error: (status, error) => {
                            console.error("FAILED! ", error);
                            showMessage('Произошла ошибка сохранения!', 'error');
                        }
                    }, 'formPlayer-1');
                }
            }, 'formPlayer-1');

        });
    }
}


if (editable) {
    $(view.container).addClass("current_iin");
}

if (editable) {
    $(view.container).addClass("current_iin");
    $(view.container).attr("cur_iin", model.getValue() ? model.getValue() : "");

    model.on("valueChange", function (event) {
        $(view.container).addClass("current_iin");
        $(view.container).attr("cur_iin", model.getValue() ? model.getValue() : "");
    });
} else {
    $(view.container).addClass("current_iin");
    $(view.container).attr("cur_iin", model.getValue() ? model.getValue() : "");

    model.on("valueChange", function (event) {
        $(view.container).addClass("current_iin");
        $(view.container).attr("cur_iin", model.getValue() ? model.getValue() : "");
    });
}

