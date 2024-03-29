import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, usersIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(usersIn)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: usersIn
    };

};

export default httpTrigger;