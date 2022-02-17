import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import Uuid from 'uuid'
import qs = require('qs');

const APP_ID = process.env["appId"];
const APP_SECRET = process.env["appSecret"];
const TENANT_ID = process.env["tenantId"];

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_SENDMAIL = 'https://graph.microsoft.com/v1.0/users/info@kulti22.ch/sendMail';


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log('Person entity name: ' + context.bindings.votingEntity);
    context.log("Body: ", req.body)

    let validation = await validateRECAP(req.body["g-recaptcha-response"]);
    context.log(validation);

    if (validation) {

        // Set Default Header for Axios Requests
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        context.bindings.tableBinding = [];
        context.bindings.tableBinding.push({
            PartitionKey: "VOTING",
            RowKey: req.body.email,
            Act: req.body.act,
            GUID: Uuid.v4(),
            Verified: false
        });

        let token = await getToken();
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
                "subject": "Verifizierung und Abschluss des Votings!",
                "body": {
                    "contentType": "html",
                    "content": "Du hast dene Stimme " + body.act + " gegeben. Besten Dank!<br /><br />Feurige Grüsse<br />Das Kulti22 Team"
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

