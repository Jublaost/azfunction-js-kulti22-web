import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import qs = require('qs');

const APP_ID = process.env["appId"];
const APP_SECRET = process.env["appSecret"];
const TENANT_ID = process.env["tenantId"];
const SITE_ID = process.env["siteId"];
const LIST_ID = process.env["listId"];


const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_LISTITEM = 'https://graph.microsoft.com/v1.0/sites/' + SITE_ID + '/lists/' + LIST_ID + '/items';
const MS_GRAPH_ENDPOINT_SENDMAIL = 'https://graph.microsoft.com/v1.0/users/info@kulti22.ch/sendMail';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  context.log("Body: ", req.body)

  // Set Default Header for Axios Requests
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  let token = await getToken();
  let response = await postListItem(token, req.body);
  let mail = await sendMail(token, req.body);

  context.log(response, mail);


  context.res = {
    // status: 200, /* Defaults to 200 */
    body: req.body
  };

};

export default httpTrigger;

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
        "subject": "Bestätigung Helfende Kulti22",
        "body": {
          "contentType": "Text",
          "content": "Hallo " + body.vorname + "\n\n<strong>Wir freuen uns sehr, dass du uns dabei unterstützt, das Kulti 22 unvergesslich zu machen. Schon jetzt ganz herzlichen Dank dafür!</strong>\nDie detaillierten Informationen zu deinem Helfendeneinsatz wirst du im Sommer 2022 erhalten.\nBei allfälligen Fragen wende dich bitte an: simona@kulti22.ch\n\nFeurige Grüsse\nDas Kulti22 Team"
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
  let is18: boolean = body.age == "yes" ? true : false;
  let datesAufbau: string[] = body['aufbau-dates'] ? body['aufbau-dates'].split(";") : [];
  let datesKulti: string[] = body['kulti-dates'] ? body['kulti-dates'].split(";") : [];
  let datesAbbau: string[] = body['abbau-dates'] ? body['abbau-dates'].split(";") : [];
  let jobs: string[] = body['can-do'] ? body['can-do'].split(";") : [];


  let config: AxiosRequestConfig = {
    method: 'post',
    url: MS_GRAPH_ENDPOINT_LISTITEM,
    headers: {
      'Authorization': 'Bearer ' + token //the token is a variable which holds the token
    },
    data: {
      "fields": {
        "Title": body.vorname + ' ' + body.nachname,
        "Email": body.email,
        "Handynummer": body.phone,
        "IBAN": body.iban,
        "_x0031_8_x002b_": is18,
        "T_x002d_Shirt": body["shirt-size"],
        "Zusammenmit": body.friend,
        "Beruf": body.job,
        "Fuehrerschein": body['driver-license'],
        "DatenAufbau@odata.type": "Collection(Edm.String)",
        "DatenAufbau": datesAufbau,
        "DatenKulti@odata.type": "Collection(Edm.String)",
        "DatenKulti": datesKulti,
        "DatenAbbau@odata.type": "Collection(Edm.String)",
        "DatenAbbau": datesAbbau,
        "Jobs@odata.type": "Collection(Edm.String)",
        "Jobs": jobs,
        "Nachricht": body.message
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
