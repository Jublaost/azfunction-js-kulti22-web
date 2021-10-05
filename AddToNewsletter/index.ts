import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    context.log(req.body)

    context.bindings.tableBinding = [];

    context.bindings.tableBinding.push({
        PartitionKey: "newsletter",
        RowKey: req.body.email,
    });

    context.done();

};

export default httpTrigger;