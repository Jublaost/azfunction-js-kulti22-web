import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, gamesIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log(gamesIn)

    for (let i of gamesIn.filter(x => !x.approved)) {
        let overTimeLimit: boolean = new Date().getTime() / 1000 > i._ts + 3600
        if (overTimeLimit) {
            context.log("Time Limit reached: ", i.name, overTimeLimit);
            const client = new CosmosClient(process.env.Jublaost_COSMOSDB);
            const container = client.database("kulti22").container("spikeball")
            const { resource } = await container.item(i.id, i.id).delete()
        }
    }

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