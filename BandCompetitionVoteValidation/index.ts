import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let successForward = "https://link.kulti22.ch/votingSuccess";
    let errorForward = "https://link.kulti22.ch/votingError";

    if (context.bindings.votingEntity) {
        var res = { status: 302, headers: { "location": successForward }, body: null };
        context.done(null, res);
    } else {

        let email = context.bindings.validationEntity.RowKey;
        let code = context.bindings.validationEntity.Code;
        let act = context.bindings.validationEntity.Act;

        context.log('Entity Email: ' + email);
        context.log('Entity Code: ' + code);
        context.log('Entity Act: ' + act);

        if (req.query.code == code) {
            context.bindings.tableBinding = [];
            context.bindings.tableBinding.push({
                PartitionKey: "VOTE",
                RowKey: email,
                Act: act,
            });

            var res = { status: 302, headers: { "location": successForward }, body: null };
            context.done(null, res);
        } else {
            var res = { status: 302, headers: { "location": errorForward }, body: null };
            context.done(null, res);
        }
    }

};

export default httpTrigger;