import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, gamesIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(gamesIn)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: gamesIn.length
    };

};

export default httpTrigger;