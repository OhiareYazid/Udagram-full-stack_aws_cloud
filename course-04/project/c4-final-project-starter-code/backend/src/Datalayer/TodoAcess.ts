//const AWSXray = require("aws-xray-sdk-core");
const AWS = require("aws-sdk")
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

//const XAWS = AWSXray.captureAWS(AWS);
export class TodoAccess {
    constructor(
        private readonly dynamoClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly tableName = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME
    ) {}

    async generateUploadUrl(id: string): Promise<string> {
        console.log("Generating uploading URL");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: id,
            Expires: 1000,
        });
        console.log('URL generated', url);

        return url as string;
    }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo");

        const parameters = {
            TableName: this.tableName,
            Item: item,
        };

        const result = await this.dynamoClient.put(parameters).promise();
        console.log('created new todo!', result);

        return item as TodoItem;
    }

    async deleteTodo(id: string, userId: string): Promise<string> {
        console.log("Deleting todo");

        const parameters = {
            TableName: this.tableName,
            Key: {
                "userId": userId,
                "todoId": id
            },
        };

        const result = await this.dynamoClient.delete(parameters).promise();
        console.log('deleted', result);

        return "" as string;
    }

    async getTodos(id: string): Promise<TodoItem[]> {
        console.log("Getting all todo");

        const parameters = {
            TableName: this.tableName,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": id
            }
        };

        const result = await this.dynamoClient.query(parameters).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        console.log("Updating todo");

        const parameters = {
            TableName: this.tableName,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #var1 = :a, #var2 = :b, #var3 = :c",
            ExpressionAttributeNames: {
                "#var1": "name",
                "#var2": "dueDate",
                "#var3": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.dynamoClient.update(parameters).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }
}