import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, joinIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    context.log("Vote: ", joinIn)

    let successForward = "https://www.kulti22.ch/messages/success/";
    let errorForward = "https://www.kulti22.ch/messages/error/";

    if (req.query.code == joinIn.code) {
        joinIn.approved = true
        context.bindings.joinOut = joinIn

        context.res = { status: 302, headers: { "location": successForward }, body: null };
        return
    } else {
        context.res = { status: 302, headers: { "location": errorForward }, body: null };
        return
    }

};

export default httpTrigger;