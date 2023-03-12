import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from "../../businessLogic/Todo";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Implement creating a new TODO item
    const authorization = event.headers.Authorization;
    const authorizationContents = authorization.split(' ');
    const jwtToken = authorizationContents[1];

    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const item = await createTodo(newTodo, jwtToken);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "item": item
        }),
    }
};