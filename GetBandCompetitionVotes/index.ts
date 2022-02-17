import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let votes: Vote[] = context.bindings.votingEntities;

    const result = votes.reduce((counter, vote) => (counter[vote.Act] = (counter[vote.Act] || 0) + 1, counter), {});

    console.log(result);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };
};

export default httpTrigger;

class Vote {
    Act: string;
}