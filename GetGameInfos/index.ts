import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, gamesIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(gamesIn)

    let resp = {
        slot01field01: gamesIn.filter(val => val.field === 'Feld01;13:00-14:00').length,
        slot01field02: gamesIn.filter(val => val.field === 'Feld02;13:00-14:00').length,
        slot02field01: gamesIn.filter(val => val.field === 'Feld01;14:00-15:00').length,
        slot02field02: gamesIn.filter(val => val.field === 'Feld02;14:00-15:00').length,
        slot03field01: gamesIn.filter(val => val.field === 'Feld01;15:00-16:00').length,
        slot03field02: gamesIn.filter(val => val.field === 'Feld02;15:00-16:00').length
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: resp
    };

};

export default httpTrigger;