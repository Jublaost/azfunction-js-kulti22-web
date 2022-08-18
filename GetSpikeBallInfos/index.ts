import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, gamesIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    for (let i of gamesIn.filter(x => !x.approved)) {
        let overTimeLimit: boolean = new Date().getTime() / 1000 > i._ts + 3600
        if (overTimeLimit) {
            context.log("Time Limit reached: ", i.name, overTimeLimit);
            const client = new CosmosClient(process.env.Jublaost_COSMOSDB);
            const container = client.database("kulti22").container("spikeball")
            const { resource } = await container.item(i.id, i.id).delete()
        }
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: gamesIn.length
    };

};

export default httpTrigger;