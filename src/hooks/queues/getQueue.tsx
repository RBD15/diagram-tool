import { AxiosResponse } from "axios";
import { RequestClient } from "../../db/RequestClient";

export async function getQueues(baseURL: string){
    const url = "api/queues/operation/1234"
    const requestClient: RequestClient = new RequestClient(baseURL)
    const queues: AxiosResponse  = await requestClient.get(url);
    console.log("Queues",queues.data);
    return queues.data    
}