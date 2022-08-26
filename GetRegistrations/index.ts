import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, spikeballIn, gamesIn): Promise<void> {

    context.log("Games: ", gamesIn);
    context.log("Spikeball: ", spikeballIn)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { gl: gamesIn, spikeball: spikeballIn }
    };
};

export default httpTrigger;