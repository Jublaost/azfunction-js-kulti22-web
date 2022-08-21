import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import qs = require('qs');
import fs = require('fs');

const APP_ID = process.env["appId"];
const APP_SECRET = process.env["appSecret"];
const TENANT_ID = process.env["tenantId"];

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_SENDMAIL = 'https://graph.microsoft.com/v1.0/users/info@kulti22.ch/sendMail';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let template = getHTMLTemplate();
    let pdfBytes = getPDFAtachement();
    let token = await getToken();

    let list = getTxTList();
    for (let row of list.split("\n")) {
        if (row.length > 0) {
            let mailResponse = await sendMail(context, token, template, pdfBytes, row)
            context.log(mailResponse)
            await sleep(500);
        }
    }


    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { done: true }
    }
};

export default httpTrigger;

function getPDFAtachement(): string {
    try {
        return fs.readFileSync('/workspaces/azfunction-js-kulti22-web/RundMail/Kulti22_FestivalGuide.pdf', 'base64');
    } catch (err) {
        console.error(err);
    }
}

/**
 * 
 */
function getHTMLTemplate(): string {
    try {
        return fs.readFileSync('/workspaces/azfunction-js-kulti22-web/RundMail/content.html', 'utf8');
    } catch (err) {
        console.error(err);
    }
}

function getTxTList(): string {
    try {
        return fs.readFileSync('/workspaces/azfunction-js-kulti22-web/RundMail/besucher.txt', 'utf8');
    } catch (err) {
        console.error(err);
    }
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
            return response.data.access_token;
        })
        .catch(error => {
            console.log(error);
        });
}

/**
 * Send Verification Email
 * @param token MS Graph Token
 * @param email of user
 * @returns 
 */
async function sendMail(context, token: string, template: string, pdfBytes: string, email: any) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: MS_GRAPH_ENDPOINT_SENDMAIL,
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        },
        data: {
            "message": {
                "subject": "Dä Funkä tanzt bald! Letzte Infos fürs Kulti 22!",
                "body": {
                    "contentType": "html",
                    "content": template
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": email
                        }
                    }
                ],
                "attachments": [
                    {
                        '@odata.type': '#microsoft.graph.fileAttachment',
                        name: 'Kulti22_FestivalGuide.pdf',
                        contentType: 'application/pdf',
                        contentBytes: pdfBytes
                    }
                ]
            },
            "saveToSentItems": "true"
        }
    }

    return await axios(config)
        .then(response => {
            return { status: response.status, email: email }
        })
        .catch(async error => {
            if (error.response.status === 429) {
                await sleep(1000);
                context.log("Retry: ", email);
                return await sendMail(context, token, template, pdfBytes, email)
            }

            else {
                return { status: error.response.status, email: email }
            }
        });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}