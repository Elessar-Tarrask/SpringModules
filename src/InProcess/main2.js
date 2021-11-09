if (editable) {
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


    getPersonalFormUUID(AS.OPTIONS.currentUser.userid).then(async function (userCards) {
        if (userData.data.length && userData.data[0].dataUUID) {
            let personal_uuid = userData.data[0].dataUUID;
            getPersonalFormData(personal_uuid).then(function (formData) {
                console.log(formData);
                let iin = formData.data.filter(x => x.id == 'iin')[0];
                let bin = formData.data.filter(x => x.id == 'bin')[0];
                let company_name = formData.data.filter(x => x.id == 'name')[0];
                let phone = formData.data.filter(x => x.id == 'phone')[0];
                let email = formData.data.filter(x => x.id == 'email')[0];
                let textbox_address = formData.data.filter(x => x.id == 'katoAddress')[0];
                let surname = formData.data.filter(x => x.id == 'surname')[0];
                let family_name = formData.data.filter(x => x.id == 'family_name')[0];
                let patronymic = formData.data.filter(x => x.id == 'patronymic')[0];
                let invalid = formData.data.filter(x => x.id == 'listbox_disabled_person')[0];
                let birthDate = formData.data.filter(x => x.id == 'date_birth')[0];
                let radio_status = formData.data.filter(x => x.id == 'radio_status')[0];

                let applInfo = {
                    "user": {
                        "iin": iin.value,
                        "phone": phone.value,
                        "password": "pass123",
                        "first_name": family_name.value,
                        "last_name": surname.value,
                        "patronymic": patronymic.value,
                        "gender": "1",
                        "region_id": 0,
                        "district_id": 0,
                        "arta_id": 0
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

                model.playerModel.getModelWithId("iin").setValue(iin.value ? iin.value : "");
                $(".current_iin").attr("cur_iin", iin.value);

                model.playerModel.getModelWithId("phone").setValue(phone.value ? phone.value : "");

                model.playerModel.getModelWithId("email").setValue(email.value ? email.value : "");

                model.playerModel.getModelWithId("textbox_address").setValue(textbox_address.value ? textbox_address.value : "");

                model.playerModel.getModelWithId("invalid").setValue(invalid.value ? invalid.value: "Нет");

                model.playerModel.getModelWithId("gender").setValue(iin.value ? [(parseInt(iin.value.substring(6, 7)) - 2) + ""] : "");

                model.playerModel.getModelWithId("radio_status").setValue(radio_status.value ? [radio_status.value]: "");

                model.playerModel.getModelWithId("date_of_birth").setValue(birthDate.key ? birthDate.key : null);
            });
        }
    });
}