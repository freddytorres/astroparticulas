var oJIRA_FDBCK = {
    VERSION: "2.2.0",
    KNOWNHOST: {
        RCSB: "www.rcsb.org",
        PDB101: "pdb101.rcsb.org",
        SIERRA: "www4.rcsb.org",
        DEV: "jira-tc.rcsb.org"
    },
    URL: {
        // instead of submitting directly to jira.rcsb.org,
        // we are making use of a proxy server (see JiraFeedbackProxy project)
        // https://github.com/rcsb/JiraFeedbackProxy)
        JIRA_PROXY: {
            ROOT_DEV: "https://jira-proxy-dev.rcsb.org/",
            ROOT_PROD: "https://jira-proxy.rcsb.org/"
        },
        IMG_LOGO: {
            RCSB: "https://cdn.rcsb.org/rcsb-pdb/v2/common/images/rcsb_logo.png",
            PDB101: "https://cdn.rcsb.org/pdb101/common/images/logo-pdb101.png",
            WWPDB: "https://cdn.rcsb.org/rcsb-pdb/v2/common/images/Logo_wwpdb.png"
        },
        FDBCK_HTML_SRC: {
            DEV: "includes/jira-fdbck.html",
            RCSB: "https://cdn.rcsb.org/jira-feedback/includes/jira-fdbck.html"
        }
    },
    JIRA: {
        PROJKEY: {
            DEV: "TC",
            BETA: "RBT",
            PROD: "HELP"
        },
        ISSUETYPE: {
            DEV: "Task",
            PROD: "Bug"
        }
    },
    LOGGINGPREFIX: "JIRA-FEEDBACK: ",
    MAXUPLOADS: 3,
    MAXFILESIZEBYTES: 5000000, //5MB
    DEBUG: false
};

$(function () {
    var thisHost = document.location.hostname;
    var fdbckHtmlSrc;
    var jiraProxyRootUrl;
    var logoSrc;
    var projKey;
    var issueType;

    ///////////////////////////////////////////////////////////////////////////
    // specify settings given a particular host
    ///////////////////////////////////////////////////////////////////////////
    switch (thisHost) {
        // www.rcsb.org
        case oJIRA_FDBCK.KNOWNHOST.RCSB:
            fdbckHtmlSrc = oJIRA_FDBCK.URL.FDBCK_HTML_SRC.RCSB;
            jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_PROD;
            logoSrc = oJIRA_FDBCK.URL.IMG_LOGO.RCSB;
            projKey = oJIRA_FDBCK.JIRA.PROJKEY.PROD;
            issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.PROD;
            break;

        // pdb101.rcsb.org
        case oJIRA_FDBCK.KNOWNHOST.PDB101:
            fdbckHtmlSrc = oJIRA_FDBCK.URL.FDBCK_HTML_SRC.RCSB;
            jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_PROD;
            logoSrc = oJIRA_FDBCK.URL.IMG_LOGO.PDB101;
            projKey = oJIRA_FDBCK.JIRA.PROJKEY.PROD;
            issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.PROD;
            break;

        // www4.rcsb.org
        case oJIRA_FDBCK.KNOWNHOST.SIERRA:
            fdbckHtmlSrc = oJIRA_FDBCK.URL.FDBCK_HTML_SRC.RCSB;
            jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_PROD;
            logoSrc = oJIRA_FDBCK.URL.IMG_LOGO.RCSB;
            projKey = oJIRA_FDBCK.JIRA.PROJKEY.PROD;
            issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.PROD;
            break;

        // DEV site: jira-tc.rcsb.org
        case oJIRA_FDBCK.KNOWNHOST.DEV:
            fdbckHtmlSrc = oJIRA_FDBCK.URL.FDBCK_HTML_SRC.DEV;
            jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_DEV;
            logoSrc = oJIRA_FDBCK.URL.IMG_LOGO.RCSB;
            projKey = oJIRA_FDBCK.JIRA.PROJKEY.DEV;
            issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.DEV;
            oJIRA_FDBCK.DEBUG = true;
            break;

        // All other logic (primary production paths having been defined above)
        default:
            // We will use RCSB branding
            fdbckHtmlSrc = oJIRA_FDBCK.URL.FDBCK_HTML_SRC.RCSB;
            logoSrc = oJIRA_FDBCK.URL.IMG_LOGO.RCSB;

            // We will enable debugging if set to true (to aid development, beta testing)
            oJIRA_FDBCK.DEBUG = false;

            // We will now select destination for tickets based upon conditions, but everything starts as routing to Dev resources
            jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_DEV;
            projKey = oJIRA_FDBCK.JIRA.PROJKEY.DEV;
            issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.DEV;

            // The domain ends in "rcsb.org" SO we are not connecting via IP or localhost
            if (hostIsRcsbDomain(thisHost)) {
                // If this system hostname looks like a beta, testing, staging, release, quickly system - TREAT AS BETA
                if (hostIsBetaSystem(thisHost)) {
                    jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_PROD;
                    projKey = oJIRA_FDBCK.JIRA.PROJKEY.BETA;
                    issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.PROD;
                }
                else {
                    // We can't figure out what kind of system this is - so default to treating it like it is prod (fail safe)
                    jiraProxyRootUrl = oJIRA_FDBCK.URL.JIRA_PROXY.ROOT_PROD;
                    projKey = oJIRA_FDBCK.JIRA.PROJKEY.PROD;
                    issueType = oJIRA_FDBCK.JIRA.ISSUETYPE.PROD;
                }
            }
    }

    if (oJIRA_FDBCK.DEBUG) {
        console.info(oJIRA_FDBCK.LOGGINGPREFIX + "Debug/Beta/Development mode engaged");
        console.info(oJIRA_FDBCK.LOGGINGPREFIX + "Current host is: " + thisHost);
        console.info(oJIRA_FDBCK.LOGGINGPREFIX + "Proxy: " + jiraProxyRootUrl);
        console.info(oJIRA_FDBCK.LOGGINGPREFIX + "Project: " + projKey);
        console.info(oJIRA_FDBCK);
    }
    console.info(oJIRA_FDBCK.LOGGINGPREFIX + "Version " + oJIRA_FDBCK.VERSION);

    // recruit html markup for jira-fdbck content onto page into <div id="jira-fdbck"></div>
    $.get(fdbckHtmlSrc, function (data) {
        $("#jira-fdbck").html(data);
        $(".modal-logo").attr("src", logoSrc);
        $("#projectkey").val(projKey);
        $("#issuetype").val(issueType);
        if (oJIRA_FDBCK.DEBUG) {
            console.log(oJIRA_FDBCK.LOGGINGPREFIX + "Ajax feedback html import was performed (feedback modal prepared).");
        }
    });

    // Each time a form is clicked on
    // uses localstorage for checkbox
    // launch/show form
    $(document).on("click", ".jira-fdbck-btn", function () {
        $("#jira-fdbck-modal").modal("show");

        //getting value from web storage for fname, lname, email
        var checkedVal = JSON.parse(localStorage.getItem('privacyPolicyAgreement'));
        document.getElementById('privacyPolicyAgreement').checked = checkedVal
        var fnameVal= sessionStorage.getItem('fname');
        document.getElementById('fname').value = fnameVal
        var lnameVal= sessionStorage.getItem('lname');
        document.getElementById('lname').value = lnameVal
        var emailVal= sessionStorage.getItem('email');
        document.getElementById('email').value = emailVal

        $("#jira-fdbck-submit").prop("disabled", false);
    });

    // FRONT-371 - Checkbox of Privacy Policy
    $(document).on("click", "#privacyPolicyAgreement", function (event) {
        if (event.target.checked) {
            $("#jira-fdbck-submit").prop("disabled", false);
        } else {
            $("#jira-fdbck-submit").prop("disabled", true);
        }
    });

    // RESET each time modal feedback form is launched
    $("#jira-fdbck").on("show.bs.modal", "#jira-fdbck-modal", function () {
        //clear form fields each time modal is launched to capture a new issue
        $("#feedbackfrm .form-control").val("");
        $("#privacyPolicyAgreement").removeAttr('checked');
        $("#maxuploads").text(oJIRA_FDBCK.MAXUPLOADS);

        //clear any field validation prompts
        clearValidationPrompts();
    });

     // form submit handler
        $("#jira-fdbck").on("click", "#jira-fdbck-submit", function () {

            //localstorage for fname, lname, email
            var fnameInput = document.getElementById('fname');
            var lnameInput = document.getElementById('lname');
            var emailInput = document.getElementById('email');
            var privacyCheckbox = document.getElementById('privacyPolicyAgreement');

            if (localStorage || sessionStorage) {
                // store the value of key in web storage
                sessionStorage.setItem('fname', fnameInput.value);
                sessionStorage.setItem('lname', lnameInput.value);
                sessionStorage.setItem('email', emailInput.value);
                localStorage.setItem('privacyPolicyAgreement', privacyCheckbox.checked);
            }
            // disable submit button to prevent erroneous duplicated submits
            $("#jira-fdbck-submit").prop("disabled", true);

            // 2018-02-22, RPS: FRONT-245 --> for prototyping needs simply overloading environmentProps
            // to include Optional User Background info as well, until such time that JIRA config can be
            // updated to accept the new data items as custom JIRA fields for HELP project
            var environmentProps = {
                "Location": window.location.href,
                "User-Agent": navigator.userAgent,
                "Referrer": document.referrer,
                "Screen Resolution": screen.width + " x " + screen.height
            };

            var environmentStr = JSON.stringify(environmentProps, null, 4);
            if (oJIRA_FDBCK.DEBUG) {
                console.log(oJIRA_FDBCK.LOGGINGPREFIX + environmentStr);
            }

            if (problemWithReqdField() || maxFilesExceeded() || surpassFileSizeLimit()) {
                // if we have a problem with any of the required fields or if
                // file handling limits exceeded then abort form submission

                // have to reenable submit button to allow user to submit after correcting issues
                $("#jira-fdbck-submit").prop("disabled", false);
                return false;
            } else {
                // collect/generate the submission data
                var userBackgroundInstType = "Not Provided/Declined to State";
                var userBackgroundInstTypeRaw = $("#instype").val();
                if (userBackgroundInstTypeRaw) {
                    if (userBackgroundInstTypeRaw.length > 1) {
                        userBackgroundInstType = userBackgroundInstTypeRaw;
                    }
                }

                var userBackgroundRole = "Not Provided/Declined to State";
                var userBackgroundRoleRaw = $("#role").val();
                if (userBackgroundRoleRaw) {
                    if (userBackgroundRoleRaw.length > 1) {
                        userBackgroundRole = userBackgroundRoleRaw;
                    }
                }

                var userBackgroundResearchInterest = "Not Provided/Declined to State";
                var userBackgroundResearchInterestRaw = $("#rsrch-intrst").val();
                if (userBackgroundResearchInterestRaw) {
                    if (userBackgroundResearchInterestRaw.length > 1) {
                        userBackgroundResearchInterest = userBackgroundResearchInterestRaw;
                    }
                }

                var formData =
                    {
                        "fields": {
                            "project": {
                                "key": $("#projectkey").val()
                            },
                            "summary": $("#subject").val(),
                            "description": $("#description").val(),
                            "issuetype": {
                                "name": $("#issuetype").val()
                            },
                            "environment": environmentStr,
                            // accommodate custom fields whose IDs correspond to identifiers
                            // generated by JIRA and used in REST call processing
                            "customfield_10333": $("#fname").val(),
                            "customfield_10327": $("#lname").val(),
                            "customfield_10322": $("#email").val(),
                            "customfield_11116": {"value": userBackgroundInstType},
                            "customfield_11117": {"value": userBackgroundRole},
                            "customfield_11118": {"value": userBackgroundResearchInterest}
                        }

                    };

                var restPayload = JSON.stringify(formData);

                function doneFxn(jsonRtrn) {
                    var issueKey = jsonRtrn.key;
                    if (oJIRA_FDBCK.DEBUG) {
                        console.log(oJIRA_FDBCK.LOGGINGPREFIX + " feedback submission completed.");
                        console.log(oJIRA_FDBCK.LOGGINGPREFIX + "issueKey is: " + issueKey);
                    }

                    if (document.getElementById("file").files.length == 0) {
                        if (oJIRA_FDBCK.DEBUG) {
                            console.log(oJIRA_FDBCK.LOGGINGPREFIX + "no files selected");
                        }
                    } else {
                        if (oJIRA_FDBCK.DEBUG) {
                            console.log(oJIRA_FDBCK.LOGGINGPREFIX + "File(s) were selected for upload.");
                        }
                        handleFileAttach(issueKey, jiraProxyRootUrl);
                    }

                    $("#jira-fdbck-modal").modal("hide");
                    $("#jira-cnfrm-modal").modal("show");
                    setTimeout(function () {
                        $("#jira-cnfrm-modal").modal("hide");
                    }, 5000);
                }

                function errorFxn(jqXHRrtrn, textStatus, errorThrown) {
                    // function invoked whenever server-side processing of feedback request is unsuccessful

                    console.error(oJIRA_FDBCK.LOGGINGPREFIX + " feedback submission failed");
                    var errorDisplStr = "";

                    if (jqXHRrtrn.responseText && jqXHRrtrn.responseText.length > 1) {
                        errorDisplStr = ": ";
                        var errorObj = JSON.parse(jqXHRrtrn.responseText);
                        console.error(oJIRA_FDBCK.LOGGINGPREFIX + " error on submit! " + JSON.stringify(errorObj.errors));
                    }

                    var errorRelayContent = "<p>Summary: " + formData.fields.summary +
                        "</p><p>Description: " + formData.fields.description +
                        "</p><p>First Name: " + formData.fields.customfield_10333 +
                        "</p><p>Last Name: " + formData.fields.customfield_10327 +
                        "</p><p>Email: " + formData.fields.customfield_10322 +
                        "</p><p>Environment: " + formData.fields.environment;

                    $("#relaycontent").empty().append(errorRelayContent);
                    $("#jira-fdbck-modal").modal("hide");
                    $("#jira-nosrvr-modal").modal("show");

                }

                // process the form
                $.ajax({
                    type: "POST",
                    url: jiraProxyRootUrl + "jiraproxyissue",
                    data: restPayload,
                    dataType: "json",
                    contentType: "application/json", //this needs to be set to avoid CORS blocking,
                    success: doneFxn,
                    error: errorFxn
                });
            }

        });

        // clears prompts for missing fields when fields are populated
        $(document).on("change", ".reqd", function (event) {
            var elemId = $(this).attr("id");
            if ($(this).val().length > 1) {
                $("#" + elemId + "-group").removeClass("has-error");
                $("#" + elemId + "-group .help-block").remove();
            }
        });

        $(document).on("change", "#file", function (event) {
            if (parseInt($(this).get(0).files.length) > oJIRA_FDBCK.MAXUPLOADS) {
                $("#file-group").addClass("has-error").append("<div class=\"help-block\">Can only upload a maximum of " + oJIRA_FDBCK.MAXUPLOADS + " files.</div>");
            } else {
                $("#file-group").removeClass("has-error");
                $("#file-group .help-block").remove();
            }

        });
    });

////////////////////////////////////////////////////////////////////////////
// helper functions
////////////////////////////////////////////////////////////////////////////

    /**
     * File attached input handler
     * @param issueKey
     * @param jiraProxyRootUrl
     */




    function handleFileAttach(issueKey, jiraProxyRootUrl) {
        var form = document.forms.namedItem("feedbackfrm");
        var oData = new FormData(form);

        var url = jiraProxyRootUrl + "jiraproxyattchmnt";

        var oReq = new XMLHttpRequest();
        oReq.open("POST", url, true);
        oReq.onload = function (oEvent) {
            if (oReq.status == 200) {
                if (oJIRA_FDBCK.DEBUG) {
                    console.log(oJIRA_FDBCK.LOGGINGPREFIX + "File(s) successfully uploaded.");
                }
            } else {
                console.error(oJIRA_FDBCK.LOGGINGPREFIX + "Error: " + oReq.status + " occurred when trying to upload file(s).");
            }
        };
        oData.append("issue", issueKey);
        oReq.send(oData);
    }

    /**
     * Check if host is within *.rcsb.org domain space
     * @param host
     * @returns {boolean}
     */
    function hostIsRcsbDomain(host) {

        var rcsbHostRegex = /\.rcsb\.org$/;
        if (!rcsbHostRegex.test(host)) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Check if host is a "beta" type system
     * @param host
     * @returns {boolean}
     */
    function hostIsBetaSystem(host) {
        var reBetaSystem = /(127.0.0.1)|(localhost)|(beta)|(dev)|(staging)|(testing)|(release)|(quickly)|(alpha)/;

        // For each item, check for matches
        var m = host.match(reBetaSystem);
        if (m) {
            if (oJIRA_FDBCK.DEBUG) {
                console.log(oJIRA_FDBCK.LOGGINGPREFIX + "Regex MATCHED [" + m[1] + "] with [" + host + "]");
            }
            return true;
        } else {
            if (oJIRA_FDBCK.DEBUG) {
                console.log(oJIRA_FDBCK.LOGGINGPREFIX + "Regex did not match any pattern with [" + host + "]");
            }
        }

        // No matches - return false
        return false;
    }

    /**
     * Regex to check if email input meets basic requirements
     * @param email
     * @returns {boolean}
     */
    function validateEmail(email) {
        var email_regex = /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,5}$/;
        if (email_regex.test(email)) {
            return true;
        }
        return false;
    }

    /**
     * Function to clear UI display of error displays
     */
    function clearValidationPrompts() {
        $(".has-error").removeClass("has-error");
        $(".help-block").remove();
    }

    /**
     * Simple rate limiter function (number of uploads)
     * @returns {boolean}
     */
    function maxFilesExceeded() {
        var $fileUpload = $("#file");
        if (parseInt($fileUpload.get(0).files.length) > oJIRA_FDBCK.MAXUPLOADS) {
            $("#file-group").addClass("has-error").append("<div class=\"help-block\">Can only upload a maximum of " + oJIRA_FDBCK.MAXUPLOADS + " files.</div>");
            return true;
        }
        return false;
    }

    /**
     * Simple rate limiter function (size of uploads)
     * @returns {boolean}
     */
    function surpassFileSizeLimit() {
        var fileInput = document.getElementById("file");
        var bTooBig = false;
        var fileNameArr = [];

        if (fileInput.files.length > 0) {
            for (var x = 0; x < fileInput.files.length; x++) {
                var thisFile = fileInput.files[x];
                if (oJIRA_FDBCK.DEBUG) {
                    console.log(oJIRA_FDBCK.LOGGINGPREFIX + "Current file: " + thisFile.name + " is " + thisFile.size + " bytes in size");
                }
                if (thisFile.size > oJIRA_FDBCK.MAXFILESIZEBYTES) {
                    fileNameArr.push(thisFile.name);
                    bTooBig = true;
                }
            }
        }
        if (bTooBig) {
            $("#file-group").addClass("has-error").append("<div class=\"help-block\">Problem with file(s): " + fileNameArr.join(", ") + ". Individual file size cannot exceed " + oJIRA_FDBCK.MAXFILESIZEBYTES / 1000000 + " MB.</div>");
        }
        return bTooBig;
    }

    /**
     * Data input checker
     * @returns {boolean}
     */
    function problemWithReqdField() {
        var bWeHaveAProblem = false;

        // clear prior validatiom prompts
        clearValidationPrompts();

        $(".reqd").each(function () {
            var elemId = $(this).attr("id");

            if ($(this).val().length < 1) {
                bWeHaveAProblem = true;
                // add the actual error message under our input
                $("#" + elemId + "-group").addClass("has-error").append("<div class=\"help-block\">Required value missing</div>");
            } else {
                // if current field is email we need to verify proper email format if there is a value
                if (elemId === "email") {
                    var bValidEmail = validateEmail($("#" + elemId).val());
                    if (!bValidEmail) {
                        bWeHaveAProblem = true;
                        // add the actual error message under our input
                        $("#" + elemId + "-group").addClass("has-error").append("<div class=\"help-block\">Not valid email format</div>");
                    }
                }
            }
        });

        return bWeHaveAProblem;
    }
