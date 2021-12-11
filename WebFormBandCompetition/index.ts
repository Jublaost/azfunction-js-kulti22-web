import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import qs = require('qs');

const APP_ID = process.env["appId"];
const APP_SECRET = process.env["appSecret"];
const TENANT_ID = process.env["tenantId"];
const SITE_ID = process.env["siteId"];
const COMPETITION_LIST_ID = process.env["competitionListId"];


const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_LISTITEM = 'https://graph.microsoft.com/v1.0/sites/' + SITE_ID + '/lists/' + COMPETITION_LIST_ID + '/items';
const MS_GRAPH_ENDPOINT_SENDMAIL = 'https://graph.microsoft.com/v1.0/users/info@kulti22.ch/sendMail';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log("Body: ", req.body)

    let validation = await validateRECAP(req.body["g-recaptcha-response"]);
    context.log(validation);

    if (validation) {

        // Set Default Header for Axios Requests
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        let token = await getToken();
        let response = await postListItem(token, req.body);
        let mail = await sendMail(token, req.body);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: req.body
        };
    } else {
        context.log("validation failed");
        context.res = {
            status: 500
        }
    }

};

export default httpTrigger;


async function validateRECAP(token: string) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: "https://www.google.com/recaptcha/api/siteverify",
        params: {
            secret: "6Le6UXYdAAAAAMugTHAfZoozHLgn7AV5XnIa_7Gc",
            response: token
        }
    }

    return await axios(config)
        .then(response => {
            return response.data.success;
        })
        .catch(error => {
            console.log(error);
        });
}

/**
 * Get Token for MS Graph
 */
async function getToken(): Promise<string> {
    const postData = {
        client_id: APP_ID,
        scope: MS_GRAPH_SCOPE,
        client_secret: APP_SECRET,
        grant_type: 'client_credentials'
    };

    return await axios
        .post(TOKEN_ENDPOINT, qs.stringify(postData))
        .then(response => {
            // console.log(response.data);
            return response.data.access_token;
        })
        .catch(error => {
            console.log(error);
        });
}


async function sendMail(token: string, body: any) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: MS_GRAPH_ENDPOINT_SENDMAIL,
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        },
        data: {
            "message": {
                "subject": "Bestätigung Teilnahme Band Competition Kulti22",
                "body": {
                    "contentType": "html",
                    "content": "Hallo " + body.Title + "<br /><br /><strong>Toll bist/seid du/ihr dabei</strong><br /><br />Feurige Grüsse<br />Das Kulti22 Team"
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": body.email
                        }
                    }
                ]
            },
            "saveToSentItems": "true"
        }
    }

    return await axios(config)
        .then(response => {
            console.log(response.data);
            return response.data.value;
        })
        .catch(error => {
            console.log(error);
        });
}


/**
 * Post Item
 * @param token Token to authenticate through MS Graph
 */
async function postListItem(token: string, body: any): Promise<any> {

    let config: AxiosRequestConfig = {
        method: 'post',
        url: MS_GRAPH_ENDPOINT_LISTITEM,
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        },
        data: {
            "fields": {
                "Title": body.bandname,
                "Kontaktemail": body.email,
                "Homepage": body.homepage,
                "Beschreibung": body.description
            }
        }
    }

    return await axios(config)
        .then(response => {
            console.log(response.data);
            return response.data.value;
        })
        .catch(error => {
            console.log(error);
        });
}
